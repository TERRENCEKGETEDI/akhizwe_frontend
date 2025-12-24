import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './Header';
import Logo from './Logo';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (user && (user.role === 'ADMIN' || user.role === 'admin')) {
      navigate('/admin');
    }
  }, [user, navigate]);

  if (!user) {
    // Landing page for non-logged users
    return (
      <div className="home-page">
        <Header isLanding={true} />
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
        <Header user={user} />
        <div className="button-grid">
          <button className="dashboard-button" onClick={() => navigate('/airtime-data')}>Airtime & Data</button>
          <button className="dashboard-button" onClick={() => navigate('/video-music')}>Video and Music</button>
          <button className="dashboard-button" onClick={() => navigate('/tickets')}>Tickets</button>
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