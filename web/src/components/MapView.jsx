import { useMemo, useState } from "react";
import L from "leaflet";
import { GeoJSON, MapContainer, TileLayer } from "react-leaflet";
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

function busColorForFeature(feature) {
  const name = feature.properties?.NAME ?? "";
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return BUS_LINE_COLORS[hash % BUS_LINE_COLORS.length];
}

function legendForLayer(layerId, year) {
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
      items: [
        { color: BUS_LINE_COLORS[0], label: "Lignes de bus (L10 – L17, réseau TC2)" },
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
  onLayerChange,
  height = 500,
}) {
  if (!POPULATION_FIELD[year]) {
    throw new RangeError(`Annee de carte invalide: ${year}`);
  }

  const [internalLayer, setInternalLayer] = useState("zones_population");
  const [internalYear, setInternalYear] = useState(year);
  const [prevPropYear, setPrevPropYear] = useState(year);
  const [horizonFilter, setHorizonFilter] = useState("Tous");
  const [showPopulationBackdrop, setShowPopulationBackdrop] = useState(false);

  if (year !== prevPropYear) {
    setPrevPropYear(year);
    setInternalYear(year);
  }

  const currentLayer = controlledLayer ?? internalLayer;
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

  const zonesData = resolvedLayers.zones_population;
  const rawLayerData = resolvedLayers[currentLayer];
  const horizonOptions = HORIZON_OPTIONS_BY_LAYER[currentLayer] ?? null;

  const activeData = useMemo(() => {
    if (!rawLayerData) return null;
    if (!horizonOptions || horizonFilter === "Tous") return rawLayerData;

    const features = (rawLayerData.features ?? []).filter((feature) => {
      const horizon = horizonForFeature(currentLayer, feature.properties);
      if (horizonFilter === "Non renseigné") return horizon == null || horizon === "";
      return horizon === horizonFilter;
    });

    return { ...rawLayerData, features };
  }, [rawLayerData, horizonOptions, horizonFilter, currentLayer]);

  const handleLayerChange = (event) => {
    const nextLayer = event.target.value;
    if (!controlledLayer) {
      setInternalLayer(nextLayer);
    }
    setHorizonFilter("Tous");
    onLayerChange?.(nextLayer);
  };

  const handleYearChange = (event) => {
    const nextYear = Number(event.target.value);
    if (!onYearChange) {
      setInternalYear(nextYear);
    }
    onYearChange?.(nextYear);
  };

  const populationField = POPULATION_FIELD[currentYear];

  const populationStyle = (feature) => ({
    fillColor: colorForPopulation(feature.properties?.[populationField]),
    color: "#333333",
    weight: 1,
    fillOpacity: currentLayer === "zones_population" ? 0.7 : 0.35,
  });

  const activeStyle = (feature) => {
    if (currentLayer === "zones_population") {
      return populationStyle(feature);
    }
    if (currentLayer === "reseau_bus") {
      return {
        color: busColorForFeature(feature),
        weight: 4,
        opacity: 0.9,
      };
    }
    const horizon = horizonForFeature(currentLayer, feature.properties);
    const color = HORIZON_COLORS[horizon] ?? MISSING_COLOR;
    const isVariant = feature.properties?.Type === "Variante";
    return {
      color,
      weight: currentLayer === "projets_tp" ? 5 : 4,
      opacity: 0.9,
      dashArray: isVariant ? "6 4" : undefined,
    };
  };

  const pointToLayer = (feature, latlng) => {
    const horizon = horizonForFeature(currentLayer, feature.properties);
    return L.circleMarker(latlng, {
      radius: currentLayer === "gares" ? 8 : 6,
      fillColor: HORIZON_COLORS[horizon] ?? MISSING_COLOR,
      color: "#1f2937",
      weight: 1.5,
      fillOpacity: 0.9,
    });
  };

  const legend = legendForLayer(currentLayer, currentYear);
  const activeDatasetMeta = DATASETS.find((item) => item.id === currentLayer);
  const featureCount = activeData?.features?.length ?? 0;

  return (
    <div className="map-view">
      <div
        className="map-controls"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "0.75rem 1.25rem",
          marginBottom: "0.75rem",
        }}
      >
        <label style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
          <span>Jeu de données</span>
          <select
            aria-label="Jeu de données affiché"
            value={currentLayer}
            onChange={handleLayerChange}
          >
            {DATASETS.map((dataset) => (
              <option key={dataset.id} value={dataset.id}>
                {dataset.label}
              </option>
            ))}
          </select>
        </label>

        {currentLayer === "zones_population" && (
          <label style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            <span>Année</span>
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
              value={horizonFilter}
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

        {currentLayer !== "zones_population" && zonesData && (
          <label style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            <input
              type="checkbox"
              checked={showPopulationBackdrop}
              onChange={(event) => setShowPopulationBackdrop(event.target.checked)}
            />
            <span>Afficher la population {currentYear} en fond</span>
          </label>
        )}
      </div>

      {!activeData && (
        <p role="status" style={{ marginBottom: "0.5rem" }}>
          Couche « {activeDatasetMeta?.label ?? currentLayer} » non disponible dans les données transmises.
        </p>
      )}

      {activeData && featureCount === 0 && (
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

        {currentLayer !== "zones_population" && showPopulationBackdrop && zonesData && (
          <GeoJSON
            key={`backdrop-${currentYear}`}
            data={zonesData}
            style={populationStyle}
            onEachFeature={(feature, layer) =>
              bindFeaturePopup("zones_population", feature, layer, currentYear)
            }
          />
        )}

        {activeData && (
          <GeoJSON
            key={`${currentLayer}-${currentYear}-${horizonFilter}`}
            data={activeData}
            style={activeStyle}
            pointToLayer={pointToLayer}
            onEachFeature={(feature, layer) =>
              bindFeaturePopup(currentLayer, feature, layer, currentYear)
            }
          />
        )}
      </MapContainer>

      <ul
        aria-label={legend.ariaLabel}
        className="map-legend"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          padding: 0,
          marginTop: "0.75rem",
          listStyle: "none",
        }}
      >
        {legend.items.map((item) => (
          <li
            key={item.label}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "1rem",
                height: "1rem",
                backgroundColor: item.color,
                border: "1px solid #555555",
                borderRadius: item.shape === "circle" ? "9999px" : "2px",
              }}
            />
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
