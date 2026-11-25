import { useEffect, useState } from "react";
import { getIndicateur } from "../api/client";

// Charge un indicateur depuis l'API. États : chargement | erreur | vide | ok.
// Si "scenario" est fourni, on ne garde que ce scénario (ex. "historique" pour le rétrospectif).
export function useIndicateur(code, scenario) {
  const [etat, setEtat] = useState({ statut: "chargement", data: null, erreur: null });
  const [essai, setEssai] = useState(0);

  useEffect(() => {
    let annule = false;
    setEtat({ statut: "chargement", data: null, erreur: null });
    getIndicateur(code)
      .then((d) => {
        if (annule) return;
        const series = (d.series ?? []).filter((p) => !scenario || p.scenario === scenario);
        setEtat({ statut: series.length ? "ok" : "vide", data: { ...d, series }, erreur: null });
      })
      .catch((e) => {
        if (!annule) setEtat({ statut: "erreur", data: null, erreur: e.message });
      });
    return () => { annule = true; };
  }, [code, scenario, essai]);

  return { ...etat, reessayer: () => setEssai((n) => n + 1) };
}
