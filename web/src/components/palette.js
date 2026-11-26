// Couleurs officielles des scénarios (Contrat D) — ne pas modifier.
export const SCENARIO_COLORS = {
  historique: "#7f8c8d",
  tendanciel: "#E67E22",
  volontariste: "#27AE60",
  rupture: "#2980B9",
};

// Couleurs des séries qui ne sont PAS des scénarios (accordées à la palette institutionnelle).
export const CATEGORY_COLORS = ["#135c41", "#c8901a", "#a6201b", "#3d6e8f", "#7a6a55", "#5f6b66"];

// Thème commun des graphiques
export const CHART_THEME = {
  font: "'Inter', system-ui, sans-serif",
  ink: "#3a423e",
  text: "#646d68",
  grid: "rgba(26, 31, 28, 0.07)",
  axis: "#c4cbc6",
  tooltip: "#0b3326",
};

export const ORIGINE_LABELS = {
  fichier: "valeur source",
  interpole: "interpolée",
  extrapole: "extrapolée",
  construit: "hypothèse",
  recalcule: "recalculée",
};

export const formatNombre = (n, maximumFractionDigits = 2) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits }).format(n);

// Graduations d'axe lisibles : 1 250 000 -> « 1,25 M », 45 000 -> « 45 k »
export function formatAxe(value) {
  const v = Number(value);
  if (!Number.isFinite(v)) return value;
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${formatNombre(v / 1_000_000, 2)} M`;
  if (abs >= 10_000) return `${formatNombre(v / 1_000, 0)} k`;
  return formatNombre(v, 2);
}

export const estEstime = (point) => ["interpole", "extrapole"].includes(point?.origine);

export const NOTE_POINTILLES = "Trait pointillé : valeurs interpolées ou extrapolées entre les années de référence.";
