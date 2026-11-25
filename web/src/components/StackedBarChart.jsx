import ChartCard from "./ChartCard";
import { CATEGORY_COLORS, ORIGINE_LABELS } from "./palette";

// Barres empilées à 100 % (ex. parts modales). Un indicateur = un segment ; un point = une année d'enquête.
export default function StackedBarChart({ indicators, titre, unite = "%", source }) {
  const years = [...new Set(indicators.flatMap((i) => i.series.map((p) => p.annee)))].sort((a, b) => a - b);
  const parAnnee = indicators.map((ind) => new Map(ind.series.map((p) => [p.annee, p])));

  const data = {
    labels: years,
    datasets: indicators.map((ind, i) => ({
      label: ind.libelle,
      data: years.map((y) => parAnnee[i].get(y)?.valeur ?? null),
      backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
      tooltip: {
        callbacks: {
          label(ctx) {
            const p = parAnnee[ctx.datasetIndex].get(years[ctx.dataIndex]);
            if (!p) return `${ctx.dataset.label} : non disponible`;
            return `${ctx.dataset.label} : ${p.valeur} ${unite} · ${ORIGINE_LABELS[p.origine] ?? p.origine}`;
          },
        },
      },
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true, max: 100, title: { display: true, text: unite } },
    },
  };

  return <ChartCard type="bar" data={data} options={options} titre={titre} unite={unite} source={source} />;
}
