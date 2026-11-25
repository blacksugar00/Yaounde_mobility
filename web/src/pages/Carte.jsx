import { useEffect, useRef, useState } from "react";
import { getZones } from "../api/client";
import MapView from "../components/MapView";

const LAYER_SOURCES = {
  zones_population: "/geojson/zones_population.geojson",
  reseau_bus: "/geojson/reseau_bus.geojson",
  projets_voirie: "/geojson/projets_voirie.geojson",
  projets_tp: "/geojson/projets_tp.geojson",
  gares: "/geojson/gares.geojson",
  carrefours: "/geojson/carrefours.geojson",
};

async function fetchJsonAsset(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Impossible de charger ${url} (${response.status})`);
  }
  return response.json();
}

async function fetchZonesLayer(year) {
  try {
    const data = await getZones(year);
    if (Array.isArray(data?.features) && data.features.length > 0) {
      return data;
    }
  } catch {
    // Repli sur l'asset statique si le backend Flask n'est pas demarre
  }
  return fetchJsonAsset(LAYER_SOURCES.zones_population);
}

export default function Carte() {
  const [year, setYear] = useState(2018);
  const [layers, setLayers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const initializedRef = useRef(false);

  useEffect(() => {
    let active = true;

    async function loadLayers() {
      setLoading(true);
      setError("");
      try {
        const [
          zones_population,
          reseau_bus,
          projets_voirie,
          projets_tp,
          gares,
          carrefours,
        ] = await Promise.all([
          fetchZonesLayer(2018),
          fetchJsonAsset(LAYER_SOURCES.reseau_bus),
          fetchJsonAsset(LAYER_SOURCES.projets_voirie),
          fetchJsonAsset(LAYER_SOURCES.projets_tp),
          fetchJsonAsset(LAYER_SOURCES.gares),
          fetchJsonAsset(LAYER_SOURCES.carrefours),
        ]);

        if (active) {
          initializedRef.current = true;
          setLayers({
            zones_population,
            reseau_bus,
            projets_voirie,
            projets_tp,
            gares,
            carrefours,
          });
        }
      } catch (cause) {
        if (active) {
          setError(cause instanceof Error ? cause.message : "Erreur de chargement de la carte");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadLayers();
    return () => {
      active = false;
    };
  }, [attempt]);

  useEffect(() => {
    if (!initializedRef.current) return undefined;
    let active = true;
    fetchZonesLayer(year)
      .then((zones_population) => {
        if (active) {
          setLayers((prev) => (prev ? { ...prev, zones_population } : prev));
        }
      })
      .catch((cause) => {
        if (active) {
          setError(cause instanceof Error ? cause.message : "Erreur de chargement de la carte");
        }
      });
    return () => {
      active = false;
    };
  }, [year]);

  return (
    <section
      style={{
        padding: "clamp(1.25rem, 4vw, 3rem) clamp(1rem, 4vw, 2rem)",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <h1
        style={{
          fontSize: "clamp(1.75rem, 6vw, 2.5rem)",
          fontWeight: 800,
          color: "#111827",
          letterSpacing: "-1px",
          marginBottom: "0.75rem",
        }}
      >
        Carte de la mobilité à Yaoundé
      </h1>
      <p
        style={{
          fontSize: "1.05rem",
          color: "#4b5563",
          maxWidth: "800px",
          lineHeight: 1.6,
          marginBottom: "1.5rem",
        }}
      >
        Population par zone (2018, 2025, 2035), réseau de bus, projets de voirie,
        transports publics, gares et carrefours.
      </p>

      {loading && <p>Chargement des couches cartographiques...</p>}
      {error && (
        <div role="alert">
          <p>Carte indisponible : {error}</p>
          <button type="button" onClick={() => setAttempt((value) => value + 1)}>
            Réessayer
          </button>
        </div>
      )}
      {!loading && !error && layers && (
        <div
          style={{
            position: "relative",
            zIndex: 1,
            background: "#ffffff",
            borderRadius: "16px",
            padding: "1rem",
            boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
            minHeight: 500,
          }}
        >
          <MapView
            geojson={layers.zones_population}
            year={year}
            onYearChange={setYear}
            layers={layers}
            height={500}
          />
        </div>
      )}
    </section>
  );
}
