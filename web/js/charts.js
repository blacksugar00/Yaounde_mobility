// charts.js : creation des graphiques ECharts. Necessite le global `echarts` (vendor/echarts.min.js).
import { SCENARIOS } from './api.js';

const COULEUR_HIST = '#4a6069';
const MODES = {
  marche:    { nom: 'Marche',    couleur: '#56b4e9' },
  taxi:      { nom: 'Taxi',      couleur: '#e69f00' },
  moto_taxi: { nom: 'Moto-taxi', couleur: '#d55e00' },
  bus:       { nom: 'Bus',       couleur: '#0072b2' },
  voiture:   { nom: 'Voiture',   couleur: '#999999' },
};
const STATUTS = { mesure: 'mesuré', estime: 'estimé', projete: 'projeté' };
const PERIMETRES = { yaounde: 'Yaoundé', agglomeration_onu: 'agglomération (définition ONU)', national: 'Cameroun entier' };
const fmt = n => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(n);

const instances = {};
function graphique(id) {
  const el = document.getElementById(id);
  instances[id] ??= echarts.init(el, null, { renderer: 'svg' });
  return instances[id];
}
export function redimensionner() { Object.values(instances).forEach(c => c.resize()); }

// Source, unite, statut, perimetre sous chaque graphique (FN6)
function legendeSource(id, series, extra = '') {
  const pts = series.flatMap(s => s.points);
  const sources = [...new Set(pts.map(p => p.source_id))].join(', ') || '—';
  const statuts = [...new Set(pts.map(p => p.statut))].map(s => `<span class="badge${s === 'projete' ? ' badge-projete' : ''}">${STATUTS[s]}</span>`).join(' ') || '—';
  const unite = [...new Set(series.map(s => s.indicateur.unite))].join(', ');
  const per = [...new Set(series.map(s => PERIMETRES[s.indicateur.perimetre]))].join(', ');
  const notes = [...new Set(pts.map(p => p.note).filter(Boolean))];
  document.getElementById('s-' + id).innerHTML =
    `<b>Source :</b> ${sources} · <b>Unité :</b> ${unite} · <b>Statut :</b> ${statuts} · <b>Périmètre :</b> ${per}` +
    (notes.length ? `<br><b>Note :</b> ${notes.join(' ; ')}` : '') + extra;
}

// Affiche un message a la place du graphique quand il n'y a aucune donnee
function vide(id, series) {
  const aucune = series.every(s => s.points.length === 0);
  document.getElementById(id).style.display = aucune ? 'none' : '';
  const m = document.getElementById('m-' + id);
  m.classList.toggle('visible', aucune);
  m.textContent = aucune ? 'Données indisponibles pour cet indicateur.' : '';
  if (aucune) legendeSource(id, series.length ? series : []);
  return aucune;
}

const base = { grid: { left: 56, right: 16, top: 40, bottom: 40 }, tooltip: { trigger: 'axis' }, legend: { top: 0, type: 'scroll' } };
const axeAnnee = (annees) => ({ type: 'category', data: annees, boundaryGap: false });
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

function indexParAnnee(points) { return new Map(points.map(p => [p.annee, p.valeur])); }

// Courbe historique (trait plein) + une courbe projetee (pointillee) par scenario
function courbes(series, scenarioChoisi, scenarios) {
  const pts = series.points;
  const annees = range(Math.min(...pts.map(p => p.annee)), Math.max(...pts.map(p => p.annee)));
  const hist = pts.filter(p => p.scenario === 'historique');
  const dernier = hist.length ? hist.reduce((a, b) => (b.annee > a.annee ? b : a)) : null;
  const out = [];
  const mapH = indexParAnnee(hist);
  out.push({ name: 'Historique', type: 'line', connectNulls: true, symbolSize: 7, color: COULEUR_HIST,
    data: annees.map(a => mapH.has(a) ? mapH.get(a) : null) });
  for (const s of scenarios) {
    const proj = pts.filter(p => p.scenario === s);
    if (!proj.length) continue;
    const m = indexParAnnee(proj);
    const choisi = s === scenarioChoisi;
    out.push({ name: SCENARIOS[s].nom, type: 'line', color: SCENARIOS[s].couleur, connectNulls: true, symbol: 'none',
      lineStyle: { type: 'dashed', width: choisi ? 4 : 2, opacity: choisi ? 1 : 0.35 },
      data: annees.map(a => m.has(a) ? m.get(a) : (dernier && a === dernier.annee ? dernier.valeur : null)) });
  }
  return { annees, out };
}

// G1 : population (identique dans les 3 scenarios, une seule courbe projetee)
export function dessinerG1(s, scenario) {
  if (vide('g1', [s])) return;
  const { annees, out } = courbes(s, scenario, [scenario]);
  graphique('g1').setOption({ ...base, xAxis: axeAnnee(annees), yAxis: { type: 'value', name: s.indicateur.unite, axisLabel: { formatter: v => fmt(v) } }, series: out }, true);
  legendeSource('g1', [s]);
}

// G2 : parts modales, barres empilees pour le scenario choisi
export function dessinerG2(seriesParMode, scenario) {
  const liste = Object.entries(seriesParMode);
  if (vide('g2', liste.map(([, s]) => s))) return;
  const annees = [...new Set(liste.flatMap(([, s]) => s.points.filter(p => p.scenario === 'historique' || p.scenario === scenario).map(p => p.annee)))].sort((a, b) => a - b);
  const series = liste.map(([mode, s]) => {
    const m = indexParAnnee(s.points.filter(p => p.scenario === 'historique' || p.scenario === scenario));
    return { name: MODES[mode].nom, type: 'bar', stack: 'total', color: MODES[mode].couleur, data: annees.map(a => m.has(a) ? +m.get(a).toFixed(1) : null) };
  });
  graphique('g2').setOption({ ...base, grid: { ...base.grid, bottom: 56 },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: v => v == null ? '—' : v + ' %' },
    xAxis: { type: 'category', data: annees }, yAxis: { type: 'value', max: 100, name: '%' }, series }, true);
  legendeSource('g2', liste.map(([, s]) => ({ ...s, points: s.points.filter(p => p.scenario === 'historique' || p.scenario === scenario) })),
    '<br>Le total fait 100 % pour chaque année.');
}

// G3 : parc de voitures, un scenario mis en evidence
export function dessinerG3(s, scenario) {
  if (vide('g3', [s])) return;
  const { annees, out } = courbes(s, scenario, Object.keys(SCENARIOS));
  graphique('g3').setOption({ ...base, xAxis: axeAnnee(annees), yAxis: { type: 'value', name: s.indicateur.unite, axisLabel: { formatter: v => fmt(v) } }, series: out }, true);
  legendeSource('g3', [s]);
}

// G4 : accidents nationaux. Les annees sans donnee restent vides (pas d'interpolation).
export function dessinerG4(nombre, tues) {
  if (vide('g4', [nombre, tues])) return;
  const pts = [...nombre.points, ...tues.points];
  const annees = range(Math.min(...pts.map(p => p.annee)), Math.max(...pts.map(p => p.annee)));
  const mk = (s, couleur) => { const m = indexParAnnee(s.points); return { name: s.indicateur.nom, type: 'bar', color: couleur, data: annees.map(a => m.has(a) ? m.get(a) : null) }; };
  graphique('g4').setOption({ ...base, tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: v => v == null ? 'pas de donnée' : fmt(v) },
    xAxis: { type: 'category', data: annees }, yAxis: { type: 'value' }, series: [mk(nombre, '#0072b2'), mk(tues, '#d55e00')] }, true);
  legendeSource('g4', [nombre, tues], '<br>Les années sans barre n\'ont pas de donnée.');
}

// G5 : emissions, 3 trajectoires comparees
export function dessinerG5(s, scenario) {
  if (vide('g5', [s])) return;
  const { annees, out } = courbes(s, scenario, Object.keys(SCENARIOS));
  graphique('g5').setOption({ ...base, xAxis: axeAnnee(annees), yAxis: { type: 'value', name: s.indicateur.unite, axisLabel: { formatter: v => fmt(v) } }, series: out }, true);
  legendeSource('g5', [s]);
}
