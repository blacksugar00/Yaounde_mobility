import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import yaoundeVille from "../assets/yaounde-ville.jpg";
import { SCENARIO_COLORS } from "../components/palette";

const SCENARIOS = [
  ["tendanciel", "Tendanciel"],
  ["volontariste", "Volontariste"],
  ["rupture", "Rupture"],
];

function Fleche() {
  return <ArrowRight size={16} aria-hidden="true" />;
}

export default function Accueil() {
  return (
    <>
      <section className="hero" style={{ backgroundImage: `url(${yaoundeVille})` }}>
        <div className="container hero-inner">
          <span className="kicker">Communauté Urbaine de Yaoundé</span>
          <h1>Observatoire de la mobilité urbaine</h1>
          <p>
            Comprendre l'évolution des déplacements depuis 2000, comparer les scénarios
            à l'horizon 2036, lire le territoire quartier par quartier et recueillir
            la parole des habitants.
          </p>
          <div className="hero-actions">
            <Link to="/prospectif" className="btn btn--light">
              Comparer les scénarios <Fleche />
            </Link>
            <Link to="/participatif" className="btn btn--outline-light">
              Répondre au baromètre
            </Link>
          </div>
        </div>
      </section>

      <div className="container page" style={{ paddingTop: "clamp(2.5rem, 6vw, 3.5rem)" }}>
        <section>
          <h2 className="section-title reveal">Explorer l'observatoire</h2>
          <p className="section-intro reveal reveal-delay-1">
            Quatre entrées complémentaires, toutes alimentées par les séries de la CUY et
            les études du PMUS.
          </p>

          <div className="modules">
            <Link to="/retrospectif" className="module reveal">
              <span className="module-meta">2000 – 2025</span>
              <h3>Tendances historiques</h3>
              <p>
                Croissance démographique, répartition des déplacements par mode, essor des
                motos-taxis et évolution du parc de véhicules.
              </p>
              <ul className="module-list">
                <li>Population urbaine</li>
                <li>Parts modales</li>
                <li>Parc et motorisation</li>
              </ul>
              <div className="module-foot">
                <span className="link-arrow">Voir la rétrospective <Fleche /></span>
              </div>
            </Link>

            <Link to="/prospectif" className="module module--gold reveal reveal-delay-1">
              <span className="module-meta">Horizon 2026 – 2036</span>
              <h3>Projections</h3>
              <p>
                Trois trajectoires de modèle pour anticiper la demande de déplacement, les
                temps de parcours et les émissions de gaz à effet de serre.
              </p>
              <div className="scenario-legend">
                {SCENARIOS.map(([cle, nom]) => (
                  <span key={cle}>
                    <span className="dot" style={{ background: SCENARIO_COLORS[cle] }} />
                    {nom}
                  </span>
                ))}
              </div>
              <div className="module-foot">
                <span className="link-arrow">Comparer les scénarios <Fleche /></span>
              </div>
            </Link>

            <Link to="/carte" className="module module--ink reveal reveal-delay-2">
              <span className="module-meta">Système d'information géographique</span>
              <h3>Cartographie</h3>
              <p>
                Les 105 quartiers et leur population en 2018, 2025 et 2035, avec le réseau de
                bus, les gares, les carrefours et les projets de voirie.
              </p>
              <ul className="module-list">
                <li>105 zones</li>
                <li>Réseau de bus</li>
                <li>Projets d'infrastructure</li>
              </ul>
              <div className="module-foot">
                <span className="link-arrow">Ouvrir la carte <Fleche /></span>
              </div>
            </Link>

            <div className="module module--red reveal reveal-delay-3">
              <span className="module-meta">Enquête citoyenne</span>
              <h3>Baromètre</h3>
              <p>
                Dix-sept questions facultatives sur vos déplacements et vos priorités. Les
                réponses sont anonymes et publiées uniquement sous forme agrégée.
              </p>
              <ul className="module-list">
                <li>17 questions</li>
                <li>105 quartiers</li>
                <li>Anonyme</li>
              </ul>
              <div className="module-foot">
                <Link to="/participatif" className="link-arrow">Répondre au questionnaire <Fleche /></Link>
                <Link to="/resultats" className="link-arrow">Voir les résultats <Fleche /></Link>
              </div>
            </div>
          </div>
        </section>

        <section className="section band reveal">
          <div>
            <h2 className="section-title">Une méthodologie transparente</h2>
            <p>
              Les données proviennent de la Communauté Urbaine de Yaoundé et des études DVDH.
              Chaque graphique distingue les valeurs observées, les estimations et les
              projections de modèle.
            </p>
          </div>
          <div className="band-side">
            <div className="status-list">
              <span className="badge badge--green">Mesuré</span>
              <span className="badge badge--warn">Estimé</span>
              <span className="badge">Projeté</span>
            </div>
            <Link to="/methodologie" className="btn btn--secondary">
              Lire la méthodologie <Fleche />
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
