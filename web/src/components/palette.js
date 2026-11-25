// Couleurs des séries qui ne sont PAS des scénarios (la palette des scénarios reste dans ChartCard).
export const CATEGORY_COLORS = ["#34495e", "#8e44ad", "#c0392b", "#16a085", "#b7950b"];
export const ORIGINE_LABELS = {
  fichier: "valeur source",
  interpole: "interpolée",
  extrapole: "extrapolée",
  construit: "hypothèse",
};
export const formatNombre = (n) => new Intl.NumberFormat("fr-FR").format(n);
export const estEstime = (point) => ["interpole", "extrapole"].includes(point?.origine);
