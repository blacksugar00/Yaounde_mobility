import { Link } from 'react-router-dom';
import yaoundeVille from '../assets/yaounde-ville.jpg'; // JPG ici
import carteYaounde from '../assets/carte-yaounde.jpg'; // JPG ici

export default function Accueil() {
  return (
    <div>
      {/* Bandeau d'accueil (Hero) */}
      <section 
        className="hero" 
        style={{ 
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.8)), url(${yaoundeVille})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          border: 'none'
        }}
      >
        <h2 style={{ color: 'white' }}>Comprendre la mobilité de Yaoundé</h2>
        <p style={{ color: '#e5e7eb' }}>
          Explorez les données historiques, simulez les trajectoires jusqu'en 2036 selon 3 scénarios, 
          et découvrez les enjeux territoriaux à travers notre carte interactive.
        </p>
        <Link to="/prospectif" className="btn-primary">
          Explorer les scénarios 2026-2036
        </Link>
      </section>

      {/* Section Cartes */}
      <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Aperçu de la plateforme</h2>
      <div className="dashboard-grid">
        
        <div className="chart-card" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '10px', fontSize: '1.2rem', fontWeight: '700' }}>📊 Tendances historiques</h3>
          <p style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: '1.5' }}>Découvrez l'évolution de la population, des parts modales et des émissions.</p>
        </div>

        <div className="chart-card" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '10px', fontSize: '1.2rem', fontWeight: '700' }}>🔮 Projections 2036</h3>
          <p style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: '1.5' }}>Comparez les scénarios Tendanciel, Volontariste et Rupture.</p>
        </div>

        {/* Carte avec l'image de la map et l'épingle */}
        <div className="chart-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* L'image illustre juste la carte, elle est jolie */}
          <img src={carteYaounde} alt="Carte Yaoundé" style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
          <div style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '10px', fontSize: '1.2rem', fontWeight: '700' }}>🗺️ Cartographie interactive</h3>
            <p style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: '1.5' }}>Visualisez les arrondissements, le réseau routier et les équipements.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
