import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import Notifications from './Notifications';
import './Header.css';

function Header({ user, isLanding = false }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="logo-container">
        <Logo />
      </div>
      <div className="header-right">
        {isLanding ? (
          <div className="auth-buttons">
            <button className="login-button" onClick={() => navigate('/login')}>Login</button>
            <button className="register-button" onClick={() => navigate('/register')}>Register</button>
          </div>
        ) : user ? (
          <div className="user-info">
            <span>Welcome, {user.full_name}</span>
            <Notifications user={user} />
            <button className="logout-button" onClick={handleLogout}>Logout</button>
          </div>
        ) : null}
      </div>
    </header>
  );
}

export default Header;