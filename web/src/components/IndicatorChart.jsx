import ChartCard, { SCENARIO_COLORS } from "./ChartCard";
import { NOTE_POINTILLES, ORIGINE_LABELS, formatNombre } from "./palette";

const SCENARIO_LABELS = {
  historique: "Historique",
  tendanciel: "Tendanciel",
  volontariste: "Volontariste",
  rupture: "Rupture",
};

export default function IndicatorChart({
  indicator,
  titre,
  showBadges = true,
  scenarioLabels = SCENARIO_LABELS,
  grand = false,
}) {
  const years = [...new Set(indicator.series.map((point) => point.annee))].sort((a, b) => a - b);
  const ORDRE = Object.keys(SCENARIO_LABELS);
  const rang = (s) => (ORDRE.includes(s) ? ORDRE.indexOf(s) : ORDRE.length);
  const scenarios = [...new Set(indicator.series.map((point) => point.scenario))].sort((a, b) => rang(a) - rang(b));

  // Aligner les points par année pour chaque scénario (année absente = trou, jamais zéro)
  const aligned = scenarios.map((scenario) => {
    const byYear = new Map(
      indicator.series
        .filter((point) => point.scenario === scenario)
        .map((point) => [point.annee, point]),
    );
    return years.map((year) => byYear.get(year) ?? null);
  });

  const aDesEstimations = indicator.series.some((p) => ["interpole", "extrapole"].includes(p.origine));

  const data = {
    labels: years,
    datasets: scenarios.map((scenario, i) => {
      const couleur = SCENARIO_COLORS[scenario] ?? "#5f6b66";
      return {
        label: scenarioLabels[scenario] ?? scenario,
        data: aligned[i].map((point) => point?.valeur ?? null),
        borderColor: couleur,
        backgroundColor: couleur,
        spanGaps: false,
        // Points visibles uniquement sur les valeurs issues du fichier source
        pointRadius: (ctx) => (aligned[i][ctx.dataIndex]?.origine === "fichier" && years.length <= 12 ? 3 : 0),
        segment: {
          borderDash: (ctx) => {
            const point = aligned[i][ctx.p1DataIndex];
            return ["interpole", "extrapole"].includes(point?.origine) ? [5, 4] : undefined;
          },
        },
      };
    }),
  };

  const options = {
    plugins: {
      tooltip: {
        callbacks: {
          label(ctx) {
            const point = aligned[ctx.datasetIndex][ctx.dataIndex];
            if (!point) return null;
            const valeur = `${formatNombre(point.valeur)} ${indicator.unite}`;
            if (!showBadges) return ` ${ctx.dataset.label} : ${valeur}`;
            const origine = ORIGINE_LABELS[point.origine] ?? point.origine;
            return ` ${ctx.dataset.label} : ${valeur} (${origine})`;
          },
        },
      },
    },
  };

  const hasRupture =
    showBadges &&
    indicator.series.some((point) => point.scenario === "rupture" && point.origine === "construit");

  return (
    <ChartCard
      type="line"
      data={data}
      options={options}
      titre={titre || indicator.libelle}
      unite={indicator.unite}
      source={indicator.source}
      badgeHypothese={hasRupture}
      note={aDesEstimations ? NOTE_POINTILLES : undefined}
      grand={grand}
    />
  );
}
