// app.js : tableau de bord. Charge tout une fois, puis redessine localement quand le scenario change.
import { SCENARIOS, getSeries, afficherMaj } from './api.js';
import * as C from './charts.js';

const MODES = ['marche', 'taxi', 'moto_taxi', 'bus', 'voiture'];
const vide = code => ({ indicateur: { code, nom: code, unite: '', perimetre: 'yaounde' }, points: [] });
let donnees = null;
let scenario = 'tendanciel';

async function charger(code) {
  try { return await getSeries(code); }
  catch (e) { console.error(e); return { ...vide(code), erreur: true }; }
}

async function chargerTout() {
  const [pop, voit, emis, nb, tues, ...modes] = await Promise.all([
    charger('population'), charger('parc_voitures'), charger('emissions_transport'),
    charger('accidents_nombre_national'), charger('accidents_tues_national'),
    ...MODES.map(m => charger('part_modale_' + m)),
  ]);
  return { pop, voit, emis, nb, tues, parts: Object.fromEntries(MODES.map((m, i) => [m, modes[i]])) };
}

function dessiner() {
  const d = donnees;
  C.dessinerG1(d.pop, scenario);
  C.dessinerG2(d.parts, scenario);
  C.dessinerG3(d.voit, scenario);
  C.dessinerG4(d.nb, d.tues);
  C.dessinerG5(d.emis, scenario);
  document.getElementById('scenario-aide').textContent = SCENARIOS[scenario].aide;
}

function creerSelecteur() {
  const conteneur = document.getElementById('scenarios');
  conteneur.innerHTML = Object.entries(SCENARIOS).map(([code, s]) =>
    `<label style="--couleur:${s.couleur}"><input type="radio" name="scenario" value="${code}" ${code === scenario ? 'checked' : ''}><span>${s.nom}</span></label>`).join('');
  conteneur.addEventListener('change', e => { scenario = e.target.value; dessiner(); });
}

creerSelecteur();
afficherMaj();
donnees = await chargerTout();
dessiner();
window.addEventListener('resize', C.redimensionner);
