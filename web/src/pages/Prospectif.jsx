import { useEffect, useState } from "react";
import { getIndicateurs, getIndicateur } from "../api/client";
import IndicatorChart from "../components/IndicatorChart";

const SCENARIOS = [["tendanciel", "Tendanciel"], ["volontariste", "Volontariste"], ["rupture", "Rupture"]];

// Thèmes : l'API ne les fournit pas, on les déduit du code (et de l'unité pour le préfixe 4.2__,
// partagé entre les GES et les temps de parcours).
const THEMES = [
  ["population", "Population et mobilité"],
  ["deplacements", "Déplacements par mode"],
  ["parts_modales", "Parts modales"],
  ["parc", "Parc de véhicules"],
  ["ges", "Émissions de GES"],
  ["temps", "Temps de déplacement"],
  ["corridors", "Corridors"],
  ["autres", "Autres"],
];
const NOM_THEME = Object.fromEntries(THEMES);

// Noms courts, pour distinguer dans les menus des indicateurs qui portent le même libellé
const THEME_COURT = {
  population: "Population",
  deplacements: "Déplacements",
  parts_modales: "Parts modales",
  parc: "Parc",
  ges: "GES",
  temps: "Temps",
  corridors: "Corridors",
  autres: "Autres",
};

function themeDe({ code, unite = "" }) {
  if (code.startsWith("part_modale__")) return "parts_modales";
  if (code.startsWith("corridors__")) return "corridors";
  if (code.startsWith("ges_")) return "ges";
  if (code.startsWith("1.1__")) return "population";
  if (code.startsWith("1.2__")) return "deplacements";
  if (code.startsWith("1.7__")) return "parc";
  if (code.startsWith("4.2__")) return unite.startsWith("kg") ? "ges" : "temps";
  return "autres";
}

// Indicateur ouvert par défaut : ses trois scénarios ont des trajectoires différentes, donc comparables
const CODE_PAR_DEFAUT = "1.2__voiture_particuliere";

const champ = { padding: "0.6rem 1rem", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "1rem", marginTop: "0.35rem", maxWidth: "100%", display: "block" };

export default function Prospectif() {
  const [list, setList] = useState([]);
  const [theme, setTheme] = useState("");
  const [code, setCode] = useState("");
  const [indicateur, setIndicateur] = useState(null);
  const [choisis, setChoisis] = useState(SCENARIOS.map(([s]) => s));
  const [avecHistorique, setAvecHistorique] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 1. Charger la liste complète depuis l'API
  useEffect(() => {
    getIndicateurs()
      .then((data) => {
        setList(data);
        // Par défaut : la population (ou le premier indicateur de la liste)
        const defaut = data.find((i) => i.code === CODE_PAR_DEFAUT) ?? data[0];
        if (defaut) {
          setTheme(themeDe(defaut));
          setCode(defaut.code);
        }
      })
      .catch((err) => setError(err.message));
  }, []);

  // 2. Charger les données détaillées quand on change d'indicateur
  useEffect(() => {
    if (!code) return;
    let annule = false;
    setLoading(true);
    setError("");
    getIndicateur(code)
      .then((data) => {
        if (annule) return;
        setIndicateur(data);
        setLoading(false);
      })
      .catch((err) => {
        if (annule) return;
        setError(err.message);
        setLoading(false);
      });
    return () => { annule = true; };
  }, [code]);

  if (!list.length) {
    return error
      ? <p style={{ padding: "4rem", textAlign: "center", color: "red" }}>Erreur : {error}</p>
      : <p style={{ padding: "4rem", textAlign: "center" }}>Chargement des données depuis l'API...</p>;
  }

  // Un libellé présent dans plusieurs thèmes (ex. « Taxis » : déplacements, GES, parc) est suffixé par son thème
  const themesParLibelle = new Map();
  list.forEach((i) => {
    const themes = themesParLibelle.get(i.libelle) ?? new Set();
    themes.add(themeDe(i));
    themesParLibelle.set(i.libelle, themes);
  });
  const etiquette = (i) =>
    themesParLibelle.get(i.libelle).size > 1 ? `${i.libelle} — ${THEME_COURT[themeDe(i)]}` : i.libelle;

  const themesDispos = THEMES.filter(([t]) => list.some((i) => themeDe(i) === t));
  const indicateursDuTheme = list.filter((i) => themeDe(i) === theme);

  const changerTheme = (t) => {
    setTheme(t);
    const premier = list.find((i) => themeDe(i) === t);
    if (premier) setCode(premier.code);
  };

  const basculer = (s) => setChoisis((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  // Scénarios disponibles pour l'indicateur affiché
  const presents = new Set(indicateur?.series.map((p) => p.scenario));
  const absents = SCENARIOS.filter(([s]) => !presents.has(s)).map(([, nom]) => nom);
  const aHistorique = presents.has("historique");
  const debutScenarios = indicateur
    ? Math.min(...indicateur.series.filter((p) => p.scenario !== "historique").map((p) => p.annee))
    : null;

  // Scénarios dont les valeurs sont strictement identiques (courbes superposées) : on le signale
  const valeursDe = (s) => new Map(indicateur.series.filter((p) => p.scenario === s).map((p) => [p.annee, p.valeur]));
  const superposes = [];
  if (indicateur) {
    const affiches = SCENARIOS.filter(([s]) => presents.has(s) && choisis.includes(s));
    for (let i = 0; i < affiches.length; i++) {
      for (let j = i + 1; j < affiches.length; j++) {
        const a = valeursDe(affiches[i][0]);
        const b = valeursDe(affiches[j][0]);
        if (a.size === b.size && [...a].every(([annee, v]) => b.get(annee) === v)) {
          superposes.push(`${affiches[i][1]} et ${affiches[j][1]}`);
        }
      }
    }
  }

  // Filtre : cases des scénarios cochées + historique affiché ou non (décocher = zoom sur les scénarios)
  const filtre = indicateur && {
    ...indicateur,
    series: indicateur.series.filter((p) =>
      p.scenario === "historique" ? avecHistorique : choisis.includes(p.scenario),
    ),
  };

  return (
    <section style={{ padding: "clamp(1.25rem, 4vw, 3rem) clamp(1rem, 4vw, 2rem)", maxWidth: "1200px", margin: "0 auto" }}>

      <div className="fade-in">
        <h1 style={{ fontSize: "clamp(1.75rem, 6vw, 2.5rem)", fontWeight: 800, color: "#111827", letterSpacing: "-1px", marginBottom: "1rem" }}>
          Prospective 2026-2036
        </h1>
        <p style={{ fontSize: "1.1rem", color: "#4b5563", maxWidth: "800px", lineHeight: 1.6, marginBottom: "1.5rem" }}>
          Trois scénarios sont comparés. Ce sont des trajectoires de modèle, pas des observations : le détail de leurs
          hypothèses est présenté dans la page Méthodologie.
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <label style={{ fontWeight: 600, maxWidth: "100%" }}>
          Thème
          <select value={theme} onChange={(e) => changerTheme(e.target.value)} style={champ}>
            {themesDispos.map(([t, nom]) => <option key={t} value={t}>{nom}</option>)}
          </select>
        </label>

        <label style={{ fontWeight: 600, maxWidth: "100%" }}>
          Indicateur
          <select value={code} onChange={(e) => setCode(e.target.value)} style={champ}>
            {indicateursDuTheme.map((i) => <option key={i.code} value={i.code}>{etiquette(i)} ({i.unite})</option>)}
          </select>
        </label>

        <fieldset style={{ border: 0, padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <legend style={{ fontWeight: 600, marginBottom: "0.5rem", padding: 0 }}>Courbes affichées</legend>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            {SCENARIOS.map(([s, nom]) => (
              <label key={s} style={{ opacity: presents.has(s) ? 1 : 0.5 }}>
                <input type="checkbox" checked={choisis.includes(s)} disabled={!presents.has(s)} onChange={() => basculer(s)} /> {nom}
              </label>
            ))}
          </div>
          <label style={{ opacity: aHistorique ? 1 : 0.5 }}>
            <input type="checkbox" checked={avecHistorique} disabled={!aHistorique} onChange={(e) => setAvecHistorique(e.target.checked)} /> Historique
          </label>
        </fieldset>
      </div>

      {absents.length > 0 && indicateur && (
        <p role="note" style={{ color: "#4b5563", marginBottom: "1rem" }}>
          Non disponible pour cet indicateur : scénario {absents.join(", ").toLowerCase()}.
        </p>
      )}

      {superposes.length > 0 && !loading && (
        <p role="note" style={{ color: "#92400e", background: "#fef3c7", border: "1px solid #fde68a", borderRadius: "8px", padding: "0.5rem 0.75rem", fontSize: "0.9rem", marginBottom: "1rem" }}>
          {superposes.join(" ; ")} : même trajectoire dans le modèle pour cet indicateur, les courbes se superposent. Ce n’est pas un problème d’échelle, le zoom ne les séparera pas.
        </p>
      )}

      {error && <p role="alert" style={{ color: "red", marginBottom: "1rem" }}>Erreur : {error}</p>}

      {aHistorique && Number.isFinite(debutScenarios) && (
        <button
          type="button"
          onClick={() => setAvecHistorique((v) => !v)}
          aria-pressed={!avecHistorique}
          style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem", minHeight: "44px",
            padding: "0.55rem 1.1rem", marginBottom: "0.75rem", borderRadius: "999px", cursor: "pointer",
            fontSize: "0.95rem", fontWeight: 600, border: "1px solid #2563eb",
            background: avecHistorique ? "#fff" : "#2563eb", color: avecHistorique ? "#2563eb" : "#fff",
          }}
        >
          {avecHistorique ? `🔍 Zoom sur les scénarios (${debutScenarios}-2036)` : "↩ Réafficher l'historique"}
        </button>
      )}

      <div style={{ background: "#fff", borderRadius: "16px", padding: "1rem", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
        {loading || !filtre
          ? <p style={{ padding: "3rem", textAlign: "center" }}>Chargement des données depuis l'API...</p>
          : <IndicatorChart indicator={filtre} titre={`${indicateur.libelle} — ${NOM_THEME[themeDe(indicateur)]} (${indicateur.unite})`} />}
      </div>
    </section>
  );
}
