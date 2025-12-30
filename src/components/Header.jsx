import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import Notifications from './Notifications';
import ProfileSimple from './ProfileSimple';
import './Header.css';

function Header({ user, isLanding = false, onProfileUpdate }) {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleProfileClick = () => {
    setShowProfile(true);
    setShowDropdown(false);
  };

  const handleProfileClose = () => {
    setShowProfile(false);
  };

  const handleProfileUpdate = (profileData) => {
    // Update user data in parent component if callback provided
    if (onProfileUpdate) {
      onProfileUpdate(profileData);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowDropdown(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.full_name) {
      return user.full_name
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.charAt(0)?.toUpperCase() || 'U';
  };

  return (
    <>
      <header className="header">
        <div className="logo-container">
          <Logo />
        </div>
        <div className="header-right">
          {isLanding ? (
            <div className="auth-buttons">
              <button 
                className="login-button" 
                onClick={() => navigate('/login')}
                aria-label="Go to login page"
              >
                Login
              </button>
              <button 
                className="register-button" 
                onClick={() => navigate('/register')}
                aria-label="Go to registration page"
              >
                Register
              </button>
            </div>
          ) : user ? (
            <div className="user-info">
              <Notifications user={user} />
              
              {/* Profile Dropdown */}
              <div className="profile-dropdown" ref={dropdownRef}>
                <button 
                  className="profile-avatar-button"
                  onClick={() => setShowDropdown(!showDropdown)}
                  aria-label={`User menu for ${user.full_name || user.email}`}
                  aria-expanded={showDropdown}
                  aria-haspopup="true"
                >
                  <div className="profile-avatar">
                    {user.profile_picture ? (
                      <img 
                        src={user.profile_picture} 
                        alt={`${user.full_name || user.email}'s profile`}
                        className="profile-avatar-img"
                      />
                    ) : (
                      <span className="profile-avatar-text">{getUserInitials()}</span>
                    )}
                  </div>
                  <span className="profile-username">
                    {user.full_name || user.email}
                  </span>
                  <svg 
                    className={`dropdown-arrow ${showDropdown ? 'rotated' : ''}`}
                    width="12" 
                    height="12" 
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path 
                      d="M6 9L1 4H11L6 9Z" 
                      fill="currentColor"
                    />
                  </svg>
                </button>
                
                {showDropdown && (
                  <div className="dropdown-menu" role="menu">
                    <button 
                      className="dropdown-item profile-item"
                      onClick={handleProfileClick}
                      role="menuitem"
                    >
                      <svg className="dropdown-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 8C10.209 8 12 6.209 12 4C12 1.791 10.209 0 8 0C5.791 0 4 1.791 4 4C4 6.209 5.791 8 8 8ZM8 10C5.33 10 0 11.34 0 14V16H16V14C16 11.34 10.67 10 8 10Z"/>
                      </svg>
                      View Profile
                    </button>
                    <button 
                      className="dropdown-item"
                      onClick={handleLogout}
                      role="menuitem"
                    >
                      <svg className="dropdown-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M10 12L9 11L12 8H6V6H12L9 3L10 2L14 6L10 12Z"/>
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </header>
      
      {/* Profile Modal */}
      {showProfile && (
        <ProfileSimple 
          user={user}
          onClose={handleProfileClose}
          onProfileUpdate={handleProfileUpdate}
        />
      )}
    </>
  );
}

export default Header;