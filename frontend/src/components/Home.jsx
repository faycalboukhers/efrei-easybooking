import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-container">
      <div className="hero">
        <h1>Bienvenue sur EasyBooking</h1>
        <p className="subtitle">
          Réservez facilement vos salles de réunion et espaces de travail
        </p>

        <div className="features">
          <div className="feature-card">
            <h3>Réservation Simple</h3>
            <p>Interface intuitive pour réserver vos salles en quelques clics</p>
          </div>
          <div className="feature-card">
            <h3>Disponibilité en Temps Réel</h3>
            <p>Consultez la disponibilité des salles instantanément</p>
          </div>
          <div className="feature-card">
            <h3>Gestion des Réservations</h3>
            <p>Consultez et gérez toutes vos réservations en un seul endroit</p>
          </div>
        </div>

        <div className="cta-buttons">
          {isAuthenticated ? (
            <Link to="/rooms" className="btn-cta">
              Voir les chambres
            </Link>
          ) : (
            <>
              <Link to="/signup" className="btn-cta">
                Créer un compte
              </Link>
              <Link to="/login" className="btn-cta-secondary">
                Se connecter
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;