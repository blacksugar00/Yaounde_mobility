import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { getIndicateur } from "../api/client";
import IndicatorChart from "../components/IndicatorChart";
import StackedBarChart from "../components/StackedBarChart";
import MultiIndicatorChart from "../components/MultiIndicatorChart";

const ANNEE_MAX = 2025;
const ANNEES_REFERENCE = [2000, 2005, 2010, 2018, 2025];

const RETRO_SCENARIO_LABELS = {
  historique: "Historique (2000–2018)",
  tendanciel: "Tendance observée (2018–2025)",
};

const CODES = {
  population: "1.1__population_urbaine_de_l_aire_metropolitaine",
  modes: [
    "part_modale__marche",
    "part_modale__motos_taxis",
    "part_modale__taxi_collectif",
    "part_modale__voiture_particuliere",
    "part_modale__bus_public",
  ],
  parc: ["1.7__voiture_particuliere", "1.7__motos_taxis"],
  motorisation: "1.7__taux_de_motorisation_hors_motos_pour_mille",
};

// Rétrospective = historique + tendance jusqu'en 2025
const filtrerRetro = (ind) =>
  ind && {
    ...ind,
    series: ind.series.filter(
      (p) => p.annee <= ANNEE_MAX && (p.scenario === "historique" || p.scenario === "tendanciel"),
    ),
  };

// Une seule valeur par année : la valeur historique si elle existe, sinon la tendance
function serieUnique(ind) {
  const parAnnee = new Map();
  ind.series.forEach((p) => {
    if (!parAnnee.has(p.annee) || p.scenario === "historique") parAnnee.set(p.annee, p);
  });
  return { ...ind, series: [...parAnnee.values()].sort((a, b) => a.annee - b.annee) };
}

// Les parts modales sont stockées en fraction (0–1) : affichage en pourcentage, sans arrondi
function enPourcentage(ind) {
  const estFraction = /fraction/i.test(ind.unite);
  return {
    ...ind,
    unite: "%",
    libelle: ind.libelle.replace(/^Part modale\s*:\s*/i, ""),
    series: ind.series.map((p) => ({ ...p, valeur: estFraction ? p.valeur * 100 : p.valeur })),
  };
}

export default function Retrospectif() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let actif = true;
    Promise.all([
      getIndicateur(CODES.population),
      Promise.all(CODES.modes.map((c) => getIndicateur(c))),
      Promise.all(CODES.parc.map((c) => getIndicateur(c))),
      getIndicateur(CODES.motorisation),
    ])
      .then(([pop, modes, parc, motorisation]) => {
        if (!actif) return;
        setData({
          population: filtrerRetro(pop),
          modes: modes.map((m) => enPourcentage(serieUnique(filtrerRetro(m)))),
          parc: parc.map((p) => serieUnique(filtrerRetro(p))),
          motorisation: filtrerRetro(motorisation),
        });
      })
      .catch((err) => {
        if (actif) setError(err.message);
      });
    return () => {
      actif = false;
    };
  }, []);

  return (
    <div className="container page">
      <header className="page-head">
        <span className="kicker">Analyse historique 2000 – 2025</span>
        <h1>Rétrospective de la mobilité</h1>
        <p className="lead">
          Dynamique démographique, évolution des modes de déplacement et croissance du parc
          de véhicules à Yaoundé jusqu'en 2025.
        </p>
      </header>

      {error && (
        <div className="state state--box" role="alert">
          <h2>Données rétrospectives indisponibles</h2>
          <p>{error}</p>
        </div>
      )}

      {!error && !data && (
        <div className="grid grid-2" aria-busy="true">
          {[0, 1, 2, 3].map((k) => (
            <div key={k} className="skeleton" style={{ height: 380 }} />
          ))}
        </div>
      )}

      {data && (
        <div className="grid grid-2 reveal">
          <IndicatorChart
            indicator={data.population}
            titre="Population urbaine de l'aire métropolitaine"
            showBadges={false}
            scenarioLabels={RETRO_SCENARIO_LABELS}
          />
          <StackedBarChart
            indicators={data.modes}
            titre="Parts modales des déplacements"
            source={data.modes[0]?.source}
            annees={ANNEES_REFERENCE}
          />
          <MultiIndicatorChart
            indicators={data.parc.map((p, i) => ({ ...p, libelle: ["Voitures particulières", "Motos-taxis"][i] }))}
            titre="Parc de véhicules"
            unite="véhicules"
            source={data.parc[0]?.source}
          />
          <IndicatorChart
            indicator={data.motorisation}
            titre="Taux de motorisation (hors motos)"
            showBadges={false}
            scenarioLabels={RETRO_SCENARIO_LABELS}
          />
        </div>
      )}

      <nav className="next-links" aria-label="Poursuivre l'exploration">
        <Link to="/prospectif" className="next-link">
          <div>
            <strong>Projections 2026 – 2036</strong>
            <span>Comparer les scénarios tendanciel, volontariste et rupture.</span>
          </div>
          <ArrowRight size={20} className="arrow" aria-hidden="true" />
        </Link>
        <Link to="/carte" className="next-link">
          <div>
            <strong>Cartographie</strong>
            <span>Population par quartier, réseau de bus et projets de voirie.</span>
          </div>
          <ArrowRight size={20} className="arrow" aria-hidden="true" />
        </Link>
      </nav>
    </div>
  );
}
