import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getQuestions, getResultats } from "../api/client";
import ChartCard from "../components/ChartCard";

const BAR_COLOR = "#135c41";

// Coupe un libellé long en plusieurs lignes pour l'axe des catégories
function couperLibelle(texte, largeur = 26) {
  const mots = String(texte).split(" ");
  const lignes = [];
  let courante = "";
  mots.forEach((mot) => {
    if ((courante + " " + mot).trim().length > largeur && courante) {
      lignes.push(courante);
      courante = mot;
    } else {
      courante = (courante + " " + mot).trim();
    }
  });
  if (courante) lignes.push(courante);
  return lignes;
}

export default function Resultats() {
  const [resultats, setResultats] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  const chargerDonnees = () => {
    setChargement(true);
    setErreur(null);
    Promise.all([getResultats(), getQuestions()])
      .then(([resData, questData]) => {
        setResultats(resData);
        setQuestions(questData.questions || []);
        setChargement(false);
      })
      .catch((err) => {
        setErreur(err.message || "Impossible de charger les résultats.");
        setChargement(false);
      });
  };

  useEffect(() => {
    chargerDonnees();
  }, []);

  if (chargement) {
    return (
      <div aria-busy="true">
        <div className="grid grid-2">
          <div className="skeleton" style={{ height: 260 }} />
          <div className="skeleton" style={{ height: 260 }} />
        </div>
      </div>
    );
  }

  if (erreur) {
    return (
      <div>
        <div className="state state--box" role="alert">
          <h2>Résultats temporairement indisponibles</h2>
          <p>{erreur}</p>
          <button type="button" className="btn btn--secondary" onClick={chargerDonnees}>Réessayer</button>
        </div>
      </div>
    );
  }

  const totalFormulaires = resultats?.total || 0;
  const agregats = resultats?.agregats || {};

  return (
    <div>
      <div className="page-head--split" style={{ marginBottom: "1.25rem" }}>
        <p className="lead" style={{ fontSize: "0.98rem" }}>
          Ces résultats décrivent les participants, pas un échantillon représentatif de la population de Yaoundé.
        </p>
        <button type="button" className="btn btn--secondary btn--sm" onClick={chargerDonnees}>Actualiser</button>
      </div>

      <p className="notice notice--warn" style={{ marginBottom: "1.75rem" }}>
        <strong>Protection de l'anonymat (k ≥ 5).</strong> La distribution d'une question est masquée tant
        qu'une catégorie compte moins de 5 réponses, afin d'empêcher toute identification indirecte.
      </p>

      <div className="grid grid-3" style={{ marginBottom: "2.5rem" }}>
        <div className="stat">
          <div className="stat-label">Formulaires collectés</div>
          <div className="stat-value">{totalFormulaires}</div>
          <div className="stat-sub">{totalFormulaires > 0 ? "Collecte ouverte" : "En attente des premières réponses"}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Questions</div>
          <div className="stat-value">{questions.length || 17}</div>
          <div className="stat-sub">Choix fermés facultatifs · 105 quartiers</div>
        </div>
        <div className="stat">
          <div className="stat-label">Seuil d'anonymat</div>
          <div className="stat-value">5</div>
          <div className="stat-sub">Réponses minimales par catégorie</div>
        </div>
      </div>

      <section>
        <h2 className="section-title" style={{ marginBottom: "1.25rem" }}>Réponses par question</h2>

        {totalFormulaires === 0 ? (
          <div className="state state--box">
            <h3>Aucune réponse enregistrée</h3>
            <p>Le baromètre est ouvert : les premiers résultats apparaîtront après les premières contributions.</p>
            <Link to="/participatif" className="btn btn--primary">Remplir le questionnaire</Link>
          </div>
        ) : (
          <div className="grid grid-2">
            {questions.map((q) => {
              const dataQuestion = agregats[q.cle] || {
                nombre_reponses: 0,
                distribution_masquee: true,
                reponses: [],
              };
              const { nombre_reponses, distribution_masquee, reponses } = dataQuestion;
              const optionLabelMap = new Map(q.options.map((opt) => [opt.valeur, opt.libelle]));

              if (distribution_masquee) {
                return (
                  <div key={q.cle} className="card masked">
                    <div className="masked-head">
                      <h3 className="chart-card-title">{q.libelle}</h3>
                      <span className="badge">{nombre_reponses} rép.</span>
                    </div>
                    <p className="masked-body">
                      {nombre_reponses === 0
                        ? "Aucun participant n'a renseigné cette question."
                        : "Distribution masquée : au moins une catégorie compte moins de 5 réponses."}
                    </p>
                  </div>
                );
              }

              const tries = [...reponses].sort((a, b) => b.nombre - a.nombre);
              const chartData = {
                labels: tries.map((r) => optionLabelMap.get(r.reponse) || r.reponse),
                datasets: [
                  {
                    label: "Réponses",
                    data: tries.map((r) => r.nombre),
                    backgroundColor: BAR_COLOR,
                    maxBarThickness: 22,
                  },
                ],
              };

              const chartOptions = {
                indexAxis: "y",
                interaction: { mode: "nearest", intersect: true, axis: "y" },
                plugins: {
                  legend: { display: false },
                  tooltip: { callbacks: { label: (ctx) => ` ${ctx.parsed.x} réponse(s)` } },
                },
                scales: {
                  x: { beginAtZero: true, ticks: { precision: 0 } },
                  y: { ticks: { autoSkip: false, font: { size: 11 }, callback(value) { return couperLibelle(this.getLabelForValue(value)); } } },
                },
              };

              return (
                <ChartCard
                  key={q.cle}
                  type="bar"
                  titre={q.libelle}
                  unite={`${nombre_reponses} réponse(s)`}
                  source="Baromètre participatif"
                  data={chartData}
                  options={chartOptions}
                  hauteur={Math.max(150, 60 + tries.length * 46)}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
