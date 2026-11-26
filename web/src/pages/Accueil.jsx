import { Link } from 'react-router-dom';
import yaoundeVille from '../assets/yaounde-ville.jpg';
import carteYaounde from '../assets/carte-yaounde.jpg';

export default function Accueil() {
  return (
    <div style={{ paddingBottom: '4rem' }}>
      
      {/* 1. BANDEAU (HERO) - L'image prend 60% de l'écran */}
      <section 
        className="hero-dvdh" 
        style={{ backgroundImage: `url(${yaoundeVille})` }}
      >
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h2>Observatoire de la Mobilité de Yaoundé</h2>
          <p>Comprendre le passé, simuler l'avenir (2026-2036) et cartographier le territoire.</p>
          <Link to="/prospectif" className="btn-dvdh">
            Explorer les scénarios
          </Link>
        </div>
      </section>

      {/* 2. SECTION DÉCOUVRIR (Apparaît au scroll) */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
        
        <div className="reveal" style={{ marginTop: '4rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', color: '#111827' }}>Découvrir la plateforme</h2>
          <p style={{ color: '#6b7280', fontSize: '1.1rem', marginTop: '0.5rem' }}>
            Trois modules pour comprendre les enjeux de la mobilité urbaine à Yaoundé.
          </p>
        </div>
        
        <div className="dashboard-grid" style={{ margin: 0 }}>
          
          <div className="chart-card reveal" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '10px', fontSize: '1.2rem', fontWeight: '700' }}>📊 Tendances historiques</h3>
            <p style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: '1.5' }}>Découvrez l'évolution de la population, des parts modales et des émissions jusqu'à aujourd'hui.</p>
          </div>

          <div className="chart-card reveal" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '10px', fontSize: '1.2rem', fontWeight: '700' }}>🔮 Projections 2036</h3>
            <p style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: '1.5' }}>Comparez les scénarios Tendanciel, Volontariste et Rupture pour anticiper les besoins.</p>
          </div>

          <div className="chart-card reveal" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <img src={carteYaounde} alt="Carte Yaoundé" style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
            <div style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '10px', fontSize: '1.2rem', fontWeight: '700' }}>🗺️ Cartographie interactive</h3>
              <p style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: '1.5' }}>Visualisez les arrondissements, le réseau routier et les équipements de la ville.</p>
            </div>
          </div>
        </div>

        {/* 3. NOUVELLE SECTION POUR FORCER LE SCROLL (Apparaît aussi) */}
        <div className="reveal bloc-methodo" style={{ marginTop: '6rem', padding: '3rem', background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: '#111827' }}>Une méthodologie transparente</h2>
          <p style={{ color: '#6b7280', maxWidth: '800px', margin: '0 auto 2rem auto', lineHeight: '1.6' }}>
            Toutes les données présentées sur cette plateforme sont issues de sources officielles (CUY, DVDH, SUMP 2019) 
            et sont rigoureusement classées par statut : <strong>mesuré</strong>, <strong>estimé</strong> ou <strong>projeté</strong>.
          </p>
          <Link to="/methodologie" className="btn-dvdh">
            Lire la méthodologie
          </Link>
        </div>

      </div>
    </div>
  );
}
