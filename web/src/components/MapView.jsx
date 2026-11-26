import { useMemo, useState } from "react";
import L from "leaflet";
import { GeoJSON, MapContainer, Pane, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER = [3.848, 11.502];
const DEFAULT_ZOOM = 11;

const POPULATION_FIELD = {
  2018: "pop_2018",
  2025: "pop_2025",
  2035: "pop_2035",
};

const POPULATION_YEARS = [2018, 2025, 2035];
const POPULATION_BREAKS = [10000, 25000, 50000, 100000];
const POPULATION_COLORS = ["#edf8fb", "#b2e2e2", "#66c2a4", "#2ca25f", "#006d2c"];
const MISSING_COLOR = "#bdbdbd";

const HORIZON_COLORS = {
  "Coup parti": "#2ca25f",
  MT: "#e67e22",
  LT: "#2980b9",
};

const BUS_LINE_COLORS = [
  "#1d4ed8",
  "#0284c7",
  "#0f766e",
  "#7c3aed",
  "#be185d",
  "#b45309",
  "#15803d",
  "#4338ca",
  "#dc2626",
];

const DATASETS = [
  { id: "zones_population", label: "Population par zone" },
  { id: "reseau_bus", label: "Réseau de bus" },
  { id: "projets_voirie", label: "Projets de voirie" },
  { id: "projets_tp", label: "Projets de transport public" },
  { id: "gares", label: "Gares et pôles d'échanges" },
  { id: "carrefours", label: "Carrefours" },
];

const HORIZON_OPTIONS_BY_LAYER = {
  projets_voirie: ["Tous", "Coup parti", "MT", "LT"],
  projets_tp: ["Tous", "MT", "LT"],
  gares: ["Tous", "MT", "LT", "Non renseigné"],
  carrefours: ["Tous", "MT", "LT"],
};

const ALL_HORIZON_OPTIONS = ["Tous", "Coup parti", "MT", "LT", "Non renseigné"];

// Ordre d'empilement visuel : polygones en bas, lignes au milieu, points au-dessus.
const LAYER_PANES = [
  { id: "zones_population", pane: "pane-zones-population", zIndex: 410 },
  { id: "projets_voirie", pane: "pane-projets-voirie", zIndex: 420 },
  { id: "projets_tp", pane: "pane-projets-tp", zIndex: 430 },
  { id: "reseau_bus", pane: "pane-reseau-bus", zIndex: 440 },
  { id: "carrefours", pane: "pane-carrefours", zIndex: 450 },
  { id: "gares", pane: "pane-gares", zIndex: 460 },
];

function colorForPopulation(value) {
  if (value == null || !Number.isFinite(Number(value))) return MISSING_COLOR;
  const numeric = Number(value);
  const index = POPULATION_BREAKS.findIndex((limit) => numeric < limit);
  return POPULATION_COLORS[index < 0 ? POPULATION_COLORS.length - 1 : index];
}

function horizonForFeature(layerId, properties) {
  if (!properties) return null;
  if (layerId === "carrefours") return properties["Détails"] ?? null;
  return properties.Horizon ?? null;
}

function formatNumber(value, unit = "") {
  if (value == null || !Number.isFinite(Number(value))) return "non disponible";
  const formatted = Number(value).toLocaleString("fr-FR", {
    maximumFractionDigits: 0,
  });
  return unit ? `${formatted} ${unit}` : formatted;
}

function textValue(value) {
  if (value == null || value === "") return "non disponible";
  return String(value);
}

function createPopupElement(title, rows) {
  const popup = document.createElement("div");
  const heading = document.createElement("strong");
  heading.textContent = title;
  popup.append(heading);
  for (const [label, value] of rows) {
    const line = document.createElement("div");
    line.textContent = `${label} : ${value}`;
    popup.append(line);
  }
  return popup;
}

function buildPopupRows(layerId, properties, year) {
  if (layerId === "zones_population") {
    const field = POPULATION_FIELD[year];
    const value = properties[field];
    return {
      title: properties.nom ?? properties.NOM_ZONE ?? "Zone sans nom",
      rows: [[`Population ${year}`, formatNumber(value)]],
    };
  }

  if (layerId === "reseau_bus") {
    return {
      title: properties.LONGNAME ?? properties.NAME ?? "Ligne de bus",
      rows: [
        ["Ligne", textValue(properties.NAME)],
        ["Réseau", textValue(properties.nome)],
        [
          "Fréquence (headway)",
          properties.HEADWAY_1 != null && Number.isFinite(Number(properties.HEADWAY_1))
            ? `${Number(properties.HEADWAY_1).toLocaleString("fr-FR")} min`
            : "non disponible",
        ],
        ["Longueur", formatNumber(properties.SHAPE_Leng, "m")],
      ],
    };
  }

  if (layerId === "projets_voirie") {
    return {
      title: properties.Nom ?? properties.ID_new ?? "Projet de voirie",
      rows: [
        ["Identifiant", textValue(properties.ID_new)],
        ["Type", textValue(properties.Type)],
        ["Horizon", textValue(properties.Horizon)],
        ["Longueur", formatNumber(properties.Longueur, "m")],
        ["Coût", formatNumber(properties.Cout)],
        ["Porteur", textValue(properties.Porteur)],
        ["Détails", textValue(properties.Details)],
      ],
    };
  }

  if (layerId === "projets_tp") {
    return {
      title: properties.Nom ?? "Projet de transport public",
      rows: [
        ["Type", textValue(properties.Type)],
        ["Horizon", textValue(properties.Horizon)],
        ["Longueur", formatNumber(properties.longueur, "m")],
        ["Étude", textValue(properties.Etude)],
      ],
    };
  }

  if (layerId === "gares") {
    return {
      title: properties.Nom ?? "Gare",
      rows: [
        ["Caractéristique", textValue(properties.Carac)],
        ["Horizon", textValue(properties.Horizon)],
        ["Coût", formatNumber(properties.Cout)],
      ],
    };
  }

  return {
    title: properties.Nom ?? "Carrefour",
    rows: [
      ["Horizon", textValue(properties["Détails"])],
      ["Type", textValue(properties.Type)],
      ["Porteur", textValue(properties.Porteur)],
      ["Coût", formatNumber(properties.Cout)],
    ],
  };
}

function bindFeaturePopup(layerId, feature, layer, year) {
  const properties = feature.properties ?? {};
  const { title, rows } = buildPopupRows(layerId, properties, year);
  layer.bindPopup(createPopupElement(title, rows));
}

function buildBusLineLegend(reseauBusData) {
  const seen = new Map();
  for (const feature of reseauBusData?.features ?? []) {
    const name = feature.properties?.NAME;
    if (!name || seen.has(name)) continue;
    seen.set(name, feature.properties?.LONGNAME ?? name);
  }
  const names = Array.from(seen.keys()).sort((a, b) =>
    a.localeCompare(b, "fr", { numeric: true }),
  );
  return names.map((name, index) => ({
    name,
    longName: seen.get(name),
    color: BUS_LINE_COLORS[index % BUS_LINE_COLORS.length],
  }));
}

function busColorForFeature(feature, busColorMap) {
  const name = feature.properties?.NAME ?? "";
  if (busColorMap?.has(name)) {
    return busColorMap.get(name);
  }
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return BUS_LINE_COLORS[hash % BUS_LINE_COLORS.length];
}

function legendForLayer(layerId, year, busLineLegend = []) {
  if (layerId === "zones_population") {
    return {
      ariaLabel: `Légende population ${year}`,
      items: [
        { color: POPULATION_COLORS[0], label: "Moins de 10 000" },
        { color: POPULATION_COLORS[1], label: "10 000–24 999" },
        { color: POPULATION_COLORS[2], label: "25 000–49 999" },
        { color: POPULATION_COLORS[3], label: "50 000–99 999" },
        { color: POPULATION_COLORS[4], label: "100 000 et plus" },
        { color: MISSING_COLOR, label: "Non disponible" },
      ],
    };
  }

  if (layerId === "reseau_bus") {
    return {
      ariaLabel: "Légende réseau de bus",
      items:
        busLineLegend.length > 0
          ? busLineLegend.map((entry) => ({
              color: entry.color,
              label: entry.name,
              title: entry.longName,
            }))
          : [
              { color: BUS_LINE_COLORS[0], label: "Lignes de bus (réseau TC2)" },
            ],
    };
  }

  if (layerId === "projets_voirie") {
    return {
      ariaLabel: "Légende projets de voirie",
      items: [
        { color: HORIZON_COLORS["Coup parti"], label: "Coup parti" },
        { color: HORIZON_COLORS.MT, label: "Moyen terme (MT)" },
        { color: HORIZON_COLORS.LT, label: "Long terme (LT)" },
      ],
    };
  }

  if (layerId === "projets_tp") {
    return {
      ariaLabel: "Légende projets de transport public",
      items: [
        { color: HORIZON_COLORS.MT, label: "Moyen terme (MT)" },
        { color: HORIZON_COLORS.LT, label: "Long terme (LT)" },
      ],
    };
  }

  if (layerId === "gares") {
    return {
      ariaLabel: "Légende gares",
      items: [
        { color: HORIZON_COLORS.MT, label: "Moyen terme (MT)", shape: "circle" },
        { color: HORIZON_COLORS.LT, label: "Long terme (LT)", shape: "circle" },
        { color: MISSING_COLOR, label: "Horizon non renseigné", shape: "circle" },
      ],
    };
  }

  return {
    ariaLabel: "Légende carrefours",
    items: [
      { color: HORIZON_COLORS.MT, label: "Moyen terme (MT)", shape: "circle" },
      { color: HORIZON_COLORS.LT, label: "Long terme (LT)", shape: "circle" },
    ],
  };
}

export default function MapView({
  geojson = null,
  year = 2018,
  onYearChange,
  layers = null,
  activeLayer: controlledLayer,
  activeLayers: controlledLayers,
  onLayerChange,
  onLayersChange,
  height = 500,
}) {
  if (!POPULATION_FIELD[year]) {
    throw new RangeError(`Annee de carte invalide: ${year}`);
  }

  const [internalLayers, setInternalLayers] = useState(["zones_population"]);
  const [internalYear, setInternalYear] = useState(year);
  const [prevPropYear, setPrevPropYear] = useState(year);
  const [horizonFilter, setHorizonFilter] = useState("Tous");

  if (year !== prevPropYear) {
    setPrevPropYear(year);
    setInternalYear(year);
  }

  const currentLayers = useMemo(
    () => controlledLayers ?? (controlledLayer ? [controlledLayer] : internalLayers),
    [controlledLayers, controlledLayer, internalLayers],
  );
  const currentLayerSet = useMemo(() => new Set(currentLayers), [currentLayers]);
  const currentYear = onYearChange ? year : internalYear;

  const resolvedLayers = useMemo(
    () => ({
      zones_population: layers?.zones_population ?? geojson,
      reseau_bus: layers?.reseau_bus ?? null,
      projets_voirie: layers?.projets_voirie ?? null,
      projets_tp: layers?.projets_tp ?? null,
      gares: layers?.gares ?? null,
      carrefours: layers?.carrefours ?? null,
    }),
    [layers, geojson],
  );

  const busLineLegend = useMemo(
    () => buildBusLineLegend(resolvedLayers.reseau_bus),
    [resolvedLayers.reseau_bus],
  );

  const busColorMap = useMemo(
    () => new Map(busLineLegend.map((entry) => [entry.name, entry.color])),
    [busLineLegend],
  );

  const horizonOptions = useMemo(() => {
    const allowed = new Set();
    for (const layerId of currentLayers) {
      for (const option of HORIZON_OPTIONS_BY_LAYER[layerId] ?? []) {
        allowed.add(option);
      }
    }
    if (allowed.size === 0) return null;
    return ALL_HORIZON_OPTIONS.filter((option) => allowed.has(option));
  }, [currentLayers]);

  const effectiveHorizonFilter =
    horizonOptions && horizonOptions.includes(horizonFilter) ? horizonFilter : "Tous";

  const filteredLayers = useMemo(() => {
    const out = {};
    for (const { id } of DATASETS) {
      const raw = resolvedLayers[id];
      if (!raw) {
        out[id] = null;
        continue;
      }
      const layerHorizonOptions = HORIZON_OPTIONS_BY_LAYER[id];
      if (!layerHorizonOptions || effectiveHorizonFilter === "Tous") {
        out[id] = raw;
        continue;
      }
      const features = (raw.features ?? []).filter((feature) => {
        const horizon = horizonForFeature(id, feature.properties);
        if (effectiveHorizonFilter === "Non renseigné") {
          return horizon == null || horizon === "";
        }
        return horizon === effectiveHorizonFilter;
      });
      out[id] = { ...raw, features };
    }
    return out;
  }, [resolvedLayers, effectiveHorizonFilter]);

  const updateLayers = (nextLayers) => {
    if (!controlledLayers && !controlledLayer) {
      setInternalLayers(nextLayers);
    }
    onLayersChange?.(nextLayers);
    onLayerChange?.(nextLayers[0] ?? null);
  };

  const toggleLayer = (layerId) => {
    const exists = currentLayerSet.has(layerId);
    const nextSet = new Set(currentLayers);
    if (exists) {
      nextSet.delete(layerId);
    } else {
      nextSet.add(layerId);
    }
    const nextLayers = DATASETS.map((item) => item.id).filter((id) => nextSet.has(id));
    updateLayers(nextLayers);
  };

  const handleYearChange = (event) => {
    const nextYear = Number(event.target.value);
    if (!onYearChange) {
      setInternalYear(nextYear);
    }
    onYearChange?.(nextYear);
  };

  const populationField = POPULATION_FIELD[currentYear];
  const hasOverlayOnPopulation =
    currentLayerSet.has("zones_population") && currentLayers.length > 1;

  const styleForLayer = (layerId) => (feature) => {
    if (layerId === "zones_population") {
      return {
        fillColor: colorForPopulation(feature.properties?.[populationField]),
        color: "#333333",
        weight: 1,
        fillOpacity: hasOverlayOnPopulation ? 0.4 : 0.7,
      };
    }
    if (layerId === "reseau_bus") {
      return {
        color: busColorForFeature(feature, busColorMap),
        weight: 3,
        opacity: 0.9,
      };
    }
    const horizon = horizonForFeature(layerId, feature.properties);
    const color = HORIZON_COLORS[horizon] ?? MISSING_COLOR;
    const isVariant = feature.properties?.Type === "Variante";
    return {
      color,
      weight: layerId === "projets_tp" ? 6 : 3.5,
      opacity: layerId === "projets_tp" ? 0.85 : 0.9,
      dashArray: isVariant ? "6 4" : undefined,
    };
  };

  const pointToLayerFor = (layerId) => (feature, latlng) => {
    const horizon = horizonForFeature(layerId, feature.properties);
    const isGare = layerId === "gares";
    return L.circleMarker(latlng, {
      radius: isGare ? 8 : 5,
      fillColor: HORIZON_COLORS[horizon] ?? MISSING_COLOR,
      color: isGare ? "#ffffff" : "#1f2937",
      weight: isGare ? 2.5 : 1.5,
      fillOpacity: 0.95,
    });
  };

  const activeDatasets = DATASETS.filter((item) => currentLayerSet.has(item.id));
  const unavailableDatasets = activeDatasets.filter((item) => !filteredLayers[item.id]);
  const availableDatasets = activeDatasets.filter((item) => filteredLayers[item.id]);
  const totalVisibleFeatures = availableDatasets.reduce(
    (sum, item) => sum + (filteredLayers[item.id]?.features?.length ?? 0),
    0,
  );

  return (
    <div className="map-view">
      <div
        className="map-controls"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          marginBottom: "0.75rem",
        }}
      >
        <div
          role="group"
          aria-label="Couches affichées sur la carte"
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          {DATASETS.map((dataset) => {
            const checked = currentLayerSet.has(dataset.id);
            return (
              <label
                key={dataset.id}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.35rem 0.65rem",
                  borderRadius: "9999px",
                  border: checked ? "1px solid #047857" : "1px solid #d1d5db",
                  backgroundColor: checked ? "#ecfdf5" : "#f9fafb",
                  color: checked ? "#065f46" : "#374151",
                  fontSize: "0.9rem",
                  fontWeight: checked ? 600 : 500,
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleLayer(dataset.id)}
                />
                <span>{dataset.label}</span>
              </label>
            );
          })}

          <button
            type="button"
            onClick={() => updateLayers(DATASETS.map((item) => item.id))}
            disabled={currentLayers.length === DATASETS.length}
            style={{
              padding: "0.35rem 0.65rem",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              backgroundColor: "#ffffff",
              fontSize: "0.85rem",
              cursor: currentLayers.length === DATASETS.length ? "default" : "pointer",
            }}
          >
            Tout afficher
          </button>
          <button
            type="button"
            onClick={() => updateLayers([])}
            disabled={currentLayers.length === 0}
            style={{
              padding: "0.35rem 0.65rem",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              backgroundColor: "#ffffff",
              fontSize: "0.85rem",
              cursor: currentLayers.length === 0 ? "default" : "pointer",
            }}
          >
            Tout masquer
          </button>
        </div>

        {(currentLayerSet.has("zones_population") || horizonOptions) && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "0.75rem 1.25rem",
            }}
          >
            {currentLayerSet.has("zones_population") && (
              <label style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                <span>Année (population)</span>
                <select
                  aria-label="Année de population"
                  value={currentYear}
                  onChange={handleYearChange}
                >
                  {POPULATION_YEARS.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {horizonOptions && (
              <label style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                <span>Horizon</span>
                <select
                  aria-label="Filtre par horizon"
                  value={effectiveHorizonFilter}
                  onChange={(event) => setHorizonFilter(event.target.value)}
                >
                  {horizonOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        )}
      </div>

      {activeDatasets.length === 0 && (
        <p role="status" style={{ marginBottom: "0.5rem" }}>
          Sélectionnez au moins une couche à afficher sur la carte.
        </p>
      )}

      {unavailableDatasets.length > 0 && (
        <p role="status" style={{ marginBottom: "0.5rem" }}>
          Couche(s) non disponible(s) dans les données transmises :{" "}
          {unavailableDatasets.map((item) => item.label).join(", ")}.
        </p>
      )}

      {availableDatasets.length > 0 && totalVisibleFeatures === 0 && (
        <p role="status" style={{ marginBottom: "0.5rem" }}>
          Aucune entité correspondante pour ce filtre.
        </p>
      )}

      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height, width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {LAYER_PANES.map(({ id, pane, zIndex }) => {
          if (!currentLayerSet.has(id)) return null;
          const data = filteredLayers[id];
          if (!data) return null;
          const layerKey =
            id === "zones_population"
              ? `${id}-${currentYear}-${hasOverlayOnPopulation ? "underlay" : "solo"}`
              : id === "reseau_bus"
                ? id
                : `${id}-${effectiveHorizonFilter}`;

          return (
            <Pane key={pane} name={pane} style={{ zIndex }}>
              <GeoJSON
                key={layerKey}
                data={data}
                style={styleForLayer(id)}
                pointToLayer={pointToLayerFor(id)}
                onEachFeature={(feature, layer) =>
                  bindFeaturePopup(id, feature, layer, currentYear)
                }
              />
            </Pane>
          );
        })}
      </MapContainer>

      {activeDatasets.length > 0 && (
        <div
          className="map-legends"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            marginTop: "0.75rem",
          }}
        >
          {activeDatasets.map((dataset) => {
            const legend = legendForLayer(dataset.id, currentYear, busLineLegend);
            const title =
              dataset.id === "zones_population"
                ? `${dataset.label} (${currentYear})`
                : dataset.label;

            return (
              <div
                key={dataset.id}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "0.5rem 0.75rem",
                }}
              >
                <strong style={{ fontSize: "0.9rem", color: "#111827" }}>
                  {title} :
                </strong>
                <ul
                  aria-label={legend.ariaLabel}
                  className="map-legend"
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.75rem",
                    padding: 0,
                    margin: 0,
                    listStyle: "none",
                  }}
                >
                  {legend.items.map((item) => (
                    <li
                      key={item.label}
                      title={item.title}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        fontSize: "0.9rem",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          width: "1rem",
                          height: "1rem",
                          backgroundColor: item.color,
                          border:
                            dataset.id === "gares"
                              ? "2px solid #9ca3af"
                              : "1px solid #555555",
                          borderRadius: item.shape === "circle" ? "9999px" : "2px",
                        }}
                      />
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
