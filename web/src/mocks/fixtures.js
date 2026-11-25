// ⚠️ DONNÉES DE TEST (FICTIVES) : servent uniquement à valider l'affichage.
// Elles imitent le format du contrat A. À remplacer par getIndicateur()/getIndicateurs() dès que P1/P3 livrent.
// L'interpolation faite ici SIMULE la sortie de P1 : dans la vraie version, React ne calcule rien.
export const SOURCE_TEST = "Données de test (fictives)";

// cles = { annee: valeur } pour les années-source ; sauf = années à laisser vides (trou)
function annuel(cles, sauf = []) {
  const ans = Object.keys(cles).map(Number).sort((a, b) => a - b);
  const out = [];
  ans.forEach((an, i) => {
    out.push({ annee: an, valeur: cles[an], origine: "fichier" });
    const suivant = ans[i + 1];
    for (let a = an + 1; suivant && a < suivant; a++) {
      if (sauf.includes(a)) continue;
      const t = (a - an) / (suivant - an);
      out.push({ annee: a, valeur: Math.round(cles[an] + (cles[suivant] - cles[an]) * t), origine: "interpole" });
    }
  });
  return out.map((p) => ({ ...p, scenario: "historique" }));
}

const ind = (code, libelle, unite, series) => ({ code, libelle, unite, source: SOURCE_TEST, series });

// ---------- RÉTROSPECTIF : historique 2008 → 2025 ----------
export const RETRO = {
  population: ind("population", "Population de l'aire métropolitaine", "habitants",
    annuel({ 2008: 2300000, 2013: 2900000, 2018: 3300000, 2025: 4000000 })),
  parcVoitures: ind("parc_voitures", "Voitures", "véhicules",
    annuel({ 2008: 80000, 2013: 110000, 2018: 190000, 2025: 260000 })),
  parcMotos: ind("parc_moto_taxis", "Moto-taxis", "véhicules",
    annuel({ 2008: 20000, 2013: 45000, 2018: 80000, 2025: 120000 }, [2010, 2011])), // trou volontaire
  motorisation: ind("motorisation", "Taux de motorisation", "véhicules pour 1 000 habitants",
    annuel({ 2008: 35, 2013: 38, 2018: 58, 2025: 65 })),
  // parts modales : années d'enquête seulement (pas d'interpolation)
  modes: [
    ["marche", "Marche", { 2008: 35, 2013: 34, 2018: 33, 2025: 31 }],
    ["taxi", "Taxi", { 2008: 42, 2013: 41, 2018: 40, 2025: 38 }],
    ["moto_taxi", "Moto-taxi", { 2008: 8, 2013: 10, 2018: 12, 2025: 15 }],
    ["bus", "Bus", { 2008: 6, 2013: 6, 2018: 5, 2025: 5 }],
    ["voiture", "Voiture", { 2008: 9, 2013: 9, 2018: 10, 2025: 11 }],
  ].map(([code, libelle, cles]) => ind("part_modale_" + code, libelle, "%",
    Object.entries(cles).map(([a, v]) => ({ annee: +a, valeur: v, scenario: "historique", origine: "fichier" })))),
};

// ---------- PROSPECTIF : 2026 → 2036 (2036 = extrapolée) ----------
function prospectif(code, libelle, unite, hist, v2025, cibles) {
  const series = annuel(hist).filter((p) => p.annee <= 2025);
  Object.entries(cibles).forEach(([scenario, v2036]) => {
    for (let a = 2026; a <= 2036; a++) {
      const valeur = Math.round(v2025 + ((v2036 - v2025) * (a - 2025)) / 11);
      const origine = scenario === "rupture" ? "construit" : a === 2036 ? "extrapole" : "interpole";
      series.push({ annee: a, valeur, scenario, origine });
    }
  });
  return ind(code, libelle, unite, series);
}

export const PROSPECTIF = [
  prospectif("population", "Population de l'aire métropolitaine", "habitants",
    { 2008: 2300000, 2013: 2900000, 2018: 3300000, 2025: 4000000 }, 4000000,
    { tendanciel: 5700000, volontariste: 6000000, rupture: 5200000 }),
  prospectif("parc_voitures", "Parc de voitures", "véhicules",
    { 2008: 80000, 2013: 110000, 2018: 190000, 2025: 260000 }, 260000,
    { tendanciel: 420000, volontariste: 330000 }), // pas de rupture : couverture partielle
  prospectif("motorisation", "Taux de motorisation", "véhicules pour 1 000 habitants",
    { 2008: 35, 2013: 38, 2018: 58, 2025: 65 }, 65,
    { tendanciel: 75, volontariste: 55, rupture: 45 }),
  prospectif("ges_transport", "Émissions de GES du transport", "kt CO2e",
    { 2018: 900, 2025: 1140 }, 1140,
    { tendanciel: 2000, volontariste: 1480, rupture: 900 }),
];
