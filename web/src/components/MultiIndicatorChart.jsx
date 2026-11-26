import ChartCard from "./ChartCard";
import { CATEGORY_COLORS, NOTE_POINTILLES, ORIGINE_LABELS, formatNombre, estEstime } from "./palette";

// Plusieurs indicateurs (ex. voitures et motos-taxis) sur un même axe, une courbe par indicateur.
// Années sans donnée = trou visible (null), jamais zéro. Trait plein = source, pointillé = interpolé/extrapolé.
export default function MultiIndicatorChart({ indicators, titre, unite, source, couleurs = CATEGORY_COLORS }) {
  const toutes = indicators.flatMap((i) => i.series.map((p) => p.annee));
  const min = Math.min(...toutes);
  const max = Math.max(...toutes);
  const years = Array.from({ length: max - min + 1 }, (_, k) => min + k);
  const aligned = indicators.map((ind) => {
    const parAnnee = new Map(ind.series.map((p) => [p.annee, p]));
    return years.map((y) => parAnnee.get(y) ?? null);
  });
  const aDesEstimations = aligned.some((serie) => serie.some(estEstime));

  const data = {
    labels: years,
    datasets: indicators.map((ind, i) => ({
      label: ind.libelle,
      data: aligned[i].map((p) => p?.valeur ?? null),
      borderColor: couleurs[i % couleurs.length],
      backgroundColor: couleurs[i % couleurs.length],
      spanGaps: false,
      pointRadius: (ctx) => (aligned[i][ctx.dataIndex]?.origine === "fichier" ? 3 : 0),
      segment: {
        borderDash: (ctx) => (estEstime(aligned[i][ctx.p1DataIndex]) ? [5, 4] : undefined),
      },
    })),
  };

  const options = {
    plugins: {
      tooltip: {
        callbacks: {
          label(ctx) {
            const p = aligned[ctx.datasetIndex][ctx.dataIndex];
            if (!p) return ` ${ctx.dataset.label} : non disponible`;
            return ` ${ctx.dataset.label} : ${formatNombre(p.valeur, 0)} ${unite} (${ORIGINE_LABELS[p.origine] ?? p.origine})`;
          },
        },
      },
    },
  };

  return (
    <ChartCard
      type="line"
      data={data}
      options={options}
      titre={titre}
      unite={unite}
      source={source}
      note={aDesEstimations ? NOTE_POINTILLES : undefined}
    />
  );
}
