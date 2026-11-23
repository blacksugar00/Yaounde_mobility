// api.js : SEUL fichier qui connait les URL. Pour passer a la vraie API : USE_MOCK = false.
export const CONFIG = {
  USE_MOCK: true,          // true = JSON factices dans web/mock/
  API_BASE: '/api',        // Nginx redirige /api vers FastAPI
  MOCK_BASE: 'mock',
};

export const SCENARIOS = {
  tendanciel:   { nom: 'Tendanciel',   couleur: '#e69f00', aide: 'Les tendances actuelles se poursuivent, sans politique nouvelle.' },
  volontariste: { nom: 'Volontariste', couleur: '#0072b2', aide: 'Des politiques de mobilité durable sont mises en œuvre progressivement.' },
  rupture:      { nom: 'Rupture',      couleur: '#009e73', aide: 'Transformation rapide du système de mobilité (hypothèse).' },
};

async function getJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Erreur ${r.status} sur ${url}`);
  return r.json();
}

// Renvoie { indicateur, points:[{annee,valeur,scenario,statut,source_id,note}] }.
// Sans scenario : tous les scenarios. Un indicateur sans donnee renvoie points: [].
export async function getSeries(code, scenario) {
  if (CONFIG.USE_MOCK) {
    const d = await getJSON(`${CONFIG.MOCK_BASE}/series_${code}.json`);
    if (scenario) d.points = d.points.filter(p => p.scenario === 'historique' || p.scenario === scenario);
    return d;
  }
  const q = scenario ? `?scenario=${encodeURIComponent(scenario)}` : '';
  return getJSON(`${CONFIG.API_BASE}/series/${encodeURIComponent(code)}${q}`);
}

export const getIndicateurs = () => getJSON(`${CONFIG.API_BASE}/indicateurs`);
export const getCouches = () => getJSON(`${CONFIG.API_BASE}/couches`);

export async function getCouche(nom, arrondissement) {
  if (CONFIG.USE_MOCK) return getJSON(`${CONFIG.MOCK_BASE}/couche_${nom}.json`);
  const q = arrondissement ? `?arrondissement=${encodeURIComponent(arrondissement)}` : '';
  return getJSON(`${CONFIG.API_BASE}/couches/${encodeURIComponent(nom)}${q}`);
}

export async function getMeta() {
  return getJSON(CONFIG.USE_MOCK ? `${CONFIG.MOCK_BASE}/meta.json` : `${CONFIG.API_BASE}/meta`);
}

// Pied de page : date de derniere mise a jour (FN9)
export async function afficherMaj() {
  const el = document.getElementById('maj');
  if (!el) return;
  try {
    const m = await getMeta();
    if (m.mock) { el.textContent = 'Données factices de développement : ne pas utiliser pour une démonstration.'; return; }
    const d = new Date(m.derniere_maj);
    el.textContent = 'Dernière mise à jour des données : ' + d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch { el.textContent = 'Date de mise à jour indisponible.'; }
}
