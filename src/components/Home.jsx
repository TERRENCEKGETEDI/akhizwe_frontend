import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from './Header';
import Logo from './Logo';
import { Icons } from './Icons';
import './Home.css';

function Home() {
  console.log('Home component rendering');
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user && (user.role === 'ADMIN' || user.role === 'admin')) {
      navigate('/admin');
    }
  }, [user, navigate]);

  const handleProfileUpdate = (profileData) => {
    // Update user data in localStorage and state
    const updatedUser = { ...user, ...profileData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  if (!user) {
    // Landing page for non-logged users
    return (
      <div className="home-page">
        <Header isLanding={true} onProfileUpdate={handleProfileUpdate} />
        <main className="body">
          <div className="welcome-section">
            <h1>Welcome to AKHİZWE TECHNOLOGİES</h1>
            <p>Discover amazing content and services.</p>
            <div className="features-grid">
              <div className="feature-card">
                <h3>Airtime & Data</h3>
                <p>Top up your mobile airtime and data bundles instantly.</p>
              </div>
              <div className="feature-card">
                <h3>Video & Music</h3>
                <p>Stream unlimited videos and music content.</p>
              </div>
              <div className="feature-card">
                <h3>Tickets</h3>
                <p>Book tickets for events and entertainment.</p>
              </div>
            </div>
            <div className="cta-section">
              <button className="cta-button" onClick={() => navigate('/register')}>Get Started</button>
              <button className="cta-button secondary" onClick={() => navigate('/login')}>Sign In</button>
            </div>
          </div>
        </main>
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-section">
              <Logo />
              <p>Creating Advanced Communities</p>
            </div>
            <div className="footer-section">
              <h4>Services</h4>
              <ul>
                <li>Airtime & Data</li>
                <li>Video & Music</li>
                <li>Tickets</li>
                <li>Account Management</li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Contact</h4>
              <p>Email: info@akhizwe.com</p>
              <p>Phone: +27 123 456 7890</p>
            </div>
            <div className="footer-section">
              <h4>Follow Us</h4>
              <div className="social-links">
                <a href="#" className="social-link">Facebook</a>
                <a href="#" className="social-link">Twitter</a>
                <a href="#" className="social-link">Instagram</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2023 Akhizwe Technologies. All rights reserved.</p>
          </div>
        </footer>
      </div>
    );
  }

  // Dashboard for logged-in users (USER role)
  if (user.role === 'USER' || user.role === 'user') {
    return (
      <div className="dashboard">
        <Header user={user} onProfileUpdate={handleProfileUpdate} />
        <div className="dashboard-welcome">
          <h2 className="dashboard-title">Welcome back, {user.full_name || user.email}!</h2>
          <p className="dashboard-subtitle">Choose a service to get started</p>
        </div>
        <div className="navigation-buttons">
          <button 
            className="nav-button nav-button-primary"
            onClick={() => navigate('/airtime-data')}
            aria-label="Navigate to Airtime and Data services"
          >
            <div className="nav-button-content">
              <div className="nav-button-icon">
                <Icons.phoneData size="w-8 h-8" />
              </div>
              <div className="nav-button-text">
                <h3 className="nav-button-title">Airtime & Data</h3>
                <p className="nav-button-description">Top up airtime and data bundles</p>
              </div>
              <div className="nav-button-arrow">
                <Icons.arrowRight size="w-5 h-5" />
              </div>
            </div>
          </button>
          
          <button 
            className="nav-button nav-button-secondary"
            onClick={() => navigate('/video-music')}
            aria-label="Navigate to Video and Music services"
          >
            <div className="nav-button-content">
              <div className="nav-button-icon">
                <Icons.videoMusic size="w-8 h-8" />
              </div>
              <div className="nav-button-text">
                <h3 className="nav-button-title">Video & Music</h3>
                <p className="nav-button-description">Stream and download content</p>
              </div>
              <div className="nav-button-arrow">
                <Icons.arrowRight size="w-5 h-5" />
              </div>
            </div>
          </button>
          
          <button 
            className="nav-button nav-button-tertiary"
            onClick={() => navigate('/tickets')}
            aria-label="Navigate to Tickets services"
          >
            <div className="nav-button-content">
              <div className="nav-button-icon">
                <Icons.tickets size="w-8 h-8" />
              </div>
              <div className="nav-button-text">
                <h3 className="nav-button-title">Tickets</h3>
                <p className="nav-button-description">Book event and cinema tickets</p>
              </div>
              <div className="nav-button-arrow">
                <Icons.arrowRight size="w-5 h-5" />
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // For other roles, show access denied (though admins are redirected via useEffect)
  return (
    <div>
      <h2>Access Denied</h2>
      <button onClick={() => { localStorage.clear(); navigate('/login'); }}>Logout</button>
    </div>
  );
}

export default Home;