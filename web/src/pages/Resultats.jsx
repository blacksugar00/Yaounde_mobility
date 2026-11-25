import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getQuestions, getResultats } from "../api/client";
import ChartCard from "../components/ChartCard";

const SECONDARY_BAR_COLOR = "#3b82f6";

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
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "3rem 1.5rem" }}>
        <div style={{ height: "36px", width: "40%", background: "#e5e7eb", borderRadius: "8px", marginBottom: "1rem" }} />
        <div style={{ height: "20px", width: "65%", background: "#f3f4f6", borderRadius: "6px", marginBottom: "2.5rem" }} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 24rem), 1fr))",
            gap: "1.5rem",
          }}
        >
          <div style={{ height: "240px", background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "14px" }} />
          <div style={{ height: "240px", background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "14px" }} />
        </div>
      </main>
    );
  }

  if (erreur) {
    return (
      <main style={{ maxWidth: "860px", margin: "0 auto", padding: "4rem 1.5rem", textAlign: "center" }}>
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            padding: "2rem",
            borderRadius: "14px",
          }}
        >
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            Résultats temporairement indisponibles
          </h2>
          <p style={{ fontSize: "0.95rem", color: "#b91c1c", marginBottom: "1.5rem" }}>{erreur}</p>
          <button
            type="button"
            onClick={chargerDonnees}
            style={{
              background: "#111827",
              color: "#ffffff",
              border: "none",
              padding: "0.6rem 1.25rem",
              borderRadius: "8px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Réessayer
          </button>
        </div>
      </main>
    );
  }

  const totalFormulaires = resultats?.total || 0;
  const agregats = resultats?.agregats || {};

  return (
    <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "clamp(1.5rem, 4vw, 3rem) clamp(1rem, 3vw, 2rem)" }}>
      {/* En-tête de la page */}
      <header
        style={{
          border: "none",
          padding: 0,
          background: "transparent",
          display: "block",
          position: "static",
          boxShadow: "none",
          marginBottom: "2rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <span
              style={{
                display: "inline-block",
                fontSize: "0.8rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 700,
                color: "#2563eb",
                background: "#eff6ff",
                padding: "0.3rem 0.75rem",
                borderRadius: "6px",
                marginBottom: "0.75rem",
              }}
            >
              Données citoyennes
            </span>
            <h1
              style={{
                fontSize: "clamp(1.75rem, 5vw, 2.5rem)",
                fontWeight: 800,
                color: "#111827",
                letterSpacing: "-0.75px",
                lineHeight: 1.2,
                marginBottom: "0.5rem",
              }}
            >
              Résultats du Baromètre participatif
            </h1>
            <p style={{ color: "#4b5563", fontSize: "1.05rem", lineHeight: 1.6, maxWidth: "70ch" }}>
              Agrégats des réponses citoyennes collectées dans le cadre de l'Observatoire. Les réponses sont strictement
              anonymes et consolidées à des fins d'analyse exploratoire.
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <button
              type="button"
              onClick={chargerDonnees}
              style={{
                background: "#ffffff",
                border: "1px solid #d1d5db",
                color: "#374151",
                padding: "0.55rem 1rem",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "0.9rem",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              Actualiser
            </button>
            <Link
              to="/participatif"
              style={{
                background: "#2563eb",
                color: "#ffffff",
                padding: "0.55rem 1.15rem",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "0.9rem",
                textDecoration: "none",
              }}
            >
              Participer
            </Link>
          </div>
        </div>
      </header>

      {/* Avertissement méthodologique et confidentialité */}
      <section
        style={{
          background: "#f9fafb",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "1.25rem 1.5rem",
          marginBottom: "2rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "#92400e",
              background: "#fef3c7",
              padding: "0.2rem 0.5rem",
              borderRadius: "4px",
            }}
          >
            Avertissement méthodologique
          </span>
          <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>
            Protection de la vie privée (Règle des cellules k ≥ 5)
          </span>
        </div>
        <p style={{ fontSize: "0.9rem", color: "#4b5563", lineHeight: 1.55, margin: 0 }}>
          Les données présentées ci-dessous sont issues des contributions directes au baromètre. Conformément au
          protocole de confidentialité, la distribution d'une question est <strong>masquée</strong> tant qu'une
          catégorie comporte moins de 5 réponses, afin d'empêcher toute déduction ou identification indirecte.
          Ces résultats ne constituent pas un échantillon représentatif de la population générale de Yaoundé.
        </p>
      </section>

      {/* Chiffres clés en tête */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 16rem), 1fr))",
          gap: "1.25rem",
          marginBottom: "2.5rem",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "14px",
            padding: "1.5rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
          }}
        >
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>
            Formulaires collectés
          </span>
          <div style={{ fontSize: "2.25rem", fontWeight: 800, color: "#111827", marginTop: "0.25rem" }}>
            {totalFormulaires}
          </div>
          <p style={{ fontSize: "0.85rem", color: "#059669", marginTop: "0.25rem", fontWeight: 500 }}>
            {totalFormulaires > 0 ? "Collecte active et fonctionnelle" : "En attente des premières réponses"}
          </p>
        </div>

        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "14px",
            padding: "1.5rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
          }}
        >
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>
            Questions au baromètre
          </span>
          <div style={{ fontSize: "2.25rem", fontWeight: 800, color: "#111827", marginTop: "0.25rem" }}>
            17
          </div>
          <p style={{ fontSize: "0.85rem", color: "#6b7280", marginTop: "0.25rem" }}>
            Choix fermés facultatifs • 105 quartiers
          </p>
        </div>

        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "14px",
            padding: "1.5rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
          }}
        >
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>
            Seuil d'anonymat
          </span>
          <div style={{ fontSize: "2.25rem", fontWeight: 800, color: "#111827", marginTop: "0.25rem" }}>
            5
          </div>
          <p style={{ fontSize: "0.85rem", color: "#6b7280", marginTop: "0.25rem" }}>
            Réponses minimales par catégorie requises
          </p>
        </div>
      </section>

      {/* Grille des résultats par question */}
      <section>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#111827", marginBottom: "1.25rem" }}>
          Distributions et observations par indicateur
        </h2>

        {totalFormulaires === 0 ? (
          <div
            style={{
              background: "#ffffff",
              border: "1px dashed #d1d5db",
              borderRadius: "14px",
              padding: "3rem 1.5rem",
              textAlign: "center",
            }}
          >
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#111827", marginBottom: "0.5rem" }}>
              Aucune réponse enregistrée
            </h3>
            <p style={{ color: "#6b7280", fontSize: "0.95rem", maxWidth: "480px", margin: "0 auto 1.5rem" }}>
              Le baromètre est ouvert. Remplissez le premier formulaire pour voir apparaître les premières métriques
              d'échantillon.
            </p>
            <Link
              to="/participatif"
              style={{
                background: "#2563eb",
                color: "#ffffff",
                padding: "0.65rem 1.25rem",
                borderRadius: "8px",
                fontWeight: 600,
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Remplir le questionnaire
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 26rem), 1fr))",
              gap: "1.5rem",
            }}
          >
            {questions.map((q) => {
              const dataQuestion = agregats[q.cle] || {
                nombre_reponses: 0,
                distribution_masquee: true,
                reponses: [],
              };
              const { nombre_reponses, distribution_masquee, reponses } = dataQuestion;

              // Mapper les valeurs techniques vers les libellés officiels
              const optionLabelMap = new Map(q.options.map((opt) => [opt.valeur, opt.libelle]));

              if (distribution_masquee) {
                return (
                  <div
                    key={q.cle}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "14px",
                      padding: "1.5rem",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      minHeight: "220px",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                        <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#111827", lineHeight: 1.4, margin: 0 }}>
                          {q.libelle}
                        </h3>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            color: "#6b7280",
                            background: "#f3f4f6",
                            padding: "0.2rem 0.5rem",
                            borderRadius: "4px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {nombre_reponses} rép.
                        </span>
                      </div>
                      <p style={{ fontSize: "0.85rem", color: "#6b7280", marginTop: "0.5rem" }}>
                        Source : Baromètre participatif
                      </p>
                    </div>

                    <div
                      style={{
                        background: "#f9fafb",
                        border: "1px dashed #d1d5db",
                        borderRadius: "8px",
                        padding: "1rem",
                        marginTop: "1rem",
                        textAlign: "center",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          color: "#4b5563",
                          background: "#e5e7eb",
                          padding: "0.2rem 0.5rem",
                          borderRadius: "4px",
                          marginBottom: "0.5rem",
                        }}
                      >
                        Distribution confidentielle
                      </span>
                      <p style={{ fontSize: "0.85rem", color: "#4b5563", margin: 0, lineHeight: 1.4 }}>
                        {nombre_reponses === 0
                          ? "Aucun répondant n'a renseigné cette question."
                          : "Effectif inférieur au seuil de 5 réponses. Le détail graphique est masqué pour protéger l'anonymat."}
                      </p>
                    </div>
                  </div>
                );
              }

              // Cas où la distribution est visible (≥ 5 réponses)
              const chartData = {
                labels: reponses.map((r) => optionLabelMap.get(r.reponse) || r.reponse),
                datasets: [
                  {
                    label: "Nombre de réponses",
                    data: reponses.map((r) => r.nombre),
                    backgroundColor: SECONDARY_BAR_COLOR,
                    borderRadius: 6,
                  },
                ],
              };

              const chartOptions = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (context) => ` ${context.parsed.y} réponse(s)`,
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { precision: 0 },
                    grid: { color: "#f3f4f6" },
                  },
                  x: {
                    grid: { display: false },
                    ticks: {
                      maxRotation: 45,
                      minRotation: 0,
                      font: { size: 11 },
                    },
                  },
                },
              };

              return (
                <div
                  key={q.cle}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "14px",
                    padding: "1.25rem",
                  }}
                >
                  <ChartCard
                    type="bar"
                    titre={q.libelle}
                    unite={`${nombre_reponses} réponse(s)`}
                    source="Baromètre participatif"
                    data={chartData}
                    options={chartOptions}
                  />
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
