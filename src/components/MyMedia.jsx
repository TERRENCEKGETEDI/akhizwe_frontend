import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import './MyMedia.css';

const MyMedia = ({ user, token, onMediaUpdate = () => {} }) => {
  // Component state
  const [myMedia, setMyMedia] = useState([]);
  const [realtimeNotifications, setRealtimeNotifications] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('uploaded_at');
  const [filterBy, setFilterBy] = useState('all'); // all, approved, pending, rejected

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (token && user) {
      const newSocket = io(import.meta.env.VITE_API_URL, {
        auth: { token: token }
      });

      newSocket.on('connect', () => {
        console.log('Connected to WebSocket server');
      });

      newSocket.on('new_notification', (notification) => {
        console.log('Received real-time notification:', notification);
        setRealtimeNotifications(prev => [notification, ...prev.slice(0, 4)]);
        
        // If it's a media approval/rejection notification, refresh user's media
        if (notification.notification_type === 'MEDIA_APPROVED' || notification.notification_type === 'MEDIA_REJECTED') {
          fetchMyMedia();
          console.log('Media status changed, refreshing My Media list');
          onMediaUpdate(notification);
        }
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
      });

      newSocket.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [token, user, onMediaUpdate]);

  // Fetch user's media
  const fetchMyMedia = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/media/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Authentication failed - please log in again');
        }
        throw new Error(`Failed to fetch media: ${res.status}`);
      }
      
      const data = await res.json();
      setMyMedia(data.media || []);
    } catch (error) {
      console.error('Error fetching my media:', error);
      setError(error.message || 'Failed to load your media');
    } finally {
      setIsLoading(false);
    }
  };

  // Load media on component mount
  useEffect(() => {
    if (token) {
      fetchMyMedia();
    }
  }, [token]);

  // Helper function to generate Supabase URL for media
  const getMediaUrl = useCallback((mediaItem) => {
    if (mediaItem.signed_url) {
      return mediaItem.signed_url;
    }
    
    const bucket = mediaItem.media_type === 'video' ? 'videos' : 
                   mediaItem.media_type === 'audio' ? 'audio' : 
                   mediaItem.media_type === 'image' ? 'images' : 'videos';
    
    if (mediaItem.file_path) {
      return `https://rkuzqajmxnatyulwoxzy.supabase.co/storage/v1/object/public/${bucket}/${encodeURIComponent(mediaItem.file_path)}`;
    }
    
    return '';
  }, []);

  // Filter and sort media
  const filteredAndSortedMedia = myMedia
    .filter(media => {
      if (filterBy === 'all') return true;
      return media.status === filterBy;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'uploaded_at':
          return new Date(b.uploaded_at) - new Date(a.uploaded_at);
        case 'likes':
          return (b.likes || 0) - (a.likes || 0);
        case 'views':
          return (b.view_count || 0) - (a.view_count || 0);
        default:
          return 0;
      }
    });

  // Calculate statistics
  const stats = {
    total: myMedia.length,
    approved: myMedia.filter(m => m.status === 'approved').length,
    pending: myMedia.filter(m => m.status === 'pending').length,
    rejected: myMedia.filter(m => m.status === 'rejected').length
  };

  // Handle media deletion
  const handleDeleteMedia = async (mediaId, mediaTitle) => {
    if (!confirm(`Are you sure you want to delete "${mediaTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/media/${mediaId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete media');
      }

      // Remove from local state
      setMyMedia(prev => prev.filter(m => m.media_id !== mediaId));
      alert('Media deleted successfully');
      
    } catch (error) {
      console.error('Error deleting media:', error);
      alert(`Failed to delete media: ${error.message}`);
    }
  };

  // Handle media edit and re-upload (for rejected content)
  const handleEditAndReupload = async (mediaItem) => {
    const newDescription = prompt('Edit your description and re-upload:', mediaItem.description || '');
    
    if (newDescription === null) {
      return; // User cancelled
    }

    try {
      // Create form data for re-upload
      const formData = new FormData();
      formData.append('title', mediaItem.title);
      formData.append('description', newDescription);
      formData.append('media_type', mediaItem.media_type);
      formData.append('category', mediaItem.category || '');
      formData.append('reupload', 'true');
      formData.append('original_media_id', mediaItem.media_id);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/media/reupload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to re-upload media');
      }

      const data = await response.json();
      alert(data.message || 'Media re-uploaded successfully!');
      fetchMyMedia(); // Refresh the list
      
    } catch (error) {
      console.error('Error re-uploading media:', error);
      alert(`Failed to re-upload media: ${error.message}`);
    }
  };

  // Handle sort change
  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
  };

  // Handle filter change
  const handleFilterChange = (newFilterBy) => {
    setFilterBy(newFilterBy);
  };

  // Get status display info
  const getStatusInfo = (status) => {
    switch (status) {
      case 'approved':
        return {
          icon: '✅',
          label: 'Approved',
          className: 'status-approved'
        };
      case 'rejected':
        return {
          icon: '❌',
          label: 'Rejected',
          className: 'status-rejected'
        };
      case 'pending':
      default:
        return {
          icon: '⏳',
          label: 'Under Review',
          className: 'status-pending'
        };
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="my-media-loading">
        <div className="loading-spinner"></div>
        <p>Loading your media...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-media-error">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Media</h3>
        <p>{error}</p>
        <button onClick={fetchMyMedia} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="my-media-section">
      {/* Real-time notifications banner */}
      {realtimeNotifications.length > 0 && (
        <div className="realtime-notifications-banner">
          <h4>🔔 Recent Updates</h4>
          {realtimeNotifications.slice(0, 3).map((notification, index) => (
            <div key={index} className={`realtime-notification ${notification.notification_type?.toLowerCase()}`}>
              {notification.message}
              <span className="notification-time">
                {new Date(notification.created_at).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      )}
      
      {/* Top Dashboard Stats */}
      <div className="top-dashboard-stats">
        <h3>My Media Dashboard</h3>
        <div className="media-stats-summary">
          <div className="stat-item">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <span className="stat-number">{stats.total}</span>
              <span className="stat-label">Total</span>
            </div>
          </div>
          <div className="stat-item approved">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <span className="stat-number">{stats.approved}</span>
              <span className="stat-label">Approved</span>
            </div>
          </div>
          <div className="stat-item pending">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <span className="stat-number">{stats.pending}</span>
              <span className="stat-label">Pending</span>
            </div>
          </div>
          <div className="stat-item rejected">
            <div className="stat-icon">❌</div>
            <div className="stat-content">
              <span className="stat-number">{stats.rejected}</span>
              <span className="stat-label">Rejected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="my-media-controls">
        <div className="controls-group">
          <label htmlFor="filter-select">Filter:</label>
          <select
            id="filter-select"
            value={filterBy}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="control-select"
          >
            <option value="all">All Media</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        
        <div className="controls-group">
          <label htmlFor="sort-select">Sort by:</label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="control-select"
          >
            <option value="uploaded_at">Date Uploaded</option>
            <option value="title">Title</option>
            <option value="status">Status</option>
            <option value="likes">Likes</option>
            <option value="views">Views</option>
          </select>
        </div>
      </div>
      
      {/* Media Grid */}
      {filteredAndSortedMedia.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📱</div>
          {myMedia.length === 0 ? (
            <>
              <h3>No Media Uploaded Yet</h3>
              <p>Start sharing your creative content with the community!</p>
              <button onClick={() => window.location.hash = '#upload'} className="upload-first-btn">
                Upload Your First Media
              </button>
            </>
          ) : (
            <>
              <h3>No Media Found</h3>
              <p>No media matches your current filter criteria.</p>
              <button onClick={() => setFilterBy('all')} className="show-all-btn">
                Show All Media
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="media-grid">
          {filteredAndSortedMedia.map((m) => {
            const statusInfo = getStatusInfo(m.status);
            
            return (
              <div key={m.media_id} className={`media-card ${m.status} ${m.status === 'rejected' ? 'rejected-media' : ''}`}>
                <div className="media-thumbnail">
                  {m.media_type === 'image' ? (
                    <img
                      src={m.thumbnail_url || m.signed_url || getMediaUrl(m)}
                      alt={m.title}
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = '/placeholder-image.png';
                      }}
                    />
                  ) : m.media_type === 'video' ? (
                    <video
                      src={m.signed_url || getMediaUrl(m)}
                      muted
                      preload="metadata"
                      poster={m.thumbnail_url || '/placeholder-video.png'}
                      onError={(e) => {
                        e.target.poster = '/placeholder-video.png';
                      }}
                    />
                  ) : (
                    <div className="audio-placeholder">
                      <div className="audio-icon">🎵</div>
                      <span className="audio-label">Audio</span>
                    </div>
                  )}
                  
                  <div className={`status-overlay ${statusInfo.className}`}>
                    <span className="status-icon">{statusInfo.icon}</span>
                    <span className="status-text">{statusInfo.label}</span>
                  </div>
                  
                  <div className="media-type-badge">
                    {m.media_type === 'image' && '🖼️'}
                    {m.media_type === 'video' && '🎥'}
                    {m.media_type === 'audio' && '🎵'}
                  </div>
                </div>
                
                <div className="media-content">
                  <div className="media-header">
                    <h4 className="media-title">{m.title}</h4>
                    <span className={`status-badge ${statusInfo.className}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  
                  <p className="media-description">
                    {m.description || 'No description provided'}
                  </p>
                  
                  {/* Status Details */}
                  <div className="status-details">
                    {m.status === 'approved' && (
                      <div className="status-success">
                        <span className="status-icon">✅</span>
                        <div className="status-text">
                          <strong>Approved</strong>
                          {m.approved_at && (
                            <span className="status-date">
                              on {formatDate(m.approved_at)}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {m.status === 'rejected' && (
                      <div className="status-error">
                        <span className="status-icon">❌</span>
                        <div className="status-text">
                          <strong>Rejected</strong>
                          {m.rejected_at && (
                            <span className="status-date">
                              on {formatDate(m.rejected_at)}
                            </span>
                          )}
                          <span className="rejection-note">
                            This content is no longer visible to other users
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {m.status === 'pending' && (
                      <div className="status-pending">
                        <span className="status-icon">⏳</span>
                        <div className="status-text">
                          <strong>Under Review</strong>
                          <span className="status-date">
                            Submitted {formatDate(m.uploaded_at)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Media Statistics */}
                  <div className="media-stats">
                    <div className="stat">
                      <span className="stat-icon">👁️</span>
                      <span className="stat-value">{m.view_count || 0}</span>
                      <span className="stat-label">Views</span>
                    </div>
                    <div className="stat">
                      <span className="stat-icon">❤️</span>
                      <span className="stat-value">{m.likes || 0}</span>
                      <span className="stat-label">Likes</span>
                    </div>
                    <div className="stat">
                      <span className="stat-icon">📥</span>
                      <span className="stat-value">{m.download_count || 0}</span>
                      <span className="stat-label">Downloads</span>
                    </div>
                  </div>
                  
                  {/* Media Metadata */}
                  <div className="media-meta">
                    <div className="meta-item">
                      <span className="meta-label">Type:</span>
                      <span className="meta-value">{m.media_type}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Uploaded:</span>
                      <span className="meta-value">{formatDate(m.uploaded_at)}</span>
                    </div>
                    {m.category && (
                      <div className="meta-item">
                        <span className="meta-label">Category:</span>
                        <span className="meta-value">{m.category}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Media Actions */}
                  <div className="media-actions">
                    <button 
                      onClick={() => handleDeleteMedia(m.media_id, m.title)}
                      className="delete-btn"
                      title="Delete media"
                    >
                      <span className="btn-icon">🗑️</span>
                      Delete
                    </button>
                    
                    {m.status === 'rejected' && (
                      <button 
                        onClick={() => handleEditAndReupload(m)}
                        className="reupload-btn"
                        title="Edit and re-upload"
                      >
                        <span className="btn-icon">✏️</span>
                        Edit & Re-upload
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyMedia;