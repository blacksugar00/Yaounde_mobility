import { useState } from "react";
import IndicatorChart from "../components/IndicatorChart";
import TestBanner from "../components/TestBanner";
import { PROSPECTIF } from "../mocks/fixtures";

const SCENARIOS = [["tendanciel", "Tendanciel"], ["volontariste", "Volontariste"], ["rupture", "Rupture"]];

export default function Prospectif() {
  // TODO API : remplacer PROSPECTIF par getIndicateurs() (catalogue) puis getIndicateur(code).
  const [code, setCode] = useState(PROSPECTIF[0].code);
  const [choisis, setChoisis] = useState(SCENARIOS.map(([s]) => s));
  const indicateur = PROSPECTIF.find((i) => i.code === code);

  const presents = new Set(indicateur.series.map((p) => p.scenario));
  const absents = SCENARIOS.filter(([s]) => !presents.has(s)).map(([, nom]) => nom);
  const filtre = { ...indicateur, series: indicateur.series.filter((p) => p.scenario === "historique" || choisis.includes(p.scenario)) };

  const basculer = (s) => setChoisis((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  return (
    <section style={{ padding: "clamp(1.25rem, 4vw, 3rem) clamp(1rem, 4vw, 2rem)", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "clamp(1.75rem, 6vw, 2.5rem)", fontWeight: 800, color: "#111827", letterSpacing: "-1px", marginBottom: "1rem" }}>
        Prospective 2026-2036
      </h1>
      <p style={{ fontSize: "1.1rem", color: "#4b5563", maxWidth: "800px", lineHeight: 1.6, marginBottom: "1.5rem" }}>
        Trois scénarios sont comparés. Ce sont des trajectoires de modèle, pas des observations : le détail de leurs
        hypothèses est présenté dans la page Méthodologie.
      </p>
      <TestBanner />

      <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", alignItems: "center", marginBottom: "1.5rem" }}>
        <label style={{ fontWeight: 600, maxWidth: "100%" }}>
          Indicateur{" "}
          <select value={code} onChange={(e) => setCode(e.target.value)}
            style={{ padding: "0.6rem 1rem", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "1rem", marginLeft: "0.5rem", maxWidth: "100%" }}>
            {PROSPECTIF.map((i) => <option key={i.code} value={i.code}>{i.libelle}</option>)}
          </select>
        </label>
        <fieldset style={{ border: 0, padding: 0, margin: 0, display: "flex", gap: "1rem" }}>
          <legend style={{ position: "absolute", left: "-10000px" }}>Scénarios affichés</legend>
          {SCENARIOS.map(([s, nom]) => (
            <label key={s} style={{ opacity: presents.has(s) ? 1 : 0.5 }}>
              <input type="checkbox" checked={choisis.includes(s)} disabled={!presents.has(s)} onChange={() => basculer(s)} /> {nom}
            </label>
          ))}
        </fieldset>
      </div>

      {absents.length > 0 && (
        <p role="note" style={{ color: "#4b5563", marginBottom: "1rem" }}>
          Non disponible pour cet indicateur : scénario {absents.join(", ").toLowerCase()}.
        </p>
      )}

      <div style={{ background: "#fff", borderRadius: "16px", padding: "1rem", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
        <IndicatorChart indicator={filtre} />
      </div>
    </section>
  );
}
