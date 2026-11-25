import { useEffect, useState } from "react";
import { getIndicateur } from "../api/client";
import IndicatorChart from "../components/IndicatorChart";
import StackedBarChart from "../components/StackedBarChart";
import ChartCard, { SCENARIO_COLORS } from "../components/ChartCard";

const grille = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 26rem), 1fr))", gap: "1.5rem" };
const carte = { background: "#fff", borderRadius: "16px", padding: "1rem", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", minWidth: 0 };

const filtrerRetro = (ind) => {
  if (!ind || !ind.series) return null;
  return { ...ind, series: ind.series.filter(p => p.annee <= 2025) };
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
        
        const modesModifies = [marche, moto, voiture, taxi, bus].map(ind => {
          if (!ind || !ind.series) return null;
          return {
            ...ind,
            series: ind.series
              .filter(p => p.annee <= 2025)
              .map(p => ({ ...p, valeur: p.valeur <= 1 ? p.valeur * 100 : p.valeur }))
          };
        }).filter(Boolean);

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
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Préparation des données pour le graphique du Parc (Multi-lignes manuel)
  let parcData = null;
  if (data.parcVoitures && data.parcMotos) {
    const annees = [...new Set([
      ...data.parcVoitures.series.map(p => p.annee),
      ...data.parcMotos.series.map(p => p.annee)
    ])].sort();
    
    parcData = {
      labels: annees,
      datasets: [
        {
          label: "Voitures",
          data: annees.map(a => data.parcVoitures.series.find(p => p.annee === a)?.valeur || null),
          borderColor: "#2980B9", // Bleu
          backgroundColor: "#2980B9",
          tension: 0,
          spanGaps: true,
        },
        {
          label: "Moto-taxis",
          data: annees.map(a => data.parcMotos.series.find(p => p.annee === a)?.valeur || null),
          borderColor: "#9b59b6", // Violet
          backgroundColor: "#9b59b6",
          tension: 0,
          spanGaps: true,
        }
      ]
    };
  }

  const parcOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    scales: { y: { title: { display: true, text: 'véhicules' } } }
  };

  if (loading) return <p style={{ padding: "4rem", textAlign: "center" }}>Chargement des données réelles...</p>;
  if (error) return <p style={{ padding: "4rem", textAlign: "center", color: "red" }}>Erreur : {error}</p>;

  return (
    <section style={{ padding: "3rem 2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div className="fade-in">
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#111827", letterSpacing: "-1px", marginBottom: "1rem" }}>
          Rétrospective de la mobilité
        </h1>
        <p style={{ fontSize: "1.1rem", color: "#4b5563", maxWidth: "800px", lineHeight: 1.6, marginBottom: "2rem" }}>
          Évolution observée des indicateurs jusqu'en 2025.
        </p>
      </div>

      <div style={grille} className="reveal">
        
        {data.population && (
          <div style={carte}>
            <IndicatorChart indicator={data.population} />
          </div>
        )}

        {data.modes.length > 0 && (
          <div style={carte}>
            <StackedBarChart 
              indicators={data.modes} 
              titre="Parts modales des déplacements" 
              source={data.modes[0]?.source} 
            />
          </div>
        )}

        {/* Le graphique du parc est maintenant construit avec ChartCard */}
        {parcData && (
          <div style={carte}>
            <ChartCard 
              type="line"
              data={parcData}
              options={parcOptions}
              titre="Parc de véhicules"
              unite="véhicules"
              source={data.parcVoitures?.source}
            />
          </div>
        )}

        {data.motorisation && (
          <div style={carte}>
            <IndicatorChart indicator={data.motorisation} />
          </div>
        )}
      </div>
    </section>
  );
}
