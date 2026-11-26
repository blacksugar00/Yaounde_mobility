import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Bar, Line, Pie } from "react-chartjs-2";
import { CHART_THEME, SCENARIO_COLORS, formatAxe } from "./palette";

export { SCENARIO_COLORS };

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
);

ChartJS.defaults.font.family = CHART_THEME.font;
ChartJS.defaults.color = CHART_THEME.text;

const STATUT_CONFIG = {
  mesure: { label: "Donnée mesurée", className: "badge badge--green" },
  estime: { label: "Estimation", className: "badge badge--warn" },
  projete: { label: "Projection", className: "badge" },
};

function fusionnerAxe(defaut, perso = {}) {
  return {
    ...defaut,
    ...perso,
    grid: { ...defaut.grid, ...(perso.grid || {}) },
    ticks: { ...defaut.ticks, ...(perso.ticks || {}) },
    title: { ...defaut.title, ...(perso.title || {}) },
    border: { ...defaut.border, ...(perso.border || {}) },
  };
}

export default function ChartCard({
  type = "line",
  data,
  options = {},
  titre,
  unite,
  source,
  statut,
  badgeHypothese = false,
  note,
  grand = false,
  hauteur,
}) {
  const Chart = type === "bar" ? Bar : type === "pie" ? Pie : Line;
  const horizontal = options.indexAxis === "y";
  const axeValeurs = horizontal ? "x" : "y";
  const axeCategories = horizontal ? "y" : "x";

  const axeValeursDefaut = {
    grid: { color: CHART_THEME.grid, drawTicks: false },
    border: { display: false },
    ticks: { color: CHART_THEME.text, padding: 8, font: { size: 11 }, callback: formatAxe },
    title: { display: false, color: CHART_THEME.text, font: { size: 11, weight: 500 } },
  };
  const axeCategoriesDefaut = {
    grid: { display: false },
    border: { color: CHART_THEME.axis },
    ticks: { color: CHART_THEME.text, font: { size: 11 }, maxRotation: 0, autoSkipPadding: 12 },
    title: { display: false },
  };

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: type === "pie" ? undefined : { mode: "index", intersect: false },
    layout: { padding: { top: 4, right: 8 } },
    elements: {
      line: { borderWidth: 2, tension: 0 },
      point: { radius: 0, hoverRadius: 4, hitRadius: 8 },
      bar: { borderRadius: 2 },
    },
    plugins: {
      legend: {
        position: "bottom",
        align: "start",
        labels: {
          color: CHART_THEME.ink,
          font: { size: 12 },
          padding: 14,
          usePointStyle: true,
          pointStyle: type === "line" ? "line" : "rectRounded",
          boxWidth: 18,
          boxHeight: 8,
        },
      },
      tooltip: {
        backgroundColor: CHART_THEME.tooltip,
        titleColor: "#ffffff",
        titleFont: { size: 12, weight: 600 },
        bodyColor: "#e7ece9",
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 4,
        boxPadding: 4,
        usePointStyle: true,
      },
    },
  };

  const persoScales = options.scales || {};
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    elements: { ...defaultOptions.elements, ...(options.elements || {}) },
    plugins: {
      ...defaultOptions.plugins,
      ...(options.plugins || {}),
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
            ...persoScales,
            [axeCategories]: fusionnerAxe(axeCategoriesDefaut, persoScales[axeCategories]),
            [axeValeurs]: fusionnerAxe(axeValeursDefaut, persoScales[axeValeurs]),
          },
  };

  const statutBadge = statut ? STATUT_CONFIG[statut] : null;

  return (
    <figure className={`chart-card${grand ? " chart-card--tall" : ""}`}>
      <figcaption className="chart-card-head">
        <h3 className="chart-card-title">{titre}</h3>
        {(badgeHypothese || statutBadge) && (
          <div className="chart-card-badges">
            {badgeHypothese && <span className="badge badge--warn">Hypothèse</span>}
            {statutBadge && <span className={statutBadge.className}>{statutBadge.label}</span>}
          </div>
        )}
      </figcaption>

      <div className="chart-card-body" style={hauteur ? { height: hauteur } : undefined}>
        <Chart data={data} options={mergedOptions} />
      </div>

      {(unite || note) && (
        <footer className="chart-card-foot" data-source={source || undefined}>
          {unite && <span>Unité : {unite}</span>}
          {note && <span className="chart-card-note">{note}</span>}
        </footer>
      )}
    </figure>
  );
}
