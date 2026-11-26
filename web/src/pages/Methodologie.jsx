import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import logoCuy from "../assets/logo-cuy.jpg";
import logoDvdh from "../assets/logo-dvdh.jpg";
import logoUe from "../assets/logo-ue.jpg";
import logoEnspy from "../assets/logo-enspy.jpg";
import logoOslandia from "../assets/logo-oslandia.png";

const ONGLETS = [
  { id: "sources", label: "Méthodologie & Sources" },
  { id: "faq", label: "Foire Aux Questions" },
  { id: "mentions", label: "Mentions légales" },
  { id: "licences", label: "Licences des données" },
];

const FAQ_ITEMS = [
  {
    id: 1,
    question: "D'où proviennent exactement les chiffres affichés ?",
    reponse:
      "Toutes les données présentées dans l'Observatoire proviennent de la Communauté Urbaine de Yaoundé (CUY). Elles sont issues des études du Plan de Mobilité Urbaine Soutenable (PMUS), des Enquêtes Ménages Déplacements et des modélisations conduites par le cabinet d'études DVDH (Des Villes et Des Hommes) avec l'accompagnement d'Oslandia.",
  },
  {
    id: 2,
    question: "Pourquoi certains indicateurs s'arrêtent en 2025 et d'autres vont jusqu'en 2036 ?",
    reponse:
      "La section Rétrospectif s'arrête à 2025 pour observer l'historique et les tendances consolidées récentes. La section Prospectif projette les 10 années suivantes (2026 à 2036) pour évaluer l'impact des futurs aménagements selon les 3 scénarios (Tendanciel, Volontariste, Rupture).",
  },
  {
    id: 3,
    question: "Quelle est la différence entre les scénarios Tendanciel, Volontariste et Rupture ?",
    reponse:
      "Le scénario Tendanciel prolonge les dynamiques actuelles (hausse des deux-roues et de la congestion). Le scénario Volontariste applique les investissements prioritaires du PMUS (couloirs bus et carrefours aménagés). Le scénario de Rupture transforme le réseau via des transports collectifs en site propre (BRT, train) et une décarbonation forte.",
  },
  {
    id: 4,
    question: "La carte des quartiers varie-t-elle selon les scénarios de transport ?",
    reponse:
      "Non. La carte présente la répartition de la population par quartier pour les années 2018, 2025 et 2035. Cette évolution démographique territoriale reste constante afin d'analyser comment chaque scénario de transport répond à ces besoins de population.",
  },
  {
    id: 5,
    question: "Mes réponses au questionnaire citoyen sont-elles anonymes ?",
    reponse:
      "Oui, totalement. Aucun identifiant nominatif, adresse IP ou numéro de téléphone n'est collecté. De plus, les résultats ne sont consultables que sous forme de statistiques agrégées, avec un masquage systématique des distributions dès qu'un groupe compte moins de 5 répondants (règle k >= 5).",
  },
  {
    id: 6,
    question: "Comment l'application est-elle déployée techniquement ?",
    reponse:
      "L'application est conteneurisée avec Docker via une image unifiée légère (< 500 Mo). Flask sert à la fois les routes de données de l'API et les fichiers statiques de l'interface React/Vite, avec un volume Docker persistant dédié aux réponses du baromètre.",
  },
];

export default function Methodologie() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("sources");
  const [openFaq, setOpenFaq] = useState([1]); // Première question ouverte par défaut

  // Synchronisation avec l'ancre d'URL (#sources, #faq, #mentions, #licences)
  useEffect(() => {
    const hash = location.hash.replace("#", "");
    if (["sources", "faq", "mentions", "licences"].includes(hash)) {
      setActiveTab(hash);
    }
  }, [location.hash]);

  const changerOnglet = (tabId) => {
    setActiveTab(tabId);
    window.location.hash = tabId;
  };

  const toggleFaq = (id) => {
    setOpenFaq((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div style={{ paddingBottom: "4rem" }}>
      {/* EN-TÊTE DE PAGE */}
      <section
        style={{
          background: "#ffffff",
          borderBottom: "1px solid var(--border)",
          padding: "3rem 2rem 2.5rem 2rem",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h1
            style={{
              fontSize: "2.4rem",
              fontWeight: 800,
              color: "#111827",
              letterSpacing: "-0.5px",
              marginBottom: "0.75rem",
            }}
          >
            Cadre méthodologique & Informations
          </h1>
          <p
            style={{
              fontSize: "1.1rem",
              color: "#4b5563",
              maxWidth: "850px",
              lineHeight: 1.6,
              marginBottom: "2rem",
            }}
          >
            Documentation officielle de l'Observatoire de la Mobilité Urbaine de Yaoundé : origines des données, scénarios de prospective, réponses aux questions fréquentes et cadre légal.
          </p>

          {/* BARRE D'ONGLETS */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
              borderBottom: "2px solid #e5e7eb",
              paddingBottom: "0",
            }}
          >
            {ONGLETS.map((tab) => {
              const estActif = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => changerOnglet(tab.id)}
                  style={{
                    padding: "0.75rem 1.4rem",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    border: "none",
                    borderBottom: estActif ? "3px solid #2c5282" : "3px solid transparent",
                    background: estActif ? "#f8fafc" : "transparent",
                    color: estActif ? "#2c5282" : "#64748b",
                    marginBottom: "-2px",
                    transition: "all 0.15s ease",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* CONTENU PRINCIPAL */}
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "2.5rem 2rem" }}>

        {/* ========================================================================= */}
        {/* ONGLET 1 : METHODOLOGIE & SOURCES                                         */}
        {/* ========================================================================= */}
        {activeTab === "sources" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>

            {/* 1. CONTEXTE HACKATHON & REALISATION */}
            <section>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", marginBottom: "0.75rem" }}>
                Contexte du projet & Réalisation
              </h2>
              <p style={{ color: "#4b5563", lineHeight: 1.6, fontSize: "1rem", marginBottom: "1.5rem" }}>
                L'Observatoire est développé dans le cadre du <strong>Hackathon de la Semaine de la Mobilité Durable à Yaoundé (SMDY)</strong>.
                La plateforme est réalisée par les <strong>étudiants-ingénieurs de l'École Nationale Supérieure Polytechnique de Yaoundé (ENSPY)</strong> participants au hackathon, sous l'impulsion et l'accompagnement des partenaires institutionnels du programme.
              </p>

              {/* CARTE PARTICIPANTS / REALISATION */}
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderLeft: "5px solid #111827",
                  padding: "1.25rem 1.5rem",
                  marginBottom: "2rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "1.5rem",
                  flexWrap: "wrap",
                }}
              >
                <img src={logoEnspy} alt="ENSPY" style={{ height: "55px", objectFit: "contain" }} />
                <div>
                  <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#111827" }}>
                    Réalisation : Étudiants de l'ENSPY
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#64748b", marginTop: "2px" }}>
                    Développement, ingénierie logicielle et intégration des données réalisés par les équipes étudiantes participantes au Hackathon SMDY.
                  </div>
                </div>
              </div>

              {/* LES PARTENAIRES DU PROGRAMME */}
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#111827", marginBottom: "1rem" }}>
                Partenaires du programme
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "1.25rem",
                  marginBottom: "1.5rem",
                }}
              >
                <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", padding: "1.25rem", textAlign: "center" }}>
                  <img src={logoCuy} alt="CUY" style={{ height: "55px", objectFit: "contain", marginBottom: "0.75rem" }} />
                  <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#111827" }}>CUY</div>
                  <div style={{ fontSize: "0.82rem", color: "#6b7280" }}>Communauté Urbaine de Yaoundé • Maîtrise d'ouvrage</div>
                </div>

                <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", padding: "1.25rem", textAlign: "center" }}>
                  <img src={logoDvdh} alt="DVDH" style={{ height: "55px", objectFit: "contain", marginBottom: "0.75rem" }} />
                  <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#111827" }}>DVDH</div>
                  <div style={{ fontSize: "0.82rem", color: "#6b7280" }}>Des Villes et Des Hommes • Conseil & Ingénierie urbaine</div>
                </div>

                <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", padding: "1.25rem", textAlign: "center" }}>
                  <img src={logoUe} alt="Union Européenne" style={{ height: "55px", objectFit: "contain", marginBottom: "0.75rem" }} />
                  <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#111827" }}>Union Européenne</div>
                  <div style={{ fontSize: "0.82rem", color: "#6b7280" }}>Financement du programme d'appui à la mobilité</div>
                </div>

                <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", padding: "1.25rem", textAlign: "center" }}>
                  <img src={logoOslandia} alt="Oslandia" style={{ height: "55px", objectFit: "contain", marginBottom: "0.75rem" }} />
                  <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#111827" }}>Oslandia</div>
                  <div style={{ fontSize: "0.82rem", color: "#6b7280" }}>Expertise en SIG & technologies Open Source</div>
                </div>
              </div>
            </section>

            {/* 2. PROVENANCE DES DONNEES */}
            <section>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", marginBottom: "0.5rem" }}>
                Origine des données : La Communauté Urbaine de Yaoundé (CUY)
              </h2>
              <p style={{ color: "#4b5563", lineHeight: 1.6, fontSize: "1rem", marginBottom: "1.25rem" }}>
                <strong>Toutes les données</strong> présentées dans l'Observatoire (statistiques rétrospectives, modélisations prospectives et couches géographiques) proviennent de la <strong>Communauté Urbaine de Yaoundé (CUY)</strong>, autorité publique organisatrice des mobilités métropolitaines. Elles ont été exploitées et structurées avec l'appui du cabinet d'études <strong>DVDH (Des Villes et Des Hommes)</strong>.
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                  gap: "1.5rem",
                }}
              >
                <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", padding: "1.75rem" }}>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#111827", marginBottom: "0.5rem" }}>
                    Le PMUS CUY (2018 & 2025)
                  </h3>
                  <p style={{ color: "#4b5563", fontSize: "0.92rem", lineHeight: 1.6 }}>
                    Le <strong>Plan de Mobilité Urbaine Soutenable (PMUS)</strong> de la CUY constitue le référentiel socle. Il capitalise les résultats des grandes Enquêtes Ménages Déplacements (EMD), les comptages directionnels aux carrefours et les points de référence officiels (2000, 2005, 2010, 2018 et 2025).
                  </p>
                </div>

                <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", padding: "1.75rem" }}>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#111827", marginBottom: "0.5rem" }}>
                    Les Séries et Projections (CUY / DVDH)
                  </h3>
                  <p style={{ color: "#4b5563", fontSize: "0.92rem", lineHeight: 1.6 }}>
                    Les séries officielles de la CUY (88 indicateurs retenus) structurées avec DVDH (Des Villes et Des Hommes) couvrent les dynamiques démographiques, les parcs de véhicules, les parts modales précises, les temps de déplacement et les émissions de gaz à effet de serre (GES recalculés sans double compte).
                  </p>
                </div>

                <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", padding: "1.75rem" }}>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#111827", marginBottom: "0.5rem" }}>
                    Le Référentiel Cartographique SIG (CUY)
                  </h3>
                  <p style={{ color: "#4b5563", fontSize: "0.92rem", lineHeight: 1.6 }}>
                    Les couches spatiales fournies par la CUY sont au standard EPSG:4326 (WGS84). Elles incluent le découpage en <strong>105 quartiers de Yaoundé</strong> (avec densités de population) et les infrastructures : lignes de bus, voiries majeures, carrefours, gares et projets de transport collectif.
                  </p>
                </div>
              </div>
            </section>

            {/* 3. LES 3 SCÉNARIOS PROSPECTIFS */}
            <section>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", marginBottom: "0.75rem" }}>
                Les 3 scénarios prospectifs (2026 — 2036)
              </h2>
              <p style={{ color: "#4b5563", lineHeight: 1.6, fontSize: "0.95rem", marginBottom: "1.25rem" }}>
                Pour tester l'impact des choix d'aménagement, les modèles comparent trois trajectoires cohérentes :
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderLeft: "5px solid #2980b9", padding: "1.25rem 1.5rem" }}>
                  <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "#111827", marginBottom: "0.25rem" }}>
                    Scénario Tendanciel
                  </div>
                  <p style={{ color: "#4b5563", fontSize: "0.92rem", lineHeight: 1.5, margin: 0 }}>
                    Poursuite des tendances passées sans inflexion majeure : croissance forte des deux-roues et de l'automobile, saturation continue de la voirie et augmentation des émissions.
                  </p>
                </div>

                <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderLeft: "5px solid #27ae60", padding: "1.25rem 1.5rem" }}>
                  <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "#111827", marginBottom: "0.25rem" }}>
                    Scénario Volontariste
                  </div>
                  <p style={{ color: "#4b5563", fontSize: "0.92rem", lineHeight: 1.5, margin: 0 }}>
                    Mise en œuvre prioritaire du PMUS : couloirs réservés aux bus, réaménagement des carrefours critiques, encadrement du stationnement et stabilisation des temps de trajet.
                  </p>
                </div>

                <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderLeft: "5px solid #d35400", padding: "1.25rem 1.5rem" }}>
                  <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "#111827", marginBottom: "0.25rem" }}>
                    Scénario de Rupture
                  </div>
                  <p style={{ color: "#4b5563", fontSize: "0.92rem", lineHeight: 1.5, margin: 0 }}>
                    Transformation profonde : création de lignes de transport en site propre (BRT / train urbain), requalification piétonne du centre et baisse substantielle de l'empreinte carbone.
                  </p>
                </div>
              </div>
            </section>

            {/* 4. CLASSIFICATION DES STATUTS & BAROMETRE */}
            <section>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", marginBottom: "0.75rem" }}>
                Statut des données & Baromètre citoyen
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "1.25rem",
                  marginBottom: "1.5rem",
                }}
              >
                <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", padding: "1.25rem" }}>
                  <strong style={{ color: "#2e7d32", display: "block", marginBottom: "0.35rem" }}>Donnée Mesurée</strong>
                  <p style={{ color: "#4b5563", fontSize: "0.88rem", lineHeight: 1.5, margin: 0 }}>
                    Constat direct issu d'enquêtes certifiées ou de recensements physiques (points d'ancrage historiques).
                  </p>
                </div>

                <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", padding: "1.25rem" }}>
                  <strong style={{ color: "#1565c0", display: "block", marginBottom: "0.35rem" }}>Donnée Estimée</strong>
                  <p style={{ color: "#4b5563", fontSize: "0.88rem", lineHeight: 1.5, margin: 0 }}>
                    Valeur calculée par interpolation statistique pour assurer la continuité des séries intermédiaires.
                  </p>
                </div>

                <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", padding: "1.25rem" }}>
                  <strong style={{ color: "#e65100", display: "block", marginBottom: "0.35rem" }}>Donnée Projetée</strong>
                  <p style={{ color: "#4b5563", fontSize: "0.88rem", lineHeight: 1.5, margin: 0 }}>
                    Résultat de simulation prospective sous hypothèses explicites (l'année 2036 étant extrapolée).
                  </p>
                </div>
              </div>

              <div style={{ background: "#f8fafc", border: "1px solid #e5e7eb", padding: "1.5rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111827", marginBottom: "0.5rem" }}>
                  Protection statistique du Baromètre Citoyen (Règle k &ge; 5)
                </h3>
                <p style={{ color: "#4b5563", fontSize: "0.92rem", lineHeight: 1.6, margin: 0 }}>
                  Le Baromètre recueille les avis via 17 questions à choix fermés. Pour garantir le secret statistique et l'anonymat complet des répondants, <strong>aucune donnée brute n'est publiée</strong>. Si une réponse ou un croisement compte moins de 5 personnes (seuil k &ge; 5), la distribution est automatiquement masquée sur la page des résultats.
                </p>
              </div>
            </section>

          </div>
        )}

        {/* ========================================================================= */}
        {/* ONGLET 2 : FOIRE AUX QUESTIONS (FAQ EN DROPDOWN)                          */}
        {/* ========================================================================= */}
        {activeTab === "faq" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", marginBottom: "0.5rem" }}>
                Foire Aux Questions (FAQ)
              </h2>
              <p style={{ color: "#4b5563", fontSize: "1rem", lineHeight: 1.6, margin: 0 }}>
                Cliquez sur une question pour afficher ou masquer la réponse détaillée.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {FAQ_ITEMS.map((item) => {
                const estOuvert = openFaq.includes(item.id);
                return (
                  <div
                    key={item.id}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e5e7eb",
                      transition: "border-color 0.15s ease",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(item.id)}
                      style={{
                        width: "100%",
                        padding: "1.25rem 1.5rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        background: estOuvert ? "#f8fafc" : "#ffffff",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                        gap: "1rem",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "1.05rem",
                          fontWeight: 700,
                          color: estOuvert ? "#2c5282" : "#111827",
                        }}
                      >
                        {item.question}
                      </span>
                      <span
                        style={{
                          fontSize: "0.9rem",
                          color: "#6b7280",
                          transform: estOuvert ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.2s ease",
                          flexShrink: 0,
                        }}
                      >
                        ▼
                      </span>
                    </button>

                    {estOuvert && (
                      <div
                        style={{
                          padding: "1.25rem 1.5rem",
                          borderTop: "1px solid #e5e7eb",
                          background: "#ffffff",
                        }}
                      >
                        <p
                          style={{
                            color: "#4b5563",
                            fontSize: "0.95rem",
                            lineHeight: 1.6,
                            margin: 0,
                          }}
                        >
                          {item.reponse}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ONGLET 3 : MENTIONS LÉGALES                                               */}
        {/* ========================================================================= */}
        {activeTab === "mentions" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", marginBottom: "0.25rem" }}>
              Mentions légales & Gouvernance
            </h2>

            {/* REALISATION DE LA PLATEFORME */}
            <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderLeft: "5px solid #2c5282", padding: "1.75rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111827", marginBottom: "0.5rem" }}>
                Réalisation de la plateforme
              </h3>
              <p style={{ color: "#4b5563", fontSize: "0.95rem", lineHeight: 1.6, margin: 0 }}>
                La plateforme a été conçue, développée et intégrée par les <strong>étudiants-ingénieurs de l'École Nationale Supérieure Polytechnique de Yaoundé (ENSPY)</strong> dans le cadre du Hackathon de la Semaine de la Mobilité Durable à Yaoundé (SMDY 2026).
              </p>
            </div>

            {/* PARTENAIRES DU PROGRAMME */}
            <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", padding: "1.75rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111827", marginBottom: "0.75rem" }}>
                Partenaires du programme & Cadre institutionnel
              </h3>
              <ul style={{ paddingLeft: "1.25rem", color: "#4b5563", fontSize: "0.95rem", lineHeight: 1.7, margin: 0 }}>
                <li><strong>Communauté Urbaine de Yaoundé (CUY) :</strong> Maîtrise d'ouvrage, autorité publique organisatrice des mobilités, collectivité territoriale métropolitaine et propriétaire légitime des données de transport.</li>
                <li><strong>DVDH (Des Villes et Des Hommes) :</strong> Cabinet d'études spécialisé ayant réalisé les études de mobilité, les projections et l'ingénierie du PMUS pour le compte de la CUY.</li>
                <li><strong>Union Européenne (UE) :</strong> Bailleur de fonds institutionnel finançant le programme d'appui à la mobilité soutenable de Yaoundé.</li>
                <li><strong>Oslandia :</strong> Partenaire technique apportant son expertise en Systèmes d'Information Géographique (SIG) Open Source et architecture de données spatiales.</li>
              </ul>
            </div>

            {/* PROTECTION DES DONNEES */}
            <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", padding: "1.75rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111827", marginBottom: "0.5rem" }}>
                Protection des données à caractère personnel
              </h3>
              <p style={{ color: "#4b5563", fontSize: "0.95rem", lineHeight: 1.6, margin: 0 }}>
                La plateforme ne dépose aucun cookie traceur à des fins publicitaires. La participation au baromètre citoyen est libre, volontaire et anonyme. Les réponses sont stockées localement de manière sécurisée et ne font l'objet d'aucune cession commerciale.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ONGLET 4 : LICENCES DES DONNÉES                                           */}
        {/* ========================================================================= */}
        {activeTab === "licences" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", marginBottom: "0.25rem" }}>
              Licences des données & Conditions de réutilisation
            </h2>

            <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", padding: "1.75rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111827", marginBottom: "0.5rem" }}>
                Principe d'Open Data & Réutilisation publique
              </h3>
              <p style={{ color: "#4b5563", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "1rem" }}>
                Les séries statistiques et les données cartographiques de l'Observatoire sont mises à disposition dans un objectif de transparence, de recherche scientifique et de valorisation citoyenne.
              </p>
              <p style={{ color: "#4b5563", fontSize: "0.95rem", lineHeight: 1.6, margin: 0 }}>
                Leur réutilisation est autorisée aux conditions suivantes :
              </p>
              <ul style={{ paddingLeft: "1.25rem", color: "#4b5563", fontSize: "0.92rem", lineHeight: 1.6, marginTop: "0.5rem" }}>
                <li><strong>Obligation de citation :</strong> mentionner explicitement la source : <em>« Observatoire de la Mobilité de Yaoundé (Données : Communauté Urbaine de Yaoundé - CUY / Études : DVDH - Des Villes et Des Hommes) »</em>.</li>
                <li><strong>Respect de l'intégrité :</strong> ne pas altérer les statuts des données (ne pas présenter une valeur « projetée » ou « estimée » comme une observation terrain « mesurée »).</li>
                <li><strong>Absence de finalité malveillante :</strong> ne pas tenter de désanonymiser les réponses issues du baromètre participatif.</li>
              </ul>
            </div>

            <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", padding: "1.75rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111827", marginBottom: "0.5rem" }}>
                Technologies logicielles Open Source & Déploiement Docker
              </h3>
              <p style={{ color: "#4b5563", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "1rem" }}>
                L'application est construite exclusivement avec des technologies libres, légères et pérennes :
              </p>
              <ul style={{ paddingLeft: "1.25rem", color: "#4b5563", fontSize: "0.92rem", lineHeight: 1.6, margin: 0 }}>
                <li><strong>Frontend :</strong> React 18, Vite, Chart.js et Leaflet pour une expérience cartographique et graphique fluide.</li>
                <li><strong>Backend API :</strong> Python 3.11 et Flask avec validation stricte des contrats de données.</li>
                <li><strong>Conteneurisation Docker :</strong> Déploiement autonome dans un conteneur unique unifié (&lt; 500 Mo) où Flask sert l'API et l'application compilée, avec un volume Docker persistant garantissant la pérennité du stockage local des réponses.</li>
              </ul>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
