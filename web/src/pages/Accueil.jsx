import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpenCheck,
  CalendarRange,
  CheckCircle2,
  ClipboardList,
  Compass,
  History,
  Layers,
  Map as MapIcon,
  MapPin,
  TrendingUp,
  Users,
} from "lucide-react";
import yaoundeVille from "../assets/yaounde-ville.jpg";
import carteYaounde from "../assets/carte-yaounde.jpg";

const MODULES_PLATEFORME = [
  {
    to: "/retrospectif",
    badge: "Passé & présent",
    titre: "Tendances historiques",
    description:
      "Analysez l'évolution de la mobilité à Yaoundé de 2000 à 2025 : croissance démographique, répartition des déplacements par mode, essor des motos-taxis et motorisation.",
    points: ["Population urbaine", "Parts modales", "Parc de véhicules"],
    cta: "Explorer la rétrospective",
    accent: "blue",
    Icon: TrendingUp,
  },
  {
    to: "/prospectif",
    badge: "Horizon 2026–2036",
    titre: "Projections 2036",
    description:
      "Simulez et comparez trois trajectoires d'avenir pour anticiper les besoins en transport, les temps de parcours et les émissions de gaz à effet de serre.",
    scenarios: [
      { nom: "Tendanciel", couleur: "#E67E22" },
      { nom: "Volontariste", couleur: "#27AE60" },
      { nom: "Rupture", couleur: "#2980B9" },
    ],
    cta: "Comparer les scénarios",
    accent: "orange",
    Icon: Compass,
  },
  {
    to: "/carte",
    badge: "Système d'information géographique",
    titre: "Cartographie interactive",
    description:
      "Explorez la ville quartier par quartier : visualisez les 105 zones de population (2018, 2025, 2035), le réseau de bus, les gares, carrefours et projets de voirie.",
    points: ["105 zones de population", "Réseau bus & projets", "Gares & carrefours"],
    image: carteYaounde,
    cta: "Ouvrir la carte",
    accent: "emerald",
    Icon: MapIcon,
  },
  {
    to: "/participatif",
    badge: "Enquête citoyenne",
    titre: "Baromètre participatif",
    description:
      "Partagez vos habitudes de déplacement, vos contraintes quotidiennes et vos priorités d'amélioration. Vos réponses anonymes nourrissent les statistiques de la ville.",
    points: ["17 questions rapides", "105 quartiers couverts", "100 % anonyme"],
    cta: "Répondre au baromètre",
    accent: "violet",
    Icon: ClipboardList,
  },
];

const REPERES = [
  {
    Icon: History,
    valeur: "2000 – 2025",
    label: "Données rétrospectives observées",
  },
  {
    Icon: Layers,
    valeur: "3 scénarios",
    label: "Trajectoires prospectives 2036",
  },
  {
    Icon: MapPin,
    valeur: "105 zones",
    label: "Quartiers & couches SIG cartographiés",
  },
  {
    Icon: Users,
    valeur: "17 questions",
    label: "Baromètre citoyen anonyme",
  },
];

export default function Accueil() {
  return (
    <div className="accueil-page">
      {/* 1. BANDEAU HERO */}
      <section
        className="hero-dvdh"
        style={{ backgroundImage: `url(${yaoundeVille})` }}
      >
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-pill">
            <MapPin size={15} aria-hidden="true" />
            <span>Plateforme territoriale • Yaoundé</span>
          </div>
          <h2>Observatoire de la Mobilité de Yaoundé</h2>
          <p>
            Comprendre les dynamiques passées, simuler les scénarios 2026–2036,
            cartographier les infrastructures et recueillir la parole citoyenne.
          </p>
          <div className="hero-actions">
            <Link to="/prospectif" className="btn-dvdh btn-dvdh--primary">
              <Compass size={18} aria-hidden="true" />
              <span>Explorer les scénarios</span>
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link to="/participatif" className="btn-dvdh btn-dvdh--ghost">
              <ClipboardList size={18} aria-hidden="true" />
              <span>Participer au baromètre</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. BANDEAU REPÈRES CLÉS */}
      <div className="accueil-container">
        <div className="kpi-strip reveal" aria-label="Repères de la plateforme">
          {REPERES.map(({ Icon, valeur, label }) => (
            <div key={label} className="kpi-strip-item">
              <div className="kpi-strip-icon">
                <Icon size={20} aria-hidden="true" />
              </div>
              <div>
                <strong>{valeur}</strong>
                <span>{label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 3. DÉCOUVRIR LA PLATEFORME — 4 CARTES INTERACTIVES */}
        <section className="accueil-section">
          <div className="accueil-section-header reveal">
            <div className="page-eyebrow">
              <CalendarRange size={15} aria-hidden="true" />
              <span>Navigation guidée</span>
            </div>
            <h2>Découvrir la plateforme</h2>
            <p>
              Quatre volets complémentaires pour explorer les chiffres clés,
              projeter l’avenir urbain, lire le territoire et contribuer à
              l’observatoire.
            </p>
          </div>

          <div className="platform-grid">
            {MODULES_PLATEFORME.map((mod) => {
              const IconComponent = mod.Icon;
              return (
                <Link
                  key={mod.to}
                  to={mod.to}
                  className={`platform-card platform-card--${mod.accent} reveal`}
                >
                  <div className="platform-card-top">
                    <div className="platform-card-head">
                      <span className={`platform-icon platform-icon--${mod.accent}`}>
                        <IconComponent size={24} aria-hidden="true" />
                      </span>
                      <span className="platform-badge">{mod.badge}</span>
                    </div>

                    <h3>{mod.titre}</h3>
                    <p className="platform-desc">{mod.description}</p>

                    {mod.image && (
                      <div className="platform-map-preview">
                        <img
                          src={mod.image}
                          alt="Aperçu de la carte de Yaoundé"
                        />
                        <span className="platform-map-caption">
                          <MapPin size={13} aria-hidden="true" />
                          <span>Carte interactive de l’aire métropolitaine</span>
                        </span>
                      </div>
                    )}

                    {mod.scenarios && (
                      <div className="platform-tags">
                        {mod.scenarios.map((sc) => (
                          <span key={sc.nom} className="platform-scenario-pill">
                            <span
                              className="platform-scenario-dot"
                              style={{ backgroundColor: sc.couleur }}
                            />
                            {sc.nom}
                          </span>
                        ))}
                      </div>
                    )}

                    {mod.points && (
                      <ul className="platform-points">
                        {mod.points.map((pt) => (
                          <li key={pt}>
                            <CheckCircle2 size={14} aria-hidden="true" />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="platform-card-footer">
                    <span>{mod.cta}</span>
                    <ArrowRight
                      size={18}
                      className="platform-arrow"
                      aria-hidden="true"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 4. SECTION MÉTHODOLOGIE */}
        <section className="reveal bloc-methodo">
          <div className="methodo-icon-wrap">
            <BookOpenCheck size={28} aria-hidden="true" />
          </div>
          <h2>Une méthodologie transparente</h2>
          <p>
            Toutes les données présentées sur cette plateforme proviennent de
            sources officielles (CUY, DVDH, SUMP 2019, WUP ONU) et distinguent
            clairement les observations historiques des trajectoires simulées.
          </p>
          <div className="methodo-statuses" aria-label="Niveaux de donnée">
            <span className="status-pill status-pill--mesure">Mesuré</span>
            <span className="status-pill status-pill--estime">Estimé</span>
            <span className="status-pill status-pill--projete">Projeté</span>
          </div>
          <Link to="/methodologie" className="btn-dvdh btn-dvdh--primary">
            <span>Lire la méthodologie</span>
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </section>
      </div>
    </div>
  );
}
