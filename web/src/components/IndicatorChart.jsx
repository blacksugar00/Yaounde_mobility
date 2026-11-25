import ChartCard, { SCENARIO_COLORS } from "./ChartCard";

export default function IndicatorChart({ indicator }) {
  // 1. Extraire toutes les années uniques et les trier
  const years = [...new Set(indicator.series.map((point) => point.annee))]
    .sort((left, right) => left - right);
    
  // 2. Extraire tous les scénarios uniques
  const scenarios = [...new Set(indicator.series.map((point) => point.scenario))];
  
  // 3. Aligner les données par année pour chaque scénario
  const aligned = scenarios.map((scenario) => {
    const byYear = new Map(
      indicator.series
        .filter((point) => point.scenario === scenario)
        .map((point) => [point.annee, point]),
    );
    return years.map((year) => byYear.get(year) ?? null);
  });

  // 4. Préparer les données pour Chart.js
  const data = {
    labels: years,
    datasets: scenarios.map((scenario, datasetIndex) => ({
      label: scenario,
      data: aligned[datasetIndex].map((point) => point?.valeur ?? null),
      borderColor: SCENARIO_COLORS[scenario] ?? "#555555",
      backgroundColor: SCENARIO_COLORS[scenario] ?? "#555555",
      spanGaps: false, // Ne relie pas les points s'il y a un trou
      tension: 0, // Courbes non lissées (comme demandé dans le guide)
      segment: {
        borderDash: (context) => {
          const point = aligned[datasetIndex][context.p0DataIndex];
          return ["interpole", "extrapole"].includes(point?.origine)
            ? [6, 4] // Trait pointillé
            : undefined; // Trait plein
        },
      },
    })),
  };

  // 5. Options du graphique (infobulles, axes)
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label(context) {
            const point = aligned[context.datasetIndex][context.dataIndex];
            if (!point) return "";
            const status = point.statut ? ` • ${point.statut}` : "";
            return `${context.dataset.label}: ${point.valeur} ${indicator.unite} • ${point.origine}${status}`;
          },
        },
      },
    },
    scales: {
      y: {
        title: { display: true, text: indicator.unite },
      },
    },
  };

  // 6. Vérifier s'il faut afficher le badge "hypothèse"
  const hasRupture = indicator.series.some(
    (point) => point.scenario === "rupture" && point.origine === "construit",
  );

  return (
    <section style={{ marginBottom: '2rem' }}>
      {hasRupture && (
        <p style={{ display: 'inline-block', background: '#fef3c7', color: '#92400e', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600', marginBottom: '1rem' }}>
          ⚠️ Rupture : hypothèse
        </p>
      )}
      <ChartCard
        type="line"
        data={data}
        options={options}
        titre={indicator.libelle}
        unite={indicator.unite}
        source={indicator.source}
      />
    </section>
  );
}
