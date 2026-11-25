import { NavLink, Outlet } from 'react-router-dom';
import armoiries from './assets/armoiries.jpg';
import drapeau from './assets/drapeau.jpg';

export default function Layout() {
  return (
    <div>
      <header>
        <div className="header-left">
          <img src={armoiries} alt="Armoiries" />
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

        {/* Le drapeau bien séparé */}
        <div className="header-right" style={{ marginLeft: '2rem', paddingLeft: '2rem', borderLeft: '1px solid var(--border)' }}>
          <img src={drapeau} alt="Drapeau" style={{ height: '35px', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }} />
        </div>
      </header>
      
      <main>
        <Outlet />
      </main>

      <footer style={{ 
        textAlign: 'center', padding: '3rem 2rem', color: 'var(--text-muted)', 
        borderTop: '1px solid var(--border)', marginTop: '4rem', background: 'white'
      }}>
        <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>© 2026 Observatoire de la Mobilité Urbaine de Yaoundé</p>
        <p style={{ fontSize: '0.9rem' }}>Ministère des Transports • Communauté Urbaine de Yaoundé</p>
      </footer>
    </div>
  );
}
