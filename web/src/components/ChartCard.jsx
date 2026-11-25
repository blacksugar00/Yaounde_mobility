import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Bar, Line, Pie } from "react-chartjs-2";
import { SCENARIO_COLORS } from "./palette";

export { SCENARIO_COLORS };

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
);

const STATUT_CONFIG = {
  mesure: { label: "Donnée mesurée", bg: "#ecfdf5", text: "#065f46", border: "#a7f3d0" },
  estime: { label: "Estimation / Modèle", bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
  projete: { label: "Projection", bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe" },
};

export default function ChartCard({
  type = "line",
  data,
  options = {},
  titre,
  unite,
  source,
  statut,
  badgeHypothese = false,
}) {
  const Chart = type === "bar" ? Bar : type === "pie" ? Pie : Line;

  // Options d'affichage haute précision inspirées des standards entreprise
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: { top: 8, bottom: 4, left: 4, right: 4 },
    },
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#475569",
          font: { family: "'Inter', sans-serif", size: 12, weight: 500 },
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 10,
          boxWidth: 8,
          boxHeight: 8,
        },
      },
      tooltip: {
        backgroundColor: "#0f172a",
        titleColor: "#f8fafc",
        titleFont: { family: "'Inter', sans-serif", size: 12, weight: 700 },
        bodyColor: "#cbd5e1",
        bodyFont: { family: "'Inter', sans-serif", size: 12 },
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        boxPadding: 6,
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
      },
    },
    scales:
      type === "pie"
        ? {}
        : {
            x: {
              grid: { display: false },
              ticks: {
                color: "#64748b",
                font: { family: "'Inter', sans-serif", size: 11, weight: 500 },
                maxRotation: 0,
              },
              border: { color: "#e2e8f0" },
            },
            y: {
              grid: {
                color: "rgba(226, 232, 240, 0.7)",
                drawBorder: false,
                borderDash: [4, 4],
              },
              ticks: {
                color: "#64748b",
                font: { family: "'Inter', sans-serif", size: 11 },
                precision: 0,
              },
              border: { dash: [4, 4], display: false },
            },
          },
  };

  // Fusion des options personnalisées avec les options entreprise
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    plugins: {
      ...defaultOptions.plugins,
      ...options.plugins,
      legend: {
        ...defaultOptions.plugins.legend,
        ...(options.plugins?.legend || {}),
        labels: {
          ...defaultOptions.plugins.legend.labels,
          ...(options.plugins?.legend?.labels || {}),
        },
      },
      tooltip: {
        ...defaultOptions.plugins.tooltip,
        ...(options.plugins?.tooltip || {}),
      },
    },
    scales:
      type === "pie"
        ? {}
        : {
            ...defaultOptions.scales,
            ...options.scales,
            x: {
              ...defaultOptions.scales.x,
              ...(options.scales?.x || {}),
            },
            y: {
              ...defaultOptions.scales.y,
              ...(options.scales?.y || {}),
            },
          },
  };

  const statutBadge = statut ? STATUT_CONFIG[statut] : null;

  return (
    <figure
      className="chart-card"
      style={{
        margin: 0,
        minWidth: 0,
        background: "#ffffff",
        border: "1px solid rgba(226, 232, 240, 0.9)",
        borderRadius: "16px",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "1.5rem",
        transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* En-tête de la carte */}
      <figcaption style={{ marginBottom: "1.25rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "0.75rem",
            flexWrap: "wrap",
            marginBottom: "0.5rem",
          }}
        >
          <h3
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "#0f172a",
              letterSpacing: "-0.02em",
              lineHeight: 1.35,
              margin: 0,
            }}
          >
            {titre}
          </h3>

          {/* Badges de statut / hypothèse */}
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            {badgeHypothese && (
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  background: "#fef3c7",
                  color: "#92400e",
                  border: "1px solid #fde68a",
                  padding: "0.2rem 0.5rem",
                  borderRadius: "4px",
                }}
              >
                Hypothèse
              </span>
            )}
            {statutBadge && (
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  background: statutBadge.bg,
                  color: statutBadge.text,
                  border: `1px solid ${statutBadge.border}`,
                  padding: "0.2rem 0.5rem",
                  borderRadius: "4px",
                }}
              >
                {statutBadge.label}
              </span>
            )}
          </div>
        </div>
      </figcaption>

      {/* Zone du graphique */}
      <div
        style={{
          position: "relative",
          height: "clamp(260px, 45vw, 340px)",
          width: "100%",
          marginBottom: "1rem",
        }}
      >
        <Chart data={data} options={mergedOptions} />
      </div>

      {/* Pied de carte avec unité et source */}
      <footer
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.75rem",
          paddingTop: "0.85rem",
          borderTop: "1px solid #f1f5f9",
          fontSize: "0.8rem",
          color: "#64748b",
        }}
      >
        {unite && (
          <span
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              color: "#334155",
              padding: "0.2rem 0.55rem",
              borderRadius: "6px",
              fontWeight: 500,
              fontSize: "0.75rem",
            }}
          >
            Unité : {unite}
          </span>
        )}

        {source && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", marginLeft: "auto" }}>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
            </svg>
            <span>Source : {source}</span>
          </div>
        )}
      </footer>
    </figure>
  );
}
