import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { SCENARIO_COLORS } from "../components/palette";
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

const COUCHES_GEO = [
  { id: "zones_population", label: "Population par quartier (105 zones)" },
  { id: "reseau_bus", label: "Réseau de bus" },
  { id: "projets_voirie", label: "Projets de voirie" },
  { id: "projets_tp", label: "Projets de transport public" },
  { id: "gares", label: "Gares" },
  { id: "carrefours", label: "Carrefours" },
];

const SCENARIOS_DESC = [
  {
    cle: "tendanciel",
    nom: "Scénario tendanciel",
    texte: "Poursuite des tendances passées sans inflexion majeure : croissance forte des deux-roues et de l'automobile, saturation continue de la voirie et augmentation des émissions.",
  },
  {
    cle: "volontariste",
    nom: "Scénario volontariste",
    texte: "Mise en œuvre prioritaire du PMUS : couloirs réservés aux bus, réaménagement des carrefours critiques, encadrement du stationnement et stabilisation des temps de trajet.",
  },
  {
    cle: "rupture",
    nom: "Scénario de rupture",
    texte: "Transformation profonde : lignes de transport en site propre (BRT, train urbain), requalification piétonne du centre et baisse substantielle de l'empreinte carbone. Valeurs construites : hypothèse.",
  },
];

export default function Methodologie() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("sources");
  const [openFaq, setOpenFaq] = useState([1]); // Première question ouverte par défaut
  const [coucheExport, setCoucheExport] = useState(COUCHES_GEO[0].id);

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
    <div className="container page">
      <header className="page-head">
        <span className="kicker">Documentation</span>
        <h1>Méthodologie et informations</h1>
        <p className="lead">
          Origine des données, scénarios de prospective, questions fréquentes et cadre légal de
          l'Observatoire de la mobilité urbaine de Yaoundé.
        </p>
      </header>

      <div className="tabs" role="tablist" aria-label="Rubriques">
        {ONGLETS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            className="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => changerOnglet(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "sources" && (
        <div className="stack-lg">
          <section>
            <h2 className="section-title">Contexte et réalisation</h2>
            <p className="section-intro">
              L'Observatoire est développé dans le cadre du <strong>Hackathon de la Semaine de la Mobilité
              Durable à Yaoundé (SMDY)</strong> par les <strong>étudiants-ingénieurs de l'École Nationale
              Supérieure Polytechnique de Yaoundé (ENSPY)</strong>, avec l'accompagnement des partenaires
              institutionnels du programme.
            </p>

            <div className="card card--rule maker" style={{ marginBottom: "1.75rem" }}>
              <img src={logoEnspy} alt="ENSPY" />
              <div>
                <h3>Réalisation : étudiants de l'ENSPY</h3>
                <p>Développement, ingénierie logicielle et intégration des données réalisés par :</p>
                <ul className="team">
                  <li>NJOME David</li>
                  <li>EYEBE EYEBE Miguel</li>
                  <li>KIKI Daniel Bryan</li>
                  <li>KOUCHE NGAMENI Arron</li>
                </ul>
              </div>
            </div>

            <h3 style={{ marginBottom: "0.9rem" }}>Partenaires du programme</h3>
            <div className="grid grid-4">
              <div className="card partner">
                <img src={logoCuy} alt="CUY" />
                <strong>CUY</strong>
                <span>Communauté Urbaine de Yaoundé · maîtrise d'ouvrage</span>
              </div>
              <div className="card partner">
                <img src={logoDvdh} alt="DVDH" />
                <strong>DVDH</strong>
                <span>Des Villes et Des Hommes · conseil et ingénierie urbaine</span>
              </div>
              <div className="card partner">
                <img src={logoUe} alt="Union européenne" />
                <strong>Union européenne</strong>
                <span>Financement du programme d'appui à la mobilité</span>
              </div>
              <div className="card partner">
                <img src={logoOslandia} alt="Oslandia" />
                <strong>Oslandia</strong>
                <span>Expertise SIG et logiciels libres</span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="section-title">Origine des données</h2>
            <p className="section-intro">
              <strong>Toutes les données</strong> (séries rétrospectives, modélisations prospectives et couches
              géographiques) proviennent de la <strong>Communauté Urbaine de Yaoundé (CUY)</strong>, autorité
              organisatrice des mobilités, et ont été structurées avec le cabinet <strong>DVDH</strong>.
            </p>
            <div className="grid grid-3">
              <div className="card">
                <h3>Le PMUS de la CUY (2018 et 2025)</h3>
                <p>
                  Le <strong>Plan de Mobilité Urbaine Soutenable</strong> constitue le référentiel : enquêtes
                  ménages déplacements, comptages aux carrefours et années de référence 2000, 2005, 2010,
                  2018 et 2025.
                </p>
              </div>
              <div className="card">
                <h3>Séries et projections (CUY / DVDH)</h3>
                <p>
                  88 indicateurs retenus : démographie, parc de véhicules, parts modales, temps de
                  déplacement et émissions de gaz à effet de serre (GES recalculés sans double compte).
                </p>
              </div>
              <div className="card">
                <h3>Référentiel cartographique (CUY)</h3>
                <p>
                  Couches en EPSG:4326 (WGS84) : découpage en <strong>105 quartiers</strong> avec leur
                  population, lignes de bus, voiries, carrefours, gares et projets de transport collectif.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="section-title">Les trois scénarios prospectifs (2026 – 2036)</h2>
            <p className="section-intro">
              Pour tester l'impact des choix d'aménagement, les modèles comparent trois trajectoires
              cohérentes. Les couleurs sont celles utilisées dans tous les graphiques.
            </p>
            <div className="stack" style={{ gap: "0.75rem" }}>
              {SCENARIOS_DESC.map((sc) => (
                <div key={sc.cle} className="card scenario-block" style={{ borderLeftColor: SCENARIO_COLORS[sc.cle] }}>
                  <h3>{sc.nom}</h3>
                  <p>{sc.texte}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="section-title">Statut des données</h2>
            <div className="grid grid-3" style={{ marginBottom: "1.25rem" }}>
              <div className="card">
                <span className="badge badge--green" style={{ marginBottom: "0.6rem" }}>Mesurée</span>
                <p>Constat direct issu d'enquêtes ou de recensements (années de référence historiques).</p>
              </div>
              <div className="card">
                <span className="badge badge--warn" style={{ marginBottom: "0.6rem" }}>Estimée</span>
                <p>Valeur interpolée pour assurer la continuité des séries entre deux années de référence (trait pointillé).</p>
              </div>
              <div className="card">
                <span className="badge" style={{ marginBottom: "0.6rem" }}>Projetée</span>
                <p>Résultat de simulation sous hypothèses explicites ; l'année 2036 est extrapolée.</p>
              </div>
            </div>

            <div className="notice notice--info">
              <strong>Protection statistique du baromètre (k ≥ 5).</strong> Le baromètre recueille les avis via
              17 questions à choix fermés. <strong>Aucune donnée brute n'est publiée</strong> : si une catégorie
              compte moins de 5 personnes, la distribution est masquée sur la page des résultats.
            </div>
          </section>
        </div>
      )}

      {activeTab === "faq" && (
        <section>
          <h2 className="section-title">Questions fréquentes</h2>
          <p className="section-intro">Sélectionnez une question pour afficher la réponse.</p>
          <div className="faq">
            {FAQ_ITEMS.map((item) => {
              const estOuvert = openFaq.includes(item.id);
              return (
                <div key={item.id} className="faq-item">
                  <button
                    type="button"
                    className="faq-q"
                    aria-expanded={estOuvert}
                    aria-controls={`faq-${item.id}`}
                    onClick={() => toggleFaq(item.id)}
                  >
                    <span>{item.question}</span>
                    <ChevronDown size={18} aria-hidden="true" />
                  </button>
                  {estOuvert && (
                    <p id={`faq-${item.id}`} className="faq-a">{item.reponse}</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {activeTab === "mentions" && (
        <div className="stack">
          <h2 className="section-title">Mentions légales et gouvernance</h2>

          <div className="card card--rule">
            <h3>Réalisation de la plateforme</h3>
            <p>
              La plateforme a été conçue, développée et intégrée par les <strong>étudiants-ingénieurs de
              l'École Nationale Supérieure Polytechnique de Yaoundé (ENSPY)</strong> dans le cadre du
              Hackathon de la Semaine de la Mobilité Durable à Yaoundé (SMDY 2026).
            </p>
          </div>

          <div className="card">
            <h3>Partenaires du programme et cadre institutionnel</h3>
            <ul>
              <li><strong>Communauté Urbaine de Yaoundé (CUY) :</strong> maîtrise d'ouvrage, autorité publique organisatrice des mobilités et propriétaire des données de transport.</li>
              <li><strong>DVDH (Des Villes et Des Hommes) :</strong> cabinet d'études ayant réalisé les études de mobilité, les projections et l'ingénierie du PMUS pour la CUY.</li>
              <li><strong>Union européenne :</strong> bailleur finançant le programme d'appui à la mobilité soutenable de Yaoundé.</li>
              <li><strong>Oslandia :</strong> partenaire technique, expertise en systèmes d'information géographique libres.</li>
            </ul>
          </div>

          <div className="card">
            <h3>Protection des données à caractère personnel</h3>
            <p>
              La plateforme ne dépose aucun cookie publicitaire. La participation au baromètre est libre,
              volontaire et anonyme. Les réponses sont stockées localement et ne font l'objet d'aucune
              cession commerciale.
            </p>
          </div>
        </div>
      )}

      {activeTab === "licences" && (
        <div className="stack">
          <h2 className="section-title">Licences et conditions de réutilisation</h2>

          <div id="telechargements" className="card">
            <h3>Télécharger les données</h3>
            <p>
              Certaines données de l'Observatoire peuvent être téléchargées. Les valeurs sont fournies telles
              qu'elles sont affichées, sans recalcul, avec leur scénario, leur statut et leur origine. Les
              réponses individuelles du baromètre ne sont jamais publiées.
            </p>
            <div className="download-row">
              <div className="download">
                <strong>Indicateurs</strong>
                <div className="download-controls">
                  <a href="/api/export/indicateurs.csv" download className="btn btn--primary btn--sm">Télécharger</a>
                </div>
                <small>Format CSV · 88 indicateurs, tous scénarios</small>
              </div>
              <div className="download">
                <label htmlFor="couche-export"><strong>Données géographiques</strong></label>
                <div className="download-controls">
                  <select
                    id="couche-export"
                    className="select"
                    value={coucheExport}
                    onChange={(e) => setCoucheExport(e.target.value)}
                  >
                    {COUCHES_GEO.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                  <a href={`/api/export/geojson/${coucheExport}.geojson`} download className="btn btn--primary btn--sm">
                    Télécharger
                  </a>
                </div>
                <small>Format GeoJSON</small>
              </div>
            </div>
          </div>

          <div className="card">
            <h3>Conditions de réutilisation</h3>
            <p style={{ marginBottom: "0.6rem" }}>
              Les séries et les données cartographiques présentées servent la transparence, la recherche et
              l'information des citoyens. Leur réutilisation suppose de :
            </p>
            <ul>
              <li><strong>Citer la source :</strong> <em>« Observatoire de la Mobilité de Yaoundé (Données : Communauté Urbaine de Yaoundé – CUY / Études : DVDH – Des Villes et Des Hommes) »</em>.</li>
              <li><strong>Respecter l'intégrité :</strong> ne pas présenter une valeur projetée ou estimée comme une observation mesurée.</li>
              <li><strong>Ne pas chercher à désanonymiser</strong> les réponses issues du baromètre participatif.</li>
            </ul>
          </div>

          <div className="card">
            <h3>Technologies et déploiement</h3>
            <ul>
              <li><strong>Interface :</strong> React, Vite, Chart.js et Leaflet.</li>
              <li><strong>API :</strong> Python 3.11 et Flask, avec validation stricte des contrats de données.</li>
              <li><strong>Déploiement :</strong> conteneur Docker unique où Flask sert l'API et l'interface, avec un volume persistant pour les réponses du baromètre.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
