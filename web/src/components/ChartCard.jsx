import {
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
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  BarElement,
  CategoryScale,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
);

// La palette officielle validée dans le Contrat D
export const SCENARIO_COLORS = {
  historique: "#7f8c8d",
  tendanciel: "#E67E22",
  volontariste: "#27AE60",
  rupture: "#2980B9",
};

export default function ChartCard({
  type = "line",
  data,
  options,
  titre,
  unite,
  source,
}) {
  const Chart = type === "bar" ? Bar : Line;
  
  return (
    <figure className="chart-card" style={{ margin: 0, minWidth: 0 }}>
      <figcaption style={{ marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: '0 0 0.5rem 0', color: '#111827' }}>{titre}</h3>
        <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>
          {unite} • Source : {source}
        </p>
      </figcaption>
      
      {/* Le conteneur avec une hauteur fixe pour que Chart.js s'affiche bien */}
      <div style={{ position: 'relative', height: 'clamp(260px, 60vw, 340px)', width: '100%' }}>
        <Chart data={data} options={options} />
      </div>
    </figure>
  );
}
