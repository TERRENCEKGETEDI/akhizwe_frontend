import { useState, useEffect } from 'react';
import './Profile.css';

function ProfileSimple({ user, onClose, onProfileUpdate }) {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      console.log('ProfileSimple: Starting to load profile...');
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('ProfileSimple: Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to load profile: ${response.status}`);
      }

      const data = await response.json();
      console.log('ProfileSimple: Response data:', data);
      
      if (data.success) {
        setProfileData(data.data);
      } else {
        throw new Error(data.message || 'Failed to load profile');
      }
    } catch (error) {
      console.error('ProfileSimple: Error loading profile:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-modal-overlay" onClick={onClose}>
        <div className="profile-modal" tabIndex="-1" role="dialog" aria-labelledby="profile-title">
          <div className="profile-loading">
            <div className="loading-spinner"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-modal-overlay" onClick={onClose}>
        <div className="profile-modal" tabIndex="-1" role="dialog" aria-labelledby="profile-title">
          <div className="profile-header">
            <h2 id="profile-title">User Profile</h2>
            <button className="profile-close-button" onClick={onClose}>×</button>
          </div>
          <div className="profile-error" role="alert">
            Error: {error}
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="profile-modal-overlay" onClick={onClose}>
        <div className="profile-modal" tabIndex="-1" role="dialog" aria-labelledby="profile-title">
          <div className="profile-header">
            <h2 id="profile-title">User Profile</h2>
            <button className="profile-close-button" onClick={onClose}>×</button>
          </div>
          <div className="profile-error" role="alert">
            No profile data available
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div 
        className="profile-modal" 
        tabIndex="-1" 
        role="dialog" 
        aria-labelledby="profile-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="profile-header">
          <h2 id="profile-title">User Profile</h2>
          <button 
            className="profile-close-button" 
            onClick={onClose}
            aria-label="Close profile"
          >
            ×
          </button>
        </div>

        <div className="profile-content">
          <div className="profile-section">
            <label className="profile-label">Email</label>
            <div className="profile-field-readonly">
              {profileData.email}
            </div>
          </div>

          <div className="profile-section">
            <label className="profile-label">Full Name</label>
            <div className="profile-field-readonly">
              {profileData.fullName}
            </div>
          </div>

          <div className="profile-section">
            <label className="profile-label">Phone</label>
            <div className="profile-field-readonly">
              {profileData.phone}
            </div>
          </div>

          <div className="profile-section">
            <label className="profile-label">Role</label>
            <div className="profile-field-readonly">
              {profileData.role}
            </div>
          </div>

          <div className="profile-section">
            <label className="profile-label">Bio</label>
            <div className="profile-field-readonly">
              {profileData.bio || 'No bio provided'}
            </div>
          </div>

          <div className="profile-section">
            <label className="profile-label">Wallet Balance</label>
            <div className="profile-field-readonly">
              R{parseFloat(profileData.walletBalance || 0).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileSimple;