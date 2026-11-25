import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import armoiries from './assets/armoiries.jpg';
import logoCuy from './assets/logo-cuy.jpg';   
import logoDvdh from './assets/logo-dvdh.jpg'; 
import logoUe from './assets/logo-ue.jpg';     
import logoEnspy from './assets/logo-enspy.jpg'; 

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function Layout() {
  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Quand ça rentre dans l'écran : on affiche
          entry.target.classList.add('active');
        } else {
          // Quand ça sort de l'écran : on cache (pour pouvoir rejouer l'animation)
          entry.target.classList.remove('active');
        }
      });
    }, { threshold: 0.15 }); // Se déclenche quand 15% de l'élément est visible

    reveals.forEach(reveal => observer.observe(reveal));
    return () => reveals.forEach(reveal => observer.unobserve(reveal));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <ScrollToTop />
      
      <header>
        <div className="header-left">
          <img src={armoiries} alt="Armoiries" style={{ height: '80px', objectFit: 'contain' }} />
          <div className="header-text">
            <h1>Observatoire de la Mobilité</h1>
            <span>République du Cameroun • Yaoundé</span>
          </div>
        </div>
        
        <nav>
          <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>Accueil</NavLink>
          <NavLink to="/retrospectif" className={({ isActive }) => isActive ? "active" : ""}>Rétrospectif</NavLink>
          <NavLink to="/prospectif" className={({ isActive }) => isActive ? "active" : ""}>Prospectif</NavLink>
          <NavLink to="/carte" className={({ isActive }) => isActive ? "active" : ""}>Carte</NavLink>
          <NavLink to="/participatif" className={({ isActive }) => isActive ? "active" : ""}>Participatif</NavLink>
          <NavLink to="/resultats" className={({ isActive }) => isActive ? "active" : ""}>Résultats</NavLink>
        </nav>

        <div className="header-right" style={{ marginLeft: '2rem', paddingLeft: '2rem', borderLeft: '1px solid var(--border)' }}>
          <img src={logoCuy} alt="Logo CUY" style={{ height: '120px', objectFit: 'contain' }} />
        </div>
      </header>
      
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      <footer style={{ background: 'white', borderTop: '1px solid var(--border)', padding: '4rem 3rem 2rem 3rem', marginTop: 'auto' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
          
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Partenaires</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                <img src={logoDvdh} alt="DVDH" style={{ height: '50px', objectFit: 'contain' }} />
                <img src={logoUe} alt="Union Européenne" style={{ height: '50px', objectFit: 'contain' }} />
                <img src={logoEnspy} alt="ENSPY" style={{ height: '50px', objectFit: 'contain' }} />
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Explorer</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <li><Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Accueil</Link></li>
              <li><Link to="/retrospectif" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Données rétrospectives</Link></li>
              <li><Link to="/prospectif" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Scénarios 2026-2036</Link></li>
              <li><Link to="/carte" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Cartographie interactive</Link></li>
            </ul>
          </div>

          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ressources</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <li><Link to="/methodologie" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Méthodologie & Sources</Link></li>
              <li><a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Foire Aux Questions (FAQ)</a></li>
              <li><a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Mentions légales</a></li>
              <li><a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Licences des données</a></li>
            </ul>
          </div>

          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1rem' }}>
              <strong>Communauté Urbaine de Yaoundé</strong><br />
              Hôtel de Ville, Yaoundé<br />
              Cameroun
            </p>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '2rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <p>© 2026 Observatoire de la Mobilité Urbaine de Yaoundé. Tous droits réservés.</p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span>Initiative CUY • DVDH • UE • ENSPY</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
