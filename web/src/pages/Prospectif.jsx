import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getIndicateurs, getIndicateur } from "../api/client";
import IndicatorChart from "../components/IndicatorChart";
import { SCENARIO_COLORS } from "../components/palette";

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
    return (
      <div className="container page">
        {error
          ? <div className="state state--box" role="alert"><h2>Données indisponibles</h2><p>{error}</p></div>
          : <div className="skeleton" style={{ height: 480 }} aria-busy="true" />}
      </div>
    );
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
    <div className="container page">
      <header className="page-head">
        <span className="kicker">Horizon 2026 – 2036</span>
        <h1>Prospective</h1>
        <p className="lead">
          Trois scénarios de modèle sont comparés. Ce sont des trajectoires simulées, pas des
          observations : leurs hypothèses sont détaillées dans la{" "}
          <Link to="/methodologie#sources">méthodologie</Link>.
        </p>
      </header>

      <div className="card toolbar">
        <label className="field">
          <span className="field-label">Thème</span>
          <select className="select" value={theme} onChange={(e) => changerTheme(e.target.value)}>
            {themesDispos.map(([t, nom]) => <option key={t} value={t}>{nom}</option>)}
          </select>
        </label>

        <label className="field">
          <span className="field-label">Indicateur</span>
          <select className="select" value={code} onChange={(e) => setCode(e.target.value)}>
            {indicateursDuTheme.map((i) => <option key={i.code} value={i.code}>{etiquette(i)} ({i.unite})</option>)}
          </select>
        </label>

        <div className="toolbar-row" role="group" aria-labelledby="courbes-label">
          <span id="courbes-label" className="field-label">Courbes</span>
          {SCENARIOS.map(([s, nom]) => {
            const dispo = presents.has(s);
            const actif = dispo && choisis.includes(s);
            return (
              <button
                key={s}
                type="button"
                className="scenario-toggle"
                aria-pressed={actif}
                disabled={!dispo}
                title={dispo ? undefined : "Non disponible pour cet indicateur"}
                style={actif ? { background: SCENARIO_COLORS[s], borderColor: SCENARIO_COLORS[s] } : { borderColor: SCENARIO_COLORS[s] }}
                onClick={() => basculer(s)}
              >
                {nom}
              </button>
            );
          })}
          {aHistorique && Number.isFinite(debutScenarios) && (
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              onClick={() => setAvecHistorique((v) => !v)}
              aria-pressed={!avecHistorique}
              style={{ marginLeft: "auto" }}
            >
              {avecHistorique ? `Zoomer sur ${debutScenarios}–2036` : "Réafficher l'historique"}
            </button>
          )}
        </div>
      </div>

      <div className="stack" style={{ gap: "0.75rem", marginBottom: "1rem" }}>
        {absents.length > 0 && indicateur && (
          <p role="note" className="notice">
            Non disponible pour cet indicateur : scénario {absents.join(", ").toLowerCase()}.
          </p>
        )}
        {superposes.length > 0 && !loading && (
          <p role="note" className="notice notice--warn">
            {superposes.join(" ; ")} : même trajectoire dans le modèle pour cet indicateur, les courbes se
            superposent. Le zoom ne les séparera pas.
          </p>
        )}
        {error && <p role="alert" className="notice notice--error">Erreur : {error}</p>}
      </div>

      {loading || !filtre
        ? <div className="skeleton" style={{ height: 480 }} aria-busy="true" />
        : <IndicatorChart indicator={filtre} titre={`${indicateur.libelle} — ${NOM_THEME[themeDe(indicateur)]}`} grand />}
    </div>
  );
}
