// map.js : carte MapLibre. Chaque couche est chargee depuis l'API seulement a son activation (FN4).
import { getCouche, afficherMaj } from './api.js';

const STYLE_FOND = 'https://tiles.openfreemap.org/styles/liberty';   // DEC-06 : pas de tuiles tile.openstreetmap.org
const CENTRE = [11.5021, 3.848];                                     // Yaounde
const SEUIL_COUCHE_INCOMPLETE = 30;                                  // guide 4.4 : arrets

// Description des couches. type = type de rendu MapLibre.
const COUCHES = {
  arrondissements: { nom: 'Arrondissements', couleur: '#0b5d6b', type: 'fill', legende: [['#0b5d6b', 'Limites des arrondissements']] },
  routes: { nom: 'Routes', couleur: '#d55e00', type: 'line', legende: [['#d55e00', 'Voies principales (trait épais) et secondaires (trait fin)']] },
  equipements: { nom: 'Équipements', type: 'circle', champ: 'categorie',
    legende: [['#cc79a7', 'Santé'], ['#0072b2', 'Éducation'], ['#e69f00', 'Marché']],
    couleurs: { sante: '#cc79a7', education: '#0072b2', marche: '#e69f00' } },
  arrets: { nom: 'Arrêts et gares routières', type: 'circle', champ: 'type',
    legende: [['#009e73', 'Arrêt de bus'], ['#d55e00', 'Gare routière'], ['#56b4e9', 'Station de taxi']],
    couleurs: { arret_bus: '#009e73', gare_routiere: '#d55e00', station_taxi: '#56b4e9' } },
  population: { nom: 'Densité de population', type: 'fill', champ: 'densite_hab_km2',
    legende: [['#fee8c8', 'Faible'], ['#fdbb84', 'Moyenne'], ['#e34a33', 'Forte']] },
};

const carte = new maplibregl.Map({ container: 'carte', style: STYLE_FOND, center: CENTRE, zoom: 11, attributionControl: { compact: true } });
carte.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
carte.addControl(new maplibregl.ScaleControl(), 'bottom-left');

const etat = {};   // code -> { chargee, visible }
const idsCouche = code => [`${code}-remplissage`, `${code}-ligne`, `${code}-points`].filter(id => carte.getLayer(id));

function ajouterCouche(code, geojson) {
  const c = COUCHES[code];
  carte.addSource(code, { type: 'geojson', data: geojson });
  if (c.type === 'fill' && code === 'arrondissements') {
    carte.addLayer({ id: `${code}-remplissage`, source: code, type: 'fill', paint: { 'fill-color': c.couleur, 'fill-opacity': 0.08 } });
    carte.addLayer({ id: `${code}-ligne`, source: code, type: 'line', paint: { 'line-color': c.couleur, 'line-width': 2 } });
  } else if (code === 'population') {
    carte.addLayer({ id: `${code}-remplissage`, source: code, type: 'fill', paint: {
      'fill-opacity': 0.65, 'fill-color': ['interpolate', ['linear'], ['get', 'densite_hab_km2'], 0, '#fee8c8', 5000, '#fdbb84', 15000, '#e34a33'] } });
  } else if (c.type === 'line') {
    carte.addLayer({ id: `${code}-ligne`, source: code, type: 'line', paint: {
      'line-color': c.couleur, 'line-width': ['match', ['get', 'classe'], ['motorway', 'trunk', 'primary'], 4, 'secondary', 2.5, 1.2] } });
  } else if (c.type === 'circle') {
    const couleur = ['match', ['get', c.champ], ...Object.entries(c.couleurs).flat(), '#666666'];
    carte.addLayer({ id: `${code}-points`, source: code, type: 'circle', paint: { 'circle-radius': 6, 'circle-color': couleur, 'circle-stroke-width': 1.5, 'circle-stroke-color': '#fff' } });
  }
  idsCouche(code).forEach(id => carte.on('click', id, e => afficherInfo(e)));
  idsCouche(code).forEach(id => { carte.on('mouseenter', id, () => carte.getCanvas().style.cursor = 'pointer'); carte.on('mouseleave', id, () => carte.getCanvas().style.cursor = ''); });
}

// Info-bulle : proprietes de l'objet clique. textContent => pas d'injection HTML.
function afficherInfo(e) {
  const f = e.features[0];
  const div = document.createElement('div');
  const titre = document.createElement('strong');
  titre.textContent = f.properties.nom || 'Sans nom';
  div.append(titre);
  Object.entries(f.properties).filter(([k]) => k !== 'nom').forEach(([k, v]) => {
    const p = document.createElement('div');
    p.textContent = `${k.replace(/_/g, ' ')} : ${v}`;
    div.append(p);
  });
  new maplibregl.Popup().setLngLat(e.lngLat).setDOMContent(div).addTo(carte);
}

function majLegende() {
  const actives = Object.keys(etat).filter(c => etat[c].visible);
  const el = document.getElementById('legende');
  el.innerHTML = actives.length ? '<strong>Légende</strong>' : '<em>Aucune couche affichée.</em>';
  actives.forEach(code => {
    const ul = document.createElement('ul');
    const t = document.createElement('li'); t.innerHTML = `<b>${COUCHES[code].nom}</b>`; ul.append(t);
    COUCHES[code].legende.forEach(([couleur, texte]) => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="puce" style="background:${couleur}"></span>`;
      li.append(texte); ul.append(li);
    });
    el.append(ul);
  });
}

async function basculer(code, case_, avert) {
  etat[code] ??= { chargee: false, visible: false };
  const visible = case_.checked;
  try {
    if (visible && !etat[code].chargee) {            // chargement a la demande
      const geo = await getCouche(code);
      ajouterCouche(code, geo);
      etat[code].chargee = true;
      if (code === 'arrets' && geo.features.length < SEUIL_COUCHE_INCOMPLETE) {
        avert.textContent = `Couche incomplète : ${geo.features.length} objets seulement (le transport informel n'a pas d'arrêts).`;
        avert.hidden = false;
      }
    }
    idsCouche(code).forEach(id => carte.setLayoutProperty(id, 'visibility', visible ? 'visible' : 'none'));
    etat[code].visible = visible;
  } catch (err) {
    console.error(err);
    case_.checked = false;
    avert.textContent = 'Impossible de charger cette couche. Réessayez plus tard.';
    avert.hidden = false;
  }
  majLegende();
}

function creerPanneau() {
  const liste = document.getElementById('liste-couches');
  Object.entries(COUCHES).forEach(([code, c]) => {
    const wrap = document.createElement('div');
    const label = document.createElement('label');
    label.className = 'couche';
    const input = document.createElement('input'); input.type = 'checkbox'; input.id = 'couche-' + code;
    label.append(input, c.nom);
    const avert = document.createElement('p'); avert.className = 'avertissement'; avert.hidden = true;
    input.addEventListener('change', () => basculer(code, input, avert));
    wrap.append(label, avert); liste.append(wrap);
  });
  document.getElementById('tout-masquer').addEventListener('click', () => {
    Object.keys(COUCHES).forEach(code => {
      const i = document.getElementById('couche-' + code);
      if (i.checked) { i.checked = false; i.dispatchEvent(new Event('change')); }
    });
  });
  majLegende();
}

creerPanneau();
afficherMaj();
