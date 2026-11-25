// Couleurs officielles des scénarios (Contrat D)
export const SCENARIO_COLORS = {
  historique: "#7f8c8d",
  tendanciel: "#E67E22",
  volontariste: "#27AE60",
  rupture: "#2980B9",
};

// Couleurs des séries qui ne sont PAS des scénarios.
export const CATEGORY_COLORS = ["#34495e", "#8e44ad", "#c0392b", "#16a085", "#b7950b"];
export const ORIGINE_LABELS = {
  fichier: "valeur source",
  interpole: "interpolée",
  extrapole: "extrapolée",
  construit: "hypothèse",
};
export const formatNombre = (n) => new Intl.NumberFormat("fr-FR").format(n);
export const estEstime = (point) => ["interpole", "extrapole"].includes(point?.origine);
