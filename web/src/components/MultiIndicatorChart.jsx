import ChartCard from "./ChartCard";
import { CATEGORY_COLORS, ORIGINE_LABELS, formatNombre, estEstime } from "./palette";

// Plusieurs indicateurs (ex. voitures et moto-taxis) sur un même axe, une courbe par indicateur.
// Années sans donnée = trou visible (null), jamais zéro. Trait plein = source, pointillé = interpolé/extrapolé.
export default function MultiIndicatorChart({ indicators, titre, unite, source }) {
  const toutes = indicators.flatMap((i) => i.series.map((p) => p.annee));
  const min = Math.min(...toutes);
  const max = Math.max(...toutes);
  const years = Array.from({ length: max - min + 1 }, (_, k) => min + k);
  const aligned = indicators.map((ind) => {
    const parAnnee = new Map(ind.series.map((p) => [p.annee, p]));
    return years.map((y) => parAnnee.get(y) ?? null);
  });

  const data = {
    labels: years,
    datasets: indicators.map((ind, i) => ({
      label: ind.libelle,
      data: aligned[i].map((p) => p?.valeur ?? null),
      borderColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
      backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
      spanGaps: false,
      tension: 0,
      pointRadius: (ctx) => (aligned[i][ctx.dataIndex]?.origine === "fichier" ? 4 : 1.5),
      segment: {
        borderDash: (ctx) =>
          estEstime(aligned[i][ctx.p0DataIndex]) || estEstime(aligned[i][ctx.p1DataIndex]) ? [6, 4] : undefined,
      },
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
            const p = aligned[ctx.datasetIndex][ctx.dataIndex];
            if (!p) return `${ctx.dataset.label} : non disponible`;
            return `${ctx.dataset.label} : ${formatNombre(p.valeur)} ${unite} · ${ORIGINE_LABELS[p.origine] ?? p.origine}`;
          },
        },
      },
    },
    scales: { y: { title: { display: true, text: unite } } },
  };

  return <ChartCard type="line" data={data} options={options} titre={titre} unite={unite} source={source} />;
}
