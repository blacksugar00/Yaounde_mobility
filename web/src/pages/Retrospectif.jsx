import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Car,
  Compass,
  Footprints,
  History,
  Map as MapIcon,
  Users,
} from "lucide-react";
import { getIndicateur } from "../api/client";
import IndicatorChart from "../components/IndicatorChart";
import StackedBarChart from "../components/StackedBarChart";
import ChartCard from "../components/ChartCard";

const RETRO_SCENARIO_LABELS = {
  historique: "Historique (2000–2018)",
  tendanciel: "Tendance observée (2019–2025)",
};

const filtrerRetro = (ind) => {
  if (!ind || !ind.series) return null;
  return {
    ...ind,
    series: ind.series.filter(
      (p) =>
        p.annee <= 2025 &&
        (p.scenario === "historique" || p.scenario === "tendanciel"),
    ),
  };
};

const derniereValeur = (ind) => {
  if (!ind?.series?.length) return null;
  return ind.series.reduce((acc, cur) => (cur.annee >= acc.annee ? cur : acc));
};

const premiereValeur = (ind) => {
  if (!ind?.series?.length) return null;
  return ind.series.reduce((acc, cur) => (cur.annee <= acc.annee ? cur : acc));
};

const formatCompact = (n) => {
  if (n == null) return "—";
  if (n >= 1_000_000) {
    return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(n / 1_000_000)} M`;
  }
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n);
};

export default function Retrospectif() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState({
    population: null,
    modes: [],
    parcVoitures: null,
    parcMotos: null,
    motorisation: null,
  });

  useEffect(() => {
    let actif = true;
    Promise.all([
      getIndicateur("1.1__population_urbaine_de_l_aire_metropolitaine"),
      getIndicateur("part_modale__marche"),
      getIndicateur("part_modale__motos_taxis"),
      getIndicateur("part_modale__voiture_particuliere"),
      getIndicateur("part_modale__taxi_collectif"),
      getIndicateur("part_modale__bus_public"),
      getIndicateur("1.7__voiture_particuliere"),
      getIndicateur("1.7__motos_taxis"),
      getIndicateur("1.7__taux_de_motorisation_hors_motos_pour_mille"),
    ])
      .then(([pop, marche, moto, voiture, taxi, bus, parcV, parcM, motoRate]) => {
        if (!actif) return;

        const modesModifies = [marche, moto, voiture, taxi, bus]
          .map((ind) => {
            const filtre = filtrerRetro(ind);
            if (!filtre) return null;
            return {
              ...filtre,
              libelle: filtre.libelle.replace(/^Part modale\s*:\s*/i, ""),
              series: filtre.series.map((p) => ({
                ...p,
                valeur:
                  p.valeur <= 1
                    ? Math.round(p.valeur * 1000) / 10
                    : Math.round(p.valeur * 10) / 10,
              })),
            };
          })
          .filter(Boolean);

        setData({
          population: filtrerRetro(pop),
          modes: modesModifies,
          parcVoitures: filtrerRetro(parcV),
          parcMotos: filtrerRetro(parcM),
          motorisation: filtrerRetro(motoRate),
        });
        setLoading(false);
      })
      .catch((err) => {
        if (!actif) return;
        setError(err.message);
        setLoading(false);
      });

    return () => {
      actif = false;
    };
  }, []);

  // Données combinées pour le parc de véhicules
  let parcData = null;
  if (data.parcVoitures && data.parcMotos) {
    const annees = [
      ...new Set([
        ...data.parcVoitures.series.map((p) => p.annee),
        ...data.parcMotos.series.map((p) => p.annee),
      ]),
    ].sort((a, b) => a - b);

    const parAnneeV = new Map(
      data.parcVoitures.series.map((p) => [p.annee, p.valeur]),
    );
    const parAnneeM = new Map(
      data.parcMotos.series.map((p) => [p.annee, p.valeur]),
    );

    parcData = {
      labels: annees,
      datasets: [
        {
          label: "Voitures particulières",
          data: annees.map((a) => parAnneeV.get(a) ?? null),
          borderColor: "#2980B9",
          backgroundColor: "#2980B9",
          tension: 0,
          spanGaps: true,
        },
        {
          label: "Motos-taxis",
          data: annees.map((a) => parAnneeM.get(a) ?? null),
          borderColor: "#8e44ad",
          backgroundColor: "#8e44ad",
          tension: 0,
          spanGaps: true,
        },
      ],
    };
  }

  const parcOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
      tooltip: {
        callbacks: {
          label(ctx) {
            if (ctx.parsed.y == null) return "";
            return `${ctx.dataset.label} : ${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(ctx.parsed.y)} véhicules`;
          },
        },
      },
    },
    scales: {
      y: { title: { display: true, text: "véhicules" } },
    },
  };

  if (loading) {
    return (
      <section className="page-container">
        <div className="retro-loading-skeleton">
          <div className="skeleton-bar" style={{ width: "38%", height: "36px" }} />
          <div className="skeleton-bar" style={{ width: "62%", height: "20px" }} />
          <div className="retro-grid" style={{ marginTop: "2rem" }}>
            <div className="skeleton-card" />
            <div className="skeleton-card" />
            <div className="skeleton-card" />
            <div className="skeleton-card" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="page-container">
        <div className="retro-error-box" role="alert">
          <h2>Données rétrospectives indisponibles</h2>
          <p>{error}</p>
        </div>
      </section>
    );
  }

  const pop2025 = derniereValeur(data.population);
  const pop2000 = premiereValeur(data.population);
  const croissancePop =
    pop2025 && pop2000 && pop2000.valeur > 0
      ? Math.round(((pop2025.valeur - pop2000.valeur) / pop2000.valeur) * 100)
      : null;

  const marche2025 = derniereValeur(data.modes[0]);
  const taxi2025 = derniereValeur(data.modes[3]);
  const parcV2025 = derniereValeur(data.parcVoitures);
  const parcM2025 = derniereValeur(data.parcMotos);
  const totalParc2025 =
    parcV2025 && parcM2025 ? parcV2025.valeur + parcM2025.valeur : null;

  return (
    <section className="page-container">
      {/* En-tête épuré */}
      <header className="page-hero-header fade-in">
        <div className="page-eyebrow">
          <History size={16} aria-hidden="true" />
          <span>Analyse historique 2000 – 2025</span>
        </div>
        <h1>Rétrospective de la mobilité</h1>
        <p>
          Comprendre les dynamiques démographiques, l’évolution des modes de
          déplacement et la croissance du parc automobile et deux-roues à Yaoundé
          jusqu’en 2025.
        </p>
      </header>

      {/* Chiffres clés synthétiques */}
      <div className="retro-kpis reveal">
        <div className="retro-kpi-card">
          <div className="retro-kpi-icon retro-kpi-icon--blue">
            <Users size={20} aria-hidden="true" />
          </div>
          <div>
            <span className="retro-kpi-label">Population urbaine (2025)</span>
            <strong className="retro-kpi-value">
              {pop2025 ? `${formatCompact(pop2025.valeur)} hab.` : "—"}
            </strong>
            {croissancePop !== null && (
              <span className="retro-kpi-sub">
                +{croissancePop} % par rapport à 2000
              </span>
            )}
          </div>
        </div>

        <div className="retro-kpi-card">
          <div className="retro-kpi-icon retro-kpi-icon--green">
            <Footprints size={20} aria-hidden="true" />
          </div>
          <div>
            <span className="retro-kpi-label">Marche & taxis collectifs</span>
            <strong className="retro-kpi-value">
              {marche2025 && taxi2025
                ? `${Math.round(marche2025.valeur + taxi2025.valeur)} %`
                : "—"}
            </strong>
            <span className="retro-kpi-sub">
              Part cumulée des déplacements en 2025
            </span>
          </div>
        </div>

        <div className="retro-kpi-card">
          <div className="retro-kpi-icon retro-kpi-icon--amber">
            <Car size={20} aria-hidden="true" />
          </div>
          <div>
            <span className="retro-kpi-label">Parc voitures & motos-taxis</span>
            <strong className="retro-kpi-value">
              {totalParc2025 ? `${formatCompact(totalParc2025)} véh.` : "—"}
            </strong>
            <span className="retro-kpi-sub">
              {parcV2025 && parcM2025
                ? `${formatCompact(parcV2025.valeur)} voitures • ${formatCompact(parcM2025.valeur)} motos`
                : "Estimation 2025"}
            </span>
          </div>
        </div>
      </div>

      {/* Grille des graphiques sans double encadré ni badges techniques */}
      <div className="retro-grid reveal">
        {data.population && (
          <IndicatorChart
            indicator={data.population}
            titre="Croissance de la population urbaine"
            showBadges={false}
            scenarioLabels={RETRO_SCENARIO_LABELS}
          />
        )}

        {data.modes.length > 0 && (
          <StackedBarChart
            indicators={data.modes}
            titre="Répartition des parts modales"
            source={data.modes[0]?.source}
          />
        )}

        {parcData && (
          <ChartCard
            type="line"
            data={parcData}
            options={parcOptions}
            titre="Évolution du parc de véhicules"
            unite="véhicules"
            source={data.parcVoitures?.source}
          />
        )}

        {data.motorisation && (
          <IndicatorChart
            indicator={data.motorisation}
            titre="Taux de motorisation (hors motos)"
            showBadges={false}
            scenarioLabels={RETRO_SCENARIO_LABELS}
          />
        )}
      </div>

      {/* Liens de continuité */}
      <div className="retro-next-links reveal">
        <Link to="/prospectif" className="retro-next-card">
          <div className="retro-next-icon retro-next-icon--orange">
            <Compass size={22} aria-hidden="true" />
          </div>
          <div className="retro-next-body">
            <h3>Explorer les projections 2026–2036</h3>
            <p>
              Comparer les trajectoires Tendanciel, Volontariste et Rupture à
              partir de ces tendances historiques.
            </p>
          </div>
          <ArrowRight size={20} className="retro-next-arrow" aria-hidden="true" />
        </Link>

        <Link to="/carte" className="retro-next-card">
          <div className="retro-next-icon retro-next-icon--teal">
            <MapIcon size={22} aria-hidden="true" />
          </div>
          <div className="retro-next-body">
            <h3>Visualiser le territoire sur la carte</h3>
            <p>
              Consulter la densité de population par quartier, les lignes de bus
              et les projets de voirie.
            </p>
          </div>
          <ArrowRight size={20} className="retro-next-arrow" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
