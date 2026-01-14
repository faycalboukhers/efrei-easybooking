import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          EasyBooking
        </Link>

        <div className="nav-menu">
          {isAuthenticated ? (
            <>
              <Link to="/rooms" className="nav-link">
                Chambres
              </Link>
              <Link to="/my-bookings" className="nav-link">
                Mes réservations
              </Link>
              <div className="nav-user">
                <span>Bonjour, {user?.username}</span>
                <button onClick={handleLogout} className="btn-logout">
                  Déconnexion
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Connexion
              </Link>
              <Link to="/signup" className="nav-link btn-signup">
                S'inscrire
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;