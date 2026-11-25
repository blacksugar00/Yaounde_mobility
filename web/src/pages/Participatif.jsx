import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getQuestions, postBarometre } from "../api/client";

// Groupes thématiques pour ordonner les 17 questions
const GROUPES = [
  {
    id: "profil",
    titre: "Profil et foyer",
    description: "Informations sociodémographiques pour contextualiser les besoins.",
    cles: [
      "sexe",
      "tranche_age",
      "quartier_residence",
      "taille_foyer",
      "vehicules_foyer",
      "permis_conduire",
      "abonnement_transport",
    ],
  },
  {
    id: "habitudes",
    titre: "Pratiques de déplacement",
    description: "Vos habitudes de mobilité au quotidien dans l'aire urbaine.",
    cles: ["mode_principal", "motif_principal", "duree_trajet"],
  },
  {
    id: "taxis",
    titre: "Taxis et motos-taxis",
    description: "Usage, appréciation et perception de la sécurité des transports artisanaux.",
    cles: [
      "frequence_taxi",
      "frequence_moto_taxi",
      "situation_moto_taxi",
      "securite_taxi",
      "preoccupation_moto_taxi",
    ],
  },
  {
    id: "priorites",
    titre: "Critères et priorités d'action",
    description: "Vos attentes majeures pour améliorer la mobilité à Yaoundé.",
    cles: ["critere_choix", "priorite_mobilite"],
  },
];

export default function Participatif() {
  const [questions, setQuestions] = useState([]);
  const [consentText, setConsentText] = useState("");
  const [chargement, setChargement] = useState(true);
  const [erreurInit, setErreurInit] = useState(null);

  // État du formulaire
  const [reponses, setReponses] = useState({});
  const [consentement, setConsentement] = useState(false);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [erreurEnvoi, setErreurEnvoi] = useState(null);
  const [succes, setSucces] = useState(false);

  useEffect(() => {
    let actif = true;
    getQuestions()
      .then((data) => {
        if (!actif) return;
        setQuestions(data.questions || []);
        setConsentText(
          data.consentement_texte ||
            "Je consens à la collecte et au traitement anonyme de mes réponses dans le cadre de l'Observatoire de la mobilité de Yaoundé à des fins d'analyse statistique."
        );
        setChargement(false);
      })
      .catch((err) => {
        if (!actif) return;
        setErreurInit(err.message);
        setChargement(false);
      });
    return () => {
      actif = false;
    };
  }, []);

  const handleChange = (cle, valeur) => {
    setReponses((prev) => {
      const maj = { ...prev };
      if (!valeur) {
        delete maj[cle];
      } else {
        maj[cle] = valeur;
      }
      return maj;
    });
    if (erreurEnvoi) setErreurEnvoi(null);
  };

  const reponsesCount = Object.keys(reponses).length;
  const peutSoumettre = consentement && reponsesCount > 0 && !envoiEnCours;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!peutSoumettre) return;

    setEnvoiEnCours(true);
    setErreurEnvoi(null);

    try {
      await postBarometre({
        consentement: true,
        reponses,
      });
      setSucces(true);
      setReponses({});
      setConsentement(false);
    } catch (err) {
      setErreurEnvoi(err.message || "Échec de l'envoi du formulaire.");
    } finally {
      setEnvoiEnCours(false);
    }
  };

  if (chargement) {
    return (
      <main style={{ maxWidth: "860px", margin: "0 auto", padding: "3rem 1.5rem" }}>
        <div style={{ height: "32px", width: "40%", background: "#e5e7eb", borderRadius: "8px", marginBottom: "1rem" }} />
        <div style={{ height: "20px", width: "70%", background: "#f3f4f6", borderRadius: "6px", marginBottom: "2.5rem" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ height: "180px", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "12px" }} />
          <div style={{ height: "180px", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "12px" }} />
        </div>
      </main>
    );
  }

  if (erreurInit) {
    return (
      <main style={{ maxWidth: "860px", margin: "0 auto", padding: "4rem 1.5rem", textAlign: "center" }}>
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            padding: "2rem",
            borderRadius: "12px",
          }}
        >
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            Questionnaire temporairement indisponible
          </h2>
          <p style={{ fontSize: "0.95rem", color: "#b91c1c", lineHeight: 1.5, marginBottom: "1.5rem" }}>
            {erreurInit}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              background: "#111827",
              color: "#ffffff",
              border: "none",
              padding: "0.6rem 1.25rem",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Réessayer
          </button>
        </div>
      </main>
    );
  }

  if (succes) {
    return (
      <main style={{ maxWidth: "720px", margin: "0 auto", padding: "4rem 1.5rem" }}>
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "16px",
            padding: "3rem 2rem",
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "#ecfdf5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#059669"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#111827", letterSpacing: "-0.5px", marginBottom: "0.75rem" }}>
            Contribution enregistrée
          </h2>
          <p style={{ color: "#4b5563", fontSize: "1.05rem", lineHeight: 1.6, maxWidth: "520px", margin: "0 auto 2rem" }}>
            Merci pour votre participation. Vos réponses ont été ajoutées de manière strictement anonyme à l'Observatoire
            pour guider les analyses de déplacement urbain à Yaoundé.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setSucces(false)}
              style={{
                background: "#ffffff",
                color: "#111827",
                border: "1px solid #d1d5db",
                padding: "0.75rem 1.5rem",
                borderRadius: "8px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Transmettre une autre réponse
            </button>
            <Link
              to="/resultats"
              style={{
                background: "#2563eb",
                color: "#ffffff",
                padding: "0.75rem 1.5rem",
                borderRadius: "8px",
                fontWeight: 600,
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Consulter les résultats
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Mapper les questions pour accès rapide par clé
  const questionMap = new Map(questions.map((q) => [q.cle, q]));

  return (
    <main style={{ maxWidth: "860px", margin: "0 auto", padding: "clamp(1.5rem, 4vw, 3rem) clamp(1rem, 3vw, 1.5rem)" }}>
      {/* En-tête */}
      <header style={{ border: "none", padding: 0, background: "transparent", display: "block", position: "static", boxShadow: "none", marginBottom: "2rem" }}>
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
          Baromètre citoyen
        </span>
        <h1
          style={{
            fontSize: "clamp(1.75rem, 5vw, 2.35rem)",
            fontWeight: 800,
            color: "#111827",
            letterSpacing: "-0.75px",
            lineHeight: 1.2,
            marginBottom: "0.75rem",
          }}
        >
          Enquête sur la mobilité à Yaoundé
        </h1>
        <p
          style={{
            color: "#4b5563",
            fontSize: "1.05rem",
            lineHeight: 1.6,
            maxWidth: "68ch",
          }}
        >
          Ce questionnaire facultatif recueille vos pratiques et vos attentes. Vos réponses sont totalement anonymes
          et serviront à construire des agrégats statistiques transparents pour la collectivité.
        </p>
      </header>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {GROUPES.map((groupe, gIdx) => {
          const questionsDuGroupe = groupe.cles
            .map((cle) => questionMap.get(cle))
            .filter(Boolean);

          if (questionsDuGroupe.length === 0) return null;

          return (
            <fieldset
              key={groupe.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "14px",
                background: "#ffffff",
                padding: "clamp(1.25rem, 3vw, 2rem)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
              }}
            >
              <legend
                style={{
                  fontWeight: 700,
                  fontSize: "1.15rem",
                  color: "#111827",
                  padding: "0 0.5rem",
                }}
              >
                <span
                  style={{
                    color: "#6b7280",
                    fontWeight: 500,
                    marginRight: "0.5rem",
                  }}
                >
                  {String(gIdx + 1).padStart(2, "0")}.
                </span>
                {groupe.titre}
              </legend>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "#6b7280",
                  marginBottom: "1.5rem",
                  lineHeight: 1.5,
                }}
              >
                {groupe.description}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {questionsDuGroupe.map((q) => {
                  const valeurActuelle = reponses[q.cle] || "";
                  const estQuartier = q.cle === "quartier_residence";

                  return (
                    <div
                      key={q.cle}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.4rem",
                      }}
                    >
                      <label
                        htmlFor={`input-${q.cle}`}
                        style={{
                          fontSize: "0.95rem",
                          fontWeight: 600,
                          color: "#1f2937",
                          lineHeight: 1.4,
                        }}
                      >
                        {q.libelle}
                      </label>

                      {estQuartier || q.options.length > 5 ? (
                        <select
                          id={`input-${q.cle}`}
                          value={valeurActuelle}
                          onChange={(e) => handleChange(q.cle, e.target.value)}
                          style={{
                            width: "100%",
                            padding: "0.65rem 0.85rem",
                            fontSize: "0.95rem",
                            borderRadius: "8px",
                            border: "1px solid #d1d5db",
                            background: "#ffffff",
                            color: valeurActuelle ? "#111827" : "#6b7280",
                            outline: "none",
                            minHeight: "44px",
                          }}
                        >
                          <option value="">Sélectionner une option (facultatif)</option>
                          {q.options.map((opt) => (
                            <option key={opt.valeur} value={opt.valeur}>
                              {opt.libelle}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "0.5rem",
                            marginTop: "0.2rem",
                          }}
                        >
                          {q.options.map((opt) => {
                            const estSelectionne = valeurActuelle === opt.valeur;
                            return (
                              <button
                                key={opt.valeur}
                                type="button"
                                onClick={() =>
                                  handleChange(
                                    q.cle,
                                    estSelectionne ? "" : opt.valeur
                                  )
                                }
                                style={{
                                  padding: "0.5rem 1rem",
                                  minHeight: "44px",
                                  borderRadius: "8px",
                                  border: estSelectionne
                                    ? "1px solid #2563eb"
                                    : "1px solid #d1d5db",
                                  background: estSelectionne ? "#eff6ff" : "#ffffff",
                                  color: estSelectionne ? "#1d4ed8" : "#374151",
                                  fontWeight: estSelectionne ? 600 : 500,
                                  fontSize: "0.9rem",
                                  cursor: "pointer",
                                  transition: "all 0.15s ease",
                                }}
                              >
                                {opt.libelle}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </fieldset>
          );
        })}

        {/* Bloc Consentement & Soumission */}
        <section
          style={{
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: "14px",
            padding: "clamp(1.25rem, 3vw, 1.75rem)",
          }}
        >
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111827", marginBottom: "0.5rem" }}>
            Consentement et validation
          </h2>
          <p
            style={{
              fontSize: "0.9rem",
              color: "#4b5563",
              lineHeight: 1.55,
              background: "#ffffff",
              padding: "0.85rem 1rem",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              marginBottom: "1.25rem",
            }}
          >
            {consentText}
          </p>

          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.75rem",
              cursor: "pointer",
              marginBottom: "1.5rem",
            }}
          >
            <input
              type="checkbox"
              checked={consentement}
              onChange={(e) => setConsentement(e.target.checked)}
              style={{
                width: "20px",
                height: "20px",
                marginTop: "2px",
                accentColor: "#2563eb",
                cursor: "pointer",
              }}
            />
            <span style={{ fontSize: "0.95rem", color: "#1f2937", fontWeight: 500, lineHeight: 1.4 }}>
              J'ai pris connaissance de ces conditions et je consens à la transmission anonyme de mes réponses.
            </span>
          </label>

          {erreurEnvoi && (
            <div
              style={{
                padding: "0.75rem 1rem",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "8px",
                color: "#991b1b",
                fontSize: "0.9rem",
                marginBottom: "1.25rem",
              }}
            >
              {erreurEnvoi}
            </div>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
              {reponsesCount === 0 ? (
                "Renseignez au moins une réponse pour soumettre."
              ) : (
                <span style={{ color: "#059669", fontWeight: 600 }}>
                  {reponsesCount} question{reponsesCount > 1 ? "s" : ""} renseignée{reponsesCount > 1 ? "s" : ""}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={!peutSoumettre}
              style={{
                background: peutSoumettre ? "#2563eb" : "#9ca3af",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "0.75rem 1.75rem",
                fontSize: "0.95rem",
                fontWeight: 600,
                cursor: peutSoumettre ? "pointer" : "not-allowed",
                transition: "background 0.2s ease, transform 0.1s ease",
                minHeight: "44px",
              }}
              onMouseDown={(e) => {
                if (peutSoumettre) e.currentTarget.style.transform = "translateY(1px)";
              }}
              onMouseUp={(e) => {
                if (peutSoumettre) e.currentTarget.style.transform = "none";
              }}
            >
              {envoiEnCours ? "Envoi en cours..." : "Transmettre mes réponses"}
            </button>
          </div>
        </section>
      </form>
    </main>
  );
}
