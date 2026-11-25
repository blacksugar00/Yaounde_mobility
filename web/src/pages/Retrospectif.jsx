import { useState } from "react";
import IndicatorChart from "../components/IndicatorChart";

// MOCK (Fausses données basées sur le vrai format de P1)
const MOCK_POPULATION = {
  code: "1.1__population_urbaine_de_l_aire_metropolitaine",
  libelle: "Évolution de la population de Yaoundé",
  unite: "habitants",
  source: "WUP 2025, ONU (Données de test)",
  series: [
    // Historique (Trait plein, gris)
    { annee: 2018, scenario: "historique", valeur: 3212283, origine: "mesure" },
    { annee: 2025, scenario: "historique", valeur: 4028467, origine: "mesure" },
    // Tendanciel (Trait pointillé, orange)
    { annee: 2026, scenario: "tendanciel", valeur: 4200000, origine: "interpole" },
    { annee: 2030, scenario: "tendanciel", valeur: 4800000, origine: "interpole" },
    { annee: 2035, scenario: "tendanciel", valeur: 5599668, origine: "extrapole" },
    // Volontariste (Trait pointillé, vert)
    { annee: 2026, scenario: "volontariste", valeur: 4200000, origine: "interpole" },
    { annee: 2030, scenario: "volontariste", valeur: 5000000, origine: "interpole" },
    { annee: 2035, scenario: "volontariste", valeur: 5800000, origine: "extrapole" },
    // Rupture (Trait pointillé, bleu + Badge Hypothèse)
    { annee: 2026, scenario: "rupture", valeur: 4200000, origine: "construit" },
    { annee: 2030, scenario: "rupture", valeur: 5200000, origine: "construit" },
    { annee: 2035, scenario: "rupture", valeur: 6200000, origine: "construit" }
  ]
};

export default function Retrospectif() {
  // On utilise le mock directement pour l'affichage
  const indicator = MOCK_POPULATION;

  return (
    <section style={{ padding: '3rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#111827', letterSpacing: '-1px', marginBottom: '1rem' }}>
          Rétrospective de la mobilité
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#4b5563', maxWidth: '800px', lineHeight: '1.6' }}>
          Découvrez l'évolution historique des indicateurs. Les courbes en trait plein représentent les données observées. 
          Les courbes en pointillé représentent les projections.
        </p>
      </div>

      {/* Affichage du graphique */}
      <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <IndicatorChart indicator={indicator} />
      </div>

    </section>
  );
}
