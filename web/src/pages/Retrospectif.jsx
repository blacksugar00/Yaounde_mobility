import IndicatorChart from "../components/IndicatorChart";
import MultiIndicatorChart from "../components/MultiIndicatorChart";
import StackedBarChart from "../components/StackedBarChart";
import EtatIndicateur from "../components/EtatIndicateur";
import { useIndicateur } from "../hooks/useIndicateur";
import { RETRO, SOURCE_TEST } from "../mocks/fixtures";

const CODE_POPULATION = "1.1__population_urbaine_de_l_aire_metropolitaine";

const grille = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 26rem), 1fr))", gap: "1.5rem" };
const carte = { background: "#fff", borderRadius: "16px", padding: "1rem", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", minWidth: 0 };

// Étiquette des graphiques qui utilisent encore des données fictives
const NoteTest = () => (
  <p role="note" style={{ display: "inline-block", background: "#fef3c7", color: "#92400e", padding: "4px 8px", borderRadius: "4px", fontSize: "0.8rem", fontWeight: 600, margin: "0 0 0.75rem" }}>
    Données de test
  </p>
);

export default function Retrospectif() {
  // Données réelles (API) : population, scénario "historique" uniquement.
  const population = useIndicateur(CODE_POPULATION, "historique");

  return (
    <section style={{ padding: "clamp(1.25rem, 4vw, 3rem) clamp(1rem, 4vw, 2rem)", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "clamp(1.75rem, 6vw, 2.5rem)", fontWeight: 800, color: "#111827", letterSpacing: "-1px", marginBottom: "1rem" }}>
        Rétrospective de la mobilité
      </h1>
      <p style={{ fontSize: "1.1rem", color: "#4b5563", maxWidth: "800px", lineHeight: 1.6, marginBottom: "1.5rem" }}>
        Évolution observée des indicateurs. Trait plein : valeur de la source. Pointillé : valeur interpolée,
        qui n'est pas une observation. Une année sans point est une donnée non disponible.
      </p>

      <div style={grille}>
        <div style={carte}>
          <EtatIndicateur etat={population} titre="Population de l'aire métropolitaine">
            {(indicator) => <IndicatorChart indicator={indicator} />}
          </EtatIndicateur>
        </div>
        <div style={carte}>
          <NoteTest />
          <StackedBarChart indicators={RETRO.modes} titre="Parts modales des déplacements" source={SOURCE_TEST} />
          <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>Années d'enquête uniquement ; le total fait 100 % pour chaque année.</p>
        </div>
        <div style={carte}>
          <NoteTest />
          <MultiIndicatorChart indicators={[RETRO.parcVoitures, RETRO.parcMotos]} titre="Parc de véhicules" unite="véhicules" source={SOURCE_TEST} />
        </div>
        <div style={carte}>
          <NoteTest />
          <IndicatorChart indicator={RETRO.motorisation} />
        </div>
      </div>
    </section>
  );
}
