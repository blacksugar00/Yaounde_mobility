import { NavLink, Outlet } from "react-router-dom";

const ONGLETS = [
  { to: "/participatif", label: "Participatif" },
  { to: "/resultats", label: "Résultats" },
];

// Page commune du baromètre : en-tête + onglets, le contenu de l'onglet est rendu dans <Outlet />
export default function Barometre() {
  return (
    <div className="container page">
      <header className="page-head">
        <span className="kicker">Baromètre citoyen</span>
        <h1>Baromètre de la mobilité</h1>
        <p className="lead">
          Donnez votre avis sur vos déplacements à Yaoundé, puis consultez les résultats agrégés.
          Les réponses sont anonymes et ne sont publiées que sous forme de statistiques.
        </p>
      </header>

      <nav className="tabs" aria-label="Rubriques du baromètre">
        {ONGLETS.map((o) => (
          <NavLink key={o.to} to={o.to} className="tab">
            {o.label}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </div>
  );
}
