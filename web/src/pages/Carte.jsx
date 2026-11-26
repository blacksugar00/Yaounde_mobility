import { useEffect, useRef, useState } from "react";
import { getGeoJsonLayer, getZones } from "../api/client";
import MapView from "../components/MapView";

async function fetchZonesLayer(year) {
  const data = await getZones(year);
  if (!Array.isArray(data?.features) || data.features.length === 0) {
    throw new Error("Couche des zones de population indisponible.");
  }
  return data;
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
          getGeoJsonLayer("reseau_bus"),
          getGeoJsonLayer("projets_voirie"),
          getGeoJsonLayer("projets_tp"),
          getGeoJsonLayer("gares"),
          getGeoJsonLayer("carrefours"),
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
    <div className="container page">
      <header className="page-head">
        <span className="kicker">Système d'information géographique</span>
        <h1>Carte de la mobilité</h1>
        <p className="lead">
          Population des 105 quartiers en 2018, 2025 et 2035, réseau de bus, projets de voirie et
          de transport public, gares et carrefours. Cliquez sur un élément pour afficher son détail.
        </p>
      </header>

      {loading && <div className="skeleton" style={{ height: 560 }} aria-busy="true" />}

      {error && (
        <div className="state state--box" role="alert">
          <h2>Carte indisponible</h2>
          <p>{error}</p>
          <button type="button" className="btn btn--secondary" onClick={() => setAttempt((value) => value + 1)}>
            Réessayer
          </button>
        </div>
      )}

      {!loading && !error && layers && (
        <div className="card map-panel">
          <MapView
            geojson={layers.zones_population}
            year={year}
            onYearChange={setYear}
            layers={layers}
            height={520}
          />
        </div>
      )}
    </div>
  );
}
