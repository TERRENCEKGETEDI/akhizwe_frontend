import React, { useState, useEffect } from 'react';
import { Bell, X, Settings, Check, CheckCheck, Trash2 } from 'lucide-react';
import './Notifications.css';

const Notifications = ({ user, onNotificationClick }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({});
  const [socket, setSocket] = useState(null);
  const [error, setError] = useState(null);

  // WebSocket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('🔔 Notifications component - User:', user?.email, 'Token exists:', !!token);
    
    if (user && token) {
      const connectWebSocket = async () => {
        try {
          console.log('🔌 Connecting to WebSocket...');
          const { io } = await import('socket.io-client');
          const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
            auth: {
              token: token
            }
          });

          newSocket.on('connect', () => {
            console.log('✅ Connected to notification WebSocket');
            setIsLoading(true);
            // Request initial data
            newSocket.emit('get_notifications');
            newSocket.emit('get_notification_preferences');
          });

          newSocket.on('new_notification', (notification) => {
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // Show browser notification if permission granted
            if (Notification.permission === 'granted') {
              new Notification(notification.notification_type, {
                body: notification.message,
                icon: '/favicon.ico'
              });
            }
          });

          newSocket.on('unread_count', (data) => {
            setUnreadCount(data.count);
          });

          newSocket.on('notifications_list', (data) => {
            setNotifications(data.notifications);
            setIsLoading(false);
          });

          newSocket.on('notification_preferences', (prefs) => {
            setPreferences(prefs);
          });

          newSocket.on('notification_marked_read', (data) => {
            setNotifications(prev => 
              prev.map(notif => 
                notif.notification_id === data.notificationId 
                  ? { ...notif, is_read: true }
                  : notif
              )
            );
          });

          newSocket.on('all_notifications_marked_read', () => {
            setNotifications(prev => 
              prev.map(notif => ({ ...notif, is_read: true }))
            );
            setUnreadCount(0);
          });

          newSocket.on('notification_preferences_updated', (prefs) => {
            setPreferences(prefs);
            setShowPreferences(false);
          });

          newSocket.on('error', (error) => {
            console.error('WebSocket error:', error);
          });

          setSocket(newSocket);
        } catch (error) {
          console.error('Failed to connect to WebSocket:', error);
        }
      };

      connectWebSocket();

      // Fallback: fetch notifications via API
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      .then(response => response.json())
      .then(data => {
        setNotifications(data.notifications || []);
        setIsLoading(false);
      })
      .catch(error => console.error('Error fetching notifications via API:', error));

      return () => {
        if (socket) {
          socket.disconnect();
        }
      };
    }
  }, [user]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const markAsRead = (notificationId) => {
    if (socket) {
      socket.emit('mark_notification_read', { notificationId });
    }
  };

  const markAllAsRead = () => {
    if (socket) {
      socket.emit('mark_all_read');
    }
  };

  const updatePreferences = (newPreferences) => {
    if (socket) {
      socket.emit('update_notification_preferences', newPreferences);
    }
  };

  const deleteNotification = (notificationId) => {
    const token = localStorage.getItem('token');
    // API call to delete notification
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(() => {
      setNotifications(prev => prev.filter(notif => notif.notification_id !== notificationId));
    })
    .catch(error => console.error('Error deleting notification:', error));
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'LIKE': return '👍';
      case 'FAVORITE': return '❤️';
      case 'COMMENT': return '💬';
      case 'REPLY': return '↩️';
      case 'DOWNLOAD': return '⬇️';
      default: return '🔔';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f97316';
      case 'normal': return '#3b82f6';
      case 'low': return '#6b7280';
      default: return '#3b82f6';
    }
  };

  return (
    <div className="notifications-container">
      {/* Notification Bell */}
      <div className="notification-bell" onClick={() => setIsOpen(!isOpen)}>
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </div>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h3>Notifications</h3>
            <div className="notifications-actions">
              {unreadCount > 0 && (
                <button 
                  className="mark-all-read-btn"
                  onClick={markAllAsRead}
                  title="Mark all as read"
                >
                  <CheckCheck size={16} />
                </button>
              )}
              <button 
                className="settings-btn"
                onClick={() => setShowPreferences(true)}
                title="Notification settings"
              >
                <Settings size={16} />
              </button>
              <button 
                className="close-btn"
                onClick={() => setIsOpen(false)}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="notifications-list">
            {isLoading ? (
              <div className="loading">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="no-notifications">No notifications yet</div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.notification_id}
                  className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                  onClick={() => markAsRead(notification.notification_id)}
                >
                  <div className="notification-content">
                    <div className="notification-icon">
                      {getNotificationIcon(notification.action_type)}
                    </div>
                    <div className="notification-text">
                      <p className="notification-message">{notification.message}</p>
                      <span className="notification-time">
                        {formatTimeAgo(notification.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="notification-controls">
                    {!notification.is_read && (
                      <div 
                        className="unread-indicator"
                        style={{ backgroundColor: getPriorityColor(notification.priority) }}
                      />
                    )}
                    <button 
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.notification_id);
                      }}
                      title="Delete notification"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Notification Preferences Modal */}
      {showPreferences && (
        <div className="preferences-modal-overlay" onClick={() => setShowPreferences(false)}>
          <div className="preferences-modal" onClick={(e) => e.stopPropagation()}>
            <div className="preferences-header">
              <h3>Notification Preferences</h3>
              <button onClick={() => setShowPreferences(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="preferences-content">
              {/* Channel Preferences */}
              <div className="preference-section">
                <h4>Notification Channels</h4>
                <div className="preference-item">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={preferences.in_app_notifications || false}
                      onChange={(e) => updatePreferences({ 
                        ...preferences, 
                        in_app_notifications: e.target.checked 
                      })}
                    />
                    In-app notifications
                  </label>
                </div>
                <div className="preference-item">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={preferences.email_notifications || false}
                      onChange={(e) => updatePreferences({ 
                        ...preferences, 
                        email_notifications: e.target.checked 
                      })}
                    />
                    Email notifications
                  </label>
                </div>
                <div className="preference-item">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={preferences.push_notifications || false}
                      onChange={(e) => updatePreferences({ 
                        ...preferences, 
                        push_notifications: e.target.checked 
                      })}
                    />
                    Push notifications
                  </label>
                </div>
              </div>

              {/* Content Type Preferences */}
              <div className="preference-section">
                <h4>Content Interactions</h4>
                <div className="preference-item">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={preferences.like_notifications || false}
                      onChange={(e) => updatePreferences({ 
                        ...preferences, 
                        like_notifications: e.target.checked 
                      })}
                    />
                    Likes on my content
                  </label>
                </div>
                <div className="preference-item">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={preferences.favorite_notifications || false}
                      onChange={(e) => updatePreferences({ 
                        ...preferences, 
                        favorite_notifications: e.target.checked 
                      })}
                    />
                    Favorites on my content
                  </label>
                </div>
                <div className="preference-item">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={preferences.comment_notifications || false}
                      onChange={(e) => updatePreferences({ 
                        ...preferences, 
                        comment_notifications: e.target.checked 
                      })}
                    />
                    Comments on my content
                  </label>
                </div>
                <div className="preference-item">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={preferences.reply_notifications || false}
                      onChange={(e) => updatePreferences({ 
                        ...preferences, 
                        reply_notifications: e.target.checked 
                      })}
                    />
                    Replies to my comments
                  </label>
                </div>
                <div className="preference-item">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={preferences.download_notifications || false}
                      onChange={(e) => updatePreferences({ 
                        ...preferences, 
                        download_notifications: e.target.checked 
                      })}
                    />
                    Downloads of my content
                  </label>
                </div>
              </div>

              {/* Frequency Settings */}
              <div className="preference-section">
                <h4>Frequency Settings</h4>
                <div className="preference-item">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={preferences.frequency_digest || false}
                      onChange={(e) => updatePreferences({ 
                        ...preferences, 
                        frequency_digest: e.target.checked 
                      })}
                    />
                    Daily digest instead of immediate notifications
                  </label>
                </div>
                <div className="preference-item">
                  <label>Minimum interval between similar notifications (minutes):</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="60"
                    value={preferences.min_interval_minutes || 5}
                    onChange={(e) => updatePreferences({ 
                      ...preferences, 
                      min_interval_minutes: parseInt(e.target.value) 
                    })}
                  />
                </div>
                <div className="preference-item">
                  <label>Maximum daily notifications:</label>
                  <input 
                    type="number" 
                    min="10" 
                    max="500"
                    value={preferences.max_daily_notifications || 100}
                    onChange={(e) => updatePreferences({ 
                      ...preferences, 
                      max_daily_notifications: parseInt(e.target.value) 
                    })}
                  />
                </div>
              </div>

              {/* Quiet Hours */}
              <div className="preference-section">
                <h4>Quiet Hours</h4>
                <div className="preference-item">
                  <label>Start time:</label>
                  <input 
                    type="time" 
                    value={preferences.quiet_hours_start || '22:00'}
                    onChange={(e) => updatePreferences({ 
                      ...preferences, 
                      quiet_hours_start: e.target.value 
                    })}
                  />
                </div>
                <div className="preference-item">
                  <label>End time:</label>
                  <input 
                    type="time" 
                    value={preferences.quiet_hours_end || '08:00'}
                    onChange={(e) => updatePreferences({ 
                      ...preferences, 
                      quiet_hours_end: e.target.value 
                    })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;