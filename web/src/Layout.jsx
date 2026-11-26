import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import armoiries from './assets/armoiries.jpg';
import logoCuy from './assets/logo-cuy.jpg';
import logoDvdh from './assets/logo-dvdh.jpg';
import logoUe from './assets/logo-ue.jpg';
import logoEnspy from './assets/logo-enspy.jpg';
import logoOslandia from './assets/logo-oslandia.png';

const NAV = [
  { to: '/retrospectif', label: 'Rétrospectif' },
  { to: '/prospectif', label: 'Prospectif' },
  { to: '/carte', label: 'Carte' },
  { to: '/participatif', label: 'Participatif', inclut: ['/resultats'] },
];

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function Layout() {
  const { pathname } = useLocation();
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [routeMenu, setRouteMenu] = useState(pathname);

  // Le menu mobile se referme à chaque changement de page
  if (routeMenu !== pathname) {
    setRouteMenu(pathname);
    setMenuOuvert(false);
  }

  useEffect(() => {
    // Chaque élément .reveal apparaît une seule fois, à sa première entrée à l'écran
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    const surveiller = (racine) => {
      if (racine.nodeType !== 1) return;
      if (racine.matches('.reveal:not(.active)')) observer.observe(racine);
      racine.querySelectorAll('.reveal:not(.active)').forEach((el) => observer.observe(el));
    };

    surveiller(document.body);

    // Éléments ajoutés plus tard (graphiques affichés après le chargement des données, changement de page)
    const mutations = new MutationObserver((liste) => {
      liste.forEach((m) => m.addedNodes.forEach(surveiller));
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <ScrollToTop />

      <header className="site-header">
        <div className="flag-rule" aria-hidden="true" />
        <div className="site-header-inner">
          <Link to="/" className="brand" aria-label="Observatoire de la Mobilité — retour à l'accueil">
            <img src={armoiries} alt="" />
            <span className="brand-text">
              <span className="brand-title">Observatoire de la Mobilité</span>
              <span className="brand-sub">République du Cameroun · Yaoundé</span>
            </span>
          </Link>

          <button
            type="button"
            className="nav-toggle"
            aria-expanded={menuOuvert}
            aria-controls="site-nav"
            onClick={() => setMenuOuvert((v) => !v)}
          >
            {menuOuvert ? 'Fermer' : 'Menu'}
          </button>

          <nav id="site-nav" className={`site-nav${menuOuvert ? ' is-open' : ''}`} aria-label="Navigation principale">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => (isActive || item.inclut?.includes(pathname) ? 'active' : '')}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="header-partner">
            <img src={logoCuy} alt="Communauté Urbaine de Yaoundé" />
          </div>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <h2 className="footer-title">Partenaires</h2>
              <div className="footer-logos">
                <img src={logoCuy} alt="Communauté Urbaine de Yaoundé" />
                <img src={logoDvdh} alt="DVDH" />
                <img src={logoUe} alt="Union européenne" />
                <img src={logoOslandia} alt="Oslandia" style={{ height: 30 }} />
                <img src={logoEnspy} alt="ENSPY" />
              </div>
            </div>

            <div>
              <h2 className="footer-title">Explorer</h2>
              <ul className="footer-links">
                <li><Link to="/retrospectif">Données rétrospectives</Link></li>
                <li><Link to="/prospectif">Scénarios 2026–2036</Link></li>
                <li><Link to="/carte">Cartographie</Link></li>
                <li><Link to="/participatif">Baromètre citoyen</Link></li>
                <li><Link to="/resultats">Résultats du baromètre</Link></li>
              </ul>
            </div>

            <div>
              <h2 className="footer-title">Ressources</h2>
              <ul className="footer-links">
                <li><Link to="/methodologie#sources">Méthodologie et sources</Link></li>
                <li><Link to="/methodologie#faq">Questions fréquentes</Link></li>
                <li><Link to="/methodologie#mentions">Mentions légales</Link></li>
                <li><Link to="/methodologie#licences">Licences et téléchargements</Link></li>
              </ul>
            </div>

            <div>
              <h2 className="footer-title">Contact</h2>
              <p style={{ color: 'var(--ink-2)' }}>
                <strong>Communauté Urbaine de Yaoundé</strong><br />
                Hôtel de Ville, Yaoundé<br />
                Cameroun
              </p>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2026 Observatoire de la Mobilité Urbaine de Yaoundé</p>
            <p>Réalisation : étudiants de l'ENSPY · CUY · DVDH · UE · Oslandia</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
