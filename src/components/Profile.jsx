import { useState, useEffect, useRef } from 'react';
import './Profile.css';

function Profile({ user, onClose, onProfileUpdate }) {
  const [profileData, setProfileData] = useState({
    email: '',
    fullName: '',
    phone: '',
    role: '',
    profilePicture: '',
    bio: '',
    walletBalance: 0
  });
  const [editingField, setEditingField] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const modalRef = useRef(null);

  // Load user profile on component mount
  useEffect(() => {
    loadProfile();
  }, []);

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Focus management for accessibility
  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.focus();
    }
  }, []);

  const loadProfile = async () => {
    try {
      console.log('Profile: Starting to load profile...');
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      console.log('Profile: Token available:', !!token);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Profile: Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to load profile: ${response.status}`);
      }

      const data = await response.json();
      console.log('Profile: Response data:', data);
      
      if (data.success) {
        console.log('Profile: Setting profile data:', data.data);
        setProfileData(data.data);
      } else {
        throw new Error(data.message || 'Failed to load profile');
      }
    } catch (error) {
      console.error('Profile: Error loading profile:', error);
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
      console.log('Profile: Loading finished');
    }
  };

  const handleEdit = (field) => {
    setEditingField(field);
    setFormData({ ...profileData });
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setEditingField(null);
    setFormData({});
    setError('');
    setSuccess('');
  };

  const handleSave = async (field) => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('token');
      const updateData = { [field]: formData[field] };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const data = await response.json();
      if (data.success) {
        setProfileData({ ...profileData, ...data.data });
        setEditingField(null);
        setFormData({});
        setSuccess(`${field} updated successfully!`);
        
        // Notify parent component of profile update
        if (onProfileUpdate) {
          onProfileUpdate(data.data);
        }
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      // Convert to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64 = e.target.result;
          
          const token = localStorage.getItem('token');
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/profile/picture`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ imageData: base64 })
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to upload image');
          }

          const data = await response.json();
          if (data.success) {
            setProfileData({ ...profileData, profilePicture: data.data.profilePicture });
            setSuccess('Profile picture updated successfully!');
            
            // Notify parent component
            if (onProfileUpdate) {
              onProfileUpdate({ ...profileData, profilePicture: data.data.profilePicture });
            }
          } else {
            throw new Error(data.message || 'Failed to upload image');
          }
        } catch (error) {
          console.error('Error uploading image:', error);
          setError(error.message);
        } finally {
          setSaving(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error reading file:', error);
      setError('Failed to process image.');
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const validateField = (field, value) => {
    switch (field) {
      case 'fullName':
        return value.trim().length > 0 ? '' : 'Full name is required';
      case 'bio':
        return value.length <= 500 ? '' : 'Bio must be 500 characters or less';
      default:
        return '';
    }
  };

  console.log('Profile: Component render, loading:', loading, 'profileData:', profileData);
  
  if (loading) {
    console.log('Profile: Showing loading state');
    return (
      <div className="profile-modal-overlay" onClick={onClose}>
        <div className="profile-modal" ref={modalRef} tabIndex="-1" role="dialog" aria-labelledby="profile-title">
          <div className="profile-loading">
            <div className="loading-spinner"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  try {
    console.log('Profile: Rendering main content');
    return (
      <div className="profile-modal-overlay" onClick={onClose}>
      <div 
        className="profile-modal" 
        ref={modalRef} 
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

        {error && (
          <div className="profile-error" role="alert" aria-live="polite">
            {error}
          </div>
        )}

        {success && (
          <div className="profile-success" role="alert" aria-live="polite">
            {success}
          </div>
        )}

        <div className="profile-content">
          {/* Profile Picture Section */}
          <div className="profile-section">
            <label className="profile-label">Profile Picture</label>
            <div className="profile-picture-container">
              <div className="profile-picture">
                {profileData.profilePicture ? (
                  <img 
                    src={profileData.profilePicture} 
                    alt="Profile picture"
                    className="profile-picture-img"
                  />
                ) : (
                  <div className="profile-picture-placeholder">
                    {profileData.fullName ? profileData.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </div>
              <div className="profile-picture-actions">
                <label htmlFor="profile-picture-input" className="profile-picture-button">
                  {saving ? 'Uploading...' : 'Change Picture'}
                </label>
                <input
                  id="profile-picture-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                  disabled={saving}
                />
              </div>
            </div>
          </div>

          {/* Email Field (Read-only) */}
          <div className="profile-section">
            <label className="profile-label">Email</label>
            <div className="profile-field-readonly">
              {profileData.email}
            </div>
          </div>

          {/* Full Name Field */}
          <div className="profile-section">
            <label className="profile-label" htmlFor="fullName-input">Full Name</label>
            {editingField === 'fullName' ? (
              <div className="profile-field-edit">
                <input
                  id="fullName-input"
                  type="text"
                  value={formData.fullName || ''}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="profile-input"
                  disabled={saving}
                  aria-describedby="fullName-error"
                />
                {validateField('fullName', formData.fullName) && (
                  <div id="fullName-error" className="profile-field-error">
                    {validateField('fullName', formData.fullName)}
                  </div>
                )}
                <div className="profile-field-actions">
                  <button 
                    onClick={() => handleSave('fullName')}
                    disabled={saving || !!validateField('fullName', formData.fullName)}
                    className="profile-save-button"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button 
                    onClick={handleCancel}
                    disabled={saving}
                    className="profile-cancel-button"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="profile-field-display">
                <span>{profileData.fullName}</span>
                <button 
                  onClick={() => handleEdit('fullName')}
                  className="profile-edit-button"
                  aria-label={`Edit full name: ${profileData.fullName}`}
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          {/* Phone Field (Read-only) */}
          <div className="profile-section">
            <label className="profile-label">Phone</label>
            <div className="profile-field-readonly">
              {profileData.phone}
            </div>
          </div>

          {/* Role Field (Read-only) */}
          <div className="profile-section">
            <label className="profile-label">Role</label>
            <div className="profile-field-readonly">
              {profileData.role}
            </div>
          </div>

          {/* Bio Field */}
          <div className="profile-section">
            <label className="profile-label" htmlFor="bio-input">Bio</label>
            {editingField === 'bio' ? (
              <div className="profile-field-edit">
                <textarea
                  id="bio-input"
                  value={formData.bio || ''}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="profile-textarea"
                  placeholder="Tell us about yourself..."
                  rows="4"
                  disabled={saving}
                  aria-describedby="bio-error bio-count"
                />
                <div className="profile-field-meta">
                  <span id="bio-count" className="profile-char-count">
                    {(formData.bio || '').length}/500
                  </span>
                  {validateField('bio', formData.bio) && (
                    <div id="bio-error" className="profile-field-error">
                      {validateField('bio', formData.bio)}
                    </div>
                  )}
                </div>
                <div className="profile-field-actions">
                  <button 
                    onClick={() => handleSave('bio')}
                    disabled={saving || !!validateField('bio', formData.bio)}
                    className="profile-save-button"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button 
                    onClick={handleCancel}
                    disabled={saving}
                    className="profile-cancel-button"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="profile-field-display">
                <span className="profile-bio-display">
                  {profileData.bio || 'No bio provided'}
                </span>
                <button 
                  onClick={() => handleEdit('bio')}
                  className="profile-edit-button"
                  aria-label="Edit bio"
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          {/* Wallet Balance (Read-only) */}
          <div className="profile-section">
            <label className="profile-label">Wallet Balance</label>
            <div className="profile-field-readonly">
              R{profileData.walletBalance?.toFixed(2) || '0.00'}
            </div>
          </div>
        </div>
      </div>
    </div>
    );
  } catch (error) {
    console.error('Profile: Render error:', error);
    return (
      <div className="profile-modal-overlay" onClick={onClose}>
        <div className="profile-modal" ref={modalRef} tabIndex="-1" role="dialog" aria-labelledby="profile-title">
          <div className="profile-error" role="alert">
            Error rendering profile. Please try again.
          </div>
        </div>
      </div>
    );
  }
}

export default Profile;