import { useState } from "react";
import IndicatorChart from "../components/IndicatorChart";

// 1. LES FAUSSES DONNÉES (MOCK) POUR LE PROSPECTIF
const MOCK_INDICATEURS = {
  population: {
    code: "population",
    libelle: "Projection de la population (2026-2036)",
    unite: "habitants",
    source: "WUP 2025, ONU (Simulé)",
    series: [
      { annee: 2025, scenario: "historique", valeur: 4028467, origine: "mesure" },
      { annee: 2026, scenario: "tendanciel", valeur: 4200000, origine: "extrapole" },
      { annee: 2030, scenario: "tendanciel", valeur: 4800000, origine: "extrapole" },
      { annee: 2036, scenario: "tendanciel", valeur: 5700000, origine: "extrapole" },
      { annee: 2026, scenario: "volontariste", valeur: 4200000, origine: "extrapole" },
      { annee: 2030, scenario: "volontariste", valeur: 5100000, origine: "extrapole" },
      { annee: 2036, scenario: "volontariste", valeur: 6000000, origine: "extrapole" },
      { annee: 2026, scenario: "rupture", valeur: 4200000, origine: "construit" },
      { annee: 2030, scenario: "rupture", valeur: 5300000, origine: "construit" },
      { annee: 2036, scenario: "rupture", valeur: 6500000, origine: "construit" }
    ]
  },
  emissions: {
    code: "emissions",
    libelle: "Projection des émissions de GES du transport",
    unite: "kt CO2e",
    source: "SUMP 2019 (Simulé)",
    series: [
      { annee: 2025, scenario: "historique", valeur: 1140, origine: "mesure" },
      { annee: 2026, scenario: "tendanciel", valeur: 1226, origine: "extrapole" },
      { annee: 2030, scenario: "tendanciel", valeur: 1600, origine: "extrapole" },
      { annee: 2036, scenario: "tendanciel", valeur: 2000, origine: "extrapole" },
      { annee: 2026, scenario: "volontariste", valeur: 1226, origine: "extrapole" },
      { annee: 2030, scenario: "volontariste", valeur: 1338, origine: "extrapole" },
      { annee: 2036, scenario: "volontariste", valeur: 1480, origine: "extrapole" },
      { annee: 2026, scenario: "rupture", valeur: 1226, origine: "construit" },
      { annee: 2030, scenario: "rupture", valeur: 1100, origine: "construit" },
      { annee: 2036, scenario: "rupture", valeur: 800, origine: "construit" }
    ]
  }
};

export default function Prospectif() {
  const [selectedCode, setSelectedCode] = useState("population");
  
  // On récupère l'indicateur sélectionné dans le dictionnaire de mocks
  const indicator = MOCK_INDICATEURS[selectedCode];

  return (
    <section style={{ padding: '3rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#111827', letterSpacing: '-1px', marginBottom: '1rem' }}>
          Prospective 2026-2036
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#4b5563', maxWidth: '800px', lineHeight: '1.6' }}>
          Comparez les trajectoires futures de Yaoundé selon trois scénarios : 
          <strong> Tendanciel</strong> (statu quo), 
          <strong> Volontariste</strong> (politiques durables), et 
          <strong> Rupture</strong> (transformation majeure).
        </p>
      </div>

      {/* Sélecteur d'indicateur (Le fameux F5) */}
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <label htmlFor="indicator-select" style={{ fontWeight: '600', color: '#374151' }}>
          Choisir un indicateur :
        </label>
        <select 
          id="indicator-select"
          value={selectedCode}
          onChange={(e) => setSelectedCode(e.target.value)}
          style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem', outline: 'none', cursor: 'pointer', minWidth: '300px' }}
        >
          <option value="population">Population de Yaoundé</option>
          <option value="emissions">Émissions de GES du transport</option>
        </select>
      </div>

      {/* Affichage du graphique */}
      <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <IndicatorChart indicator={indicator} />
      </div>

    </section>
  );
}
