import { useEffect, useState } from "react";
import { getIndicateurs, getIndicateur } from "../api/client";
import IndicatorChart from "../components/IndicatorChart";

const SCENARIOS = [["tendanciel", "Tendanciel"], ["volontariste", "Volontariste"], ["rupture", "Rupture"]];

export default function Prospectif() {
  const [list, setList] = useState([]);
  const [code, setCode] = useState("");
  const [indicateur, setIndicateur] = useState(null);
  const [choisis, setChoisis] = useState(SCENARIOS.map(([s]) => s));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 1. Charger la liste complète depuis l'API
  useEffect(() => {
    getIndicateurs()
      .then((data) => {
        setList(data);
        // On sélectionne par défaut la population (ou le premier de la liste)
        const defaultCode = data.find(i => i.code.includes("population"))?.code || data[0]?.code;
        if (defaultCode) setCode(defaultCode);
      })
      .catch((err) => setError(err.message));
  }, []);

  // 2. Charger les données détaillées quand on change d'indicateur
  useEffect(() => {
    if (!code) return;
    setLoading(true);
    getIndicateur(code)
      .then((data) => {
        setIndicateur(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [code]);

  if (loading) return <p style={{ padding: "4rem", textAlign: "center" }}>Chargement des données depuis l'API...</p>;
  if (error) return <p style={{ padding: "4rem", textAlign: "center", color: "red" }}>Erreur : {error}</p>;
  if (!indicateur) return null;

  // Gestion des scénarios disponibles pour cet indicateur
  const presents = new Set(indicateur.series.map((p) => p.scenario));
  const absents = SCENARIOS.filter(([s]) => !presents.has(s)).map(([, nom]) => nom);
  
  // Filtre selon les cases cochées
  const filtre = { 
    ...indicateur, 
    series: indicateur.series.filter((p) => p.scenario === "historique" || choisis.includes(p.scenario)) 
  };

  const basculer = (s) => setChoisis((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

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

      <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", alignItems: "center", marginBottom: "1.5rem" }}>
        <label style={{ fontWeight: 600, maxWidth: "100%" }}>
          Indicateur{" "}
          <select value={code} onChange={(e) => setCode(e.target.value)}
            style={{ padding: "0.6rem 1rem", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "1rem", marginLeft: "0.5rem", maxWidth: "100%" }}>
            {list.map((i) => <option key={i.code} value={i.code}>{i.libelle}</option>)}
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
