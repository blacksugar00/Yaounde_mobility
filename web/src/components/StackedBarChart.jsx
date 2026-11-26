import ChartCard from "./ChartCard";
import { CATEGORY_COLORS, ORIGINE_LABELS, formatNombre } from "./palette";

// Barres empilées à 100 % (ex. parts modales). Un indicateur = un segment ; un point = une année.
export default function StackedBarChart({ indicators, titre, unite = "%", source, annees }) {
  const toutes = [...new Set(indicators.flatMap((i) => i.series.map((p) => p.annee)))].sort((a, b) => a - b);
  const years = annees ? toutes.filter((y) => annees.includes(y)) : toutes;
  const parAnnee = indicators.map((ind) => new Map(ind.series.map((p) => [p.annee, p])));

  const data = {
    labels: years,
    datasets: indicators.map((ind, i) => ({
      label: ind.libelle,
      data: years.map((y) => parAnnee[i].get(y)?.valeur ?? null),
      backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
      borderColor: "#ffffff",
      borderWidth: { top: 1 },
      maxBarThickness: 56,
    })),
  };

  const options = {
    plugins: {
      tooltip: {
        callbacks: {
          label(ctx) {
            const p = parAnnee[ctx.datasetIndex].get(years[ctx.dataIndex]);
            if (!p) return ` ${ctx.dataset.label} : non disponible`;
            return ` ${ctx.dataset.label} : ${formatNombre(p.valeur, 1)} ${unite} (${ORIGINE_LABELS[p.origine] ?? p.origine})`;
          },
        },
      },
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true, max: 100, ticks: { callback: (v) => `${v} %` } },
    },
  };

  return <ChartCard type="bar" data={data} options={options} titre={titre} unite={unite} source={source} />;
}
