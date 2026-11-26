import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
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
  const [etape, setEtape] = useState(0);
  const haut = useRef(null);

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
      <div className="survey" aria-busy="true">
        <div className="skeleton" style={{ height: 90, marginBottom: "1.25rem" }} />
        <div className="skeleton" style={{ height: 380 }} />
      </div>
    );
  }

  if (erreurInit) {
    return (
      <div className="survey">
        <div className="state state--box" role="alert">
          <h2>Questionnaire temporairement indisponible</h2>
          <p>{erreurInit}</p>
          <button type="button" className="btn btn--secondary" onClick={() => window.location.reload()}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (succes) {
    return (
      <div className="survey">
        <div className="card survey-done">
          <div className="success-mark" aria-hidden="true">
            <Check size={26} strokeWidth={2.5} />
          </div>
          <h2 style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>Contribution enregistrée</h2>
          <p className="lead" style={{ margin: "0 auto 1.75rem" }}>
            Merci pour votre participation. Vos réponses ont été ajoutées de manière anonyme et ne
            seront publiées que sous forme agrégée.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => {
                setSucces(false);
                setEtape(0);
              }}
            >
              Transmettre une autre réponse
            </button>
            <Link to="/resultats" className="btn btn--primary">Consulter les résultats</Link>
          </div>
        </div>
      </div>
    );
  }

  const questionMap = new Map(questions.map((q) => [q.cle, q]));
  const etapes = GROUPES.map((g) => ({
    ...g,
    questions: g.cles.map((cle) => questionMap.get(cle)).filter(Boolean),
  })).filter((g) => g.questions.length > 0);
  const totalQuestions = etapes.reduce((n, g) => n + g.questions.length, 0);
  const indexEnvoi = etapes.length;
  const surEnvoi = etape >= indexEnvoi;
  const groupe = etapes[etape];
  const progression = totalQuestions ? Math.round((reponsesCount / totalQuestions) * 100) : 0;
  const repondues = (g) => g.questions.filter((q) => reponses[q.cle]).length;

  const allerA = (i) => {
    setEtape(i);
    haut.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="survey" ref={haut}>
      <div className="survey-progress card">
        <div className="survey-progress-head">
          <span>
            <strong>{reponsesCount}</strong> / {totalQuestions} questions renseignées
          </span>
          <span className="survey-progress-pct">{progression} %</span>
        </div>
        <div className="progress" role="progressbar" aria-valuenow={progression} aria-valuemin={0} aria-valuemax={100} aria-label="Progression du questionnaire">
          <div className="progress-bar" style={{ width: `${progression}%` }} />
        </div>

        <ol className="steps">
          {etapes.map((g, i) => {
            const n = repondues(g);
            return (
              <li key={g.id}>
                <button
                  type="button"
                  className="step"
                  aria-current={etape === i ? "step" : undefined}
                  data-done={n === g.questions.length || undefined}
                  onClick={() => allerA(i)}
                >
                  <span className="step-num">{n === g.questions.length ? <Check size={14} strokeWidth={3} /> : i + 1}</span>
                  <span className="step-text">
                    <span className="step-title">{g.titre}</span>
                    <span className="step-count">{n}/{g.questions.length}</span>
                  </span>
                </button>
              </li>
            );
          })}
          <li>
            <button type="button" className="step" aria-current={surEnvoi ? "step" : undefined} onClick={() => allerA(indexEnvoi)}>
              <span className="step-num">{indexEnvoi + 1}</span>
              <span className="step-text">
                <span className="step-title">Envoi</span>
                <span className="step-count">consentement</span>
              </span>
            </button>
          </li>
        </ol>
      </div>

      <form onSubmit={handleSubmit}>
        {!surEnvoi && groupe && (
          <fieldset key={groupe.id} className="form-group survey-step">
            <legend>
              <span className="form-group-num">{String(etape + 1).padStart(2, "0")}</span>
              {groupe.titre}
            </legend>
            <p className="form-group-desc">{groupe.description} Toutes les questions sont facultatives.</p>

            <div className="stack" style={{ gap: "1.6rem" }}>
              {groupe.questions.map((q) => {
                const valeurActuelle = reponses[q.cle] || "";
                const enListe = q.cle === "quartier_residence" || q.options.length > 5;
                const idLabel = `label-${q.cle}`;

                return (
                  <div key={q.cle} className={`question${valeurActuelle ? " is-answered" : ""}`}>
                    <div className="question-head">
                      {enListe ? (
                        <label htmlFor={`input-${q.cle}`} id={idLabel} className="question-label">{q.libelle}</label>
                      ) : (
                        <span id={idLabel} className="question-label">{q.libelle}</span>
                      )}
                      {valeurActuelle && (
                        <button type="button" className="question-clear" onClick={() => handleChange(q.cle, "")}>
                          Effacer
                        </button>
                      )}
                    </div>
                    {enListe ? (
                      <select
                        id={`input-${q.cle}`}
                        className="select"
                        value={valeurActuelle}
                        onChange={(e) => handleChange(q.cle, e.target.value)}
                      >
                        <option value="">Sélectionner (facultatif)</option>
                        {q.options.map((opt) => (
                          <option key={opt.valeur} value={opt.valeur}>{opt.libelle}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="choices" role="group" aria-labelledby={idLabel}>
                        {q.options.map((opt) => {
                          const estSelectionne = valeurActuelle === opt.valeur;
                          return (
                            <button
                              key={opt.valeur}
                              type="button"
                              className="choice"
                              aria-pressed={estSelectionne}
                              onClick={() => handleChange(q.cle, estSelectionne ? "" : opt.valeur)}
                            >
                              {estSelectionne && <Check size={15} strokeWidth={3} aria-hidden="true" />}
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

            <div className="survey-nav">
              <button type="button" className="btn btn--secondary" onClick={() => allerA(etape - 1)} disabled={etape === 0}>
                <ArrowLeft size={16} aria-hidden="true" /> Précédent
              </button>
              <button type="button" className="btn btn--primary" onClick={() => allerA(etape + 1)}>
                {etape + 1 === indexEnvoi ? "Vérifier et envoyer" : "Suivant"} <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          </fieldset>
        )}

        {surEnvoi && (
          <section className="form-group survey-step">
            <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>Récapitulatif et envoi</h2>
            <ul className="recap">
              {etapes.map((g, i) => (
                <li key={g.id}>
                  <span>{g.titre}</span>
                  <button type="button" className="link-arrow" onClick={() => allerA(i)}>
                    {repondues(g)}/{g.questions.length} renseignées · modifier
                  </button>
                </li>
              ))}
            </ul>

            <p className="consent-text">{consentText}</p>

            <label className="check" style={{ alignItems: "flex-start" }}>
              <input
                type="checkbox"
                checked={consentement}
                onChange={(e) => setConsentement(e.target.checked)}
                style={{ marginTop: 2 }}
              />
              <span>J'ai pris connaissance de ces conditions et je consens à la transmission anonyme de mes réponses.</span>
            </label>

            {erreurEnvoi && (
              <p className="notice notice--error" role="alert" style={{ marginTop: "1rem" }}>{erreurEnvoi}</p>
            )}

            <div className="survey-nav">
              <button type="button" className="btn btn--secondary" onClick={() => allerA(indexEnvoi - 1)}>
                <ArrowLeft size={16} aria-hidden="true" /> Précédent
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                <span className={`form-count${reponsesCount > 0 ? " is-ok" : ""}`}>
                  {reponsesCount === 0 ? "Renseignez au moins une réponse." : `${reponsesCount} réponse${reponsesCount > 1 ? "s" : ""} prête${reponsesCount > 1 ? "s" : ""}`}
                </span>
                <button type="submit" className="btn btn--primary" disabled={!peutSoumettre}>
                  {envoiEnCours ? "Envoi en cours…" : "Transmettre mes réponses"}
                </button>
              </div>
            </div>
          </section>
        )}
      </form>
    </div>
  );
}
