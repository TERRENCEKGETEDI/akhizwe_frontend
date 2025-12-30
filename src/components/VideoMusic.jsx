import { useState, useEffect, useCallback } from 'react';
import Notifications from './Notifications';
import SharedNavigation from './SharedNavigation';
import MediaFeed from './MediaFeed';
import UploadForm from './UploadForm';
import MyMedia from './MyMedia';
import './VideoMusic.css';

function VideoMusic({ mediaType = 'all' }) {
  // Component state
  const [activeTab, setActiveTab] = useState('media'); // media, upload, my
  const [notifications, setNotifications] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState({ page: 1, limit: 10 });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [userRole, setUserRole] = useState('USER'); // Assume default role
  const [pendingMedia, setPendingMedia] = useState([]);
  const [reports, setReports] = useState([]);

  // User authentication
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const userWithToken = user ? { ...user, token } : null;

  // Fetch search suggestions
  const fetchSearchSuggestions = async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/search/suggestions?q=${encodeURIComponent(query)}&limit=8&media_type=${mediaType}`
      );
      const data = await response.json();
      setSearchSuggestions(data.suggestions || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching search suggestions:', error);
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setSearchInput(suggestion.title);
    setShowSuggestions(false);
  };

  // Debounce search input
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        search: searchInput.trim(),
        page: 1 // Reset to first page when searching
      }));
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch search suggestions when search input changes
  useEffect(() => {
    const suggestionTimer = setTimeout(() => {
      fetchSearchSuggestions(searchInput);
    }, 300);

    return () => clearTimeout(suggestionTimer);
  }, [searchInput]);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!token) return;
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Fetch analytics (admin only)
  const fetchAnalytics = async () => {
    if (!token || userRole !== 'ADMIN') return;
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  // Fetch pending media (admin only)
  const fetchPending = async () => {
    if (!token || userRole !== 'ADMIN') return;
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setPendingMedia(data.media || []);
    } catch (error) {
      console.error('Error fetching pending media:', error);
    }
  };

  // Fetch reports (admin only)
  const fetchReports = async () => {
    if (!token || userRole !== 'ADMIN') return;
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/reports`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setReports(data.reports || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  // Load initial data
  useEffect(() => {
    if (user?.role) {
      setUserRole(user.role);
    }
    
    if (token) {
      fetchNotifications();
    }
    
    if (userRole === 'ADMIN') {
      fetchPending();
      fetchReports();
      fetchAnalytics();
    }
  }, [token, user, userRole]);

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Close search and filters when changing tabs
    setSearchExpanded(false);
    setFiltersOpen(false);
  };

  // Handle search toggle
  const handleSearchToggle = () => {
    setSearchExpanded(!searchExpanded);
    if (filtersOpen) {
      setFiltersOpen(false);
    }
  };

  // Handle filters toggle
  const handleFiltersToggle = () => {
    setFiltersOpen(!filtersOpen);
    if (searchExpanded) {
      setSearchExpanded(false);
    }
  };

  // Handle filters change
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({ page: 1, limit: 10 });
    setSearchInput('');
    setSearchSuggestions([]);
    setShowSuggestions(false);
  };

  // Handle search input change
  const handleSearchChange = (value) => {
    setSearchInput(value);
  };

  // Handle media update from child components
  const handleMediaUpdate = (notification) => {
    // Refresh notifications
    fetchNotifications();
    
    // If it's an admin, refresh pending/reports
    if (userRole === 'ADMIN') {
      fetchPending();
      fetchReports();
      fetchAnalytics();
    }
  };

  // Handle upload success
  const handleUploadSuccess = (data) => {
    // Refresh notifications and user media
    fetchNotifications();
    
    // Switch to My Media tab to show the new upload
    setActiveTab('my');
  };

  // Handle admin actions
  const handleApprove = async (id) => {
    if (!token || userRole !== 'ADMIN') return;
    
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/${id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPending();
      fetchNotifications();
    } catch (error) {
      console.error('Error approving media:', error);
    }
  };

  const handleReject = async (id) => {
    if (!token || userRole !== 'ADMIN') return;
    
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/${id}/reject`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPending();
      fetchNotifications();
    } catch (error) {
      console.error('Error rejecting media:', error);
    }
  };

  const handleReport = async (id, reason) => {
    if (!token) return;
    
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/${id}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason })
      });
      alert('Reported successfully');
    } catch (error) {
      console.error('Error reporting media:', error);
    }
  };

  // Get section title based on media type
  const getSectionTitle = () => {
    switch (mediaType) {
      case 'music':
        return 'Music';
      case 'video':
        return 'Video';
      case 'all':
      default:
        return 'Media';
    }
  };

  // Apply media type filter to global filters
  const getEffectiveFilters = useCallback(() => {
    return {
      ...filters,
      media_type: mediaType === 'all' ? undefined : mediaType
    };
  }, [filters, mediaType]);

  return (
    <div className="video-music-container">
      {/* Section Header */}
      <div className="section-header">
        <h1 className="section-title">{getSectionTitle()}</h1>
        <p className="section-subtitle">
          {mediaType === 'music' && 'Discover and share amazing music with the community'}
          {mediaType === 'video' && 'Watch and share creative video content'}
          {mediaType === 'all' && 'Explore all media content from our creative community'}
        </p>
      </div>

      {/* Shared Navigation */}
      <SharedNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        searchExpanded={searchExpanded}
        onSearchToggle={handleSearchToggle}
        searchInput={searchInput}
        onSearchChange={handleSearchChange}
        searchSuggestions={searchSuggestions}
        showSuggestions={showSuggestions}
        onSuggestionClick={handleSuggestionClick}
        filtersOpen={filtersOpen}
        onFiltersToggle={handleFiltersToggle}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onResetFilters={handleResetFilters}
        user={userWithToken}
        token={token}
      />

      {/* Main Content */}
      <main className="main-content" role="main">
        {activeTab === 'media' && (
          <MediaFeed
            mediaType={mediaType}
            filters={getEffectiveFilters()}
            onFiltersChange={handleFiltersChange}
            searchExpanded={searchExpanded}
            filtersOpen={filtersOpen}
            onToggleFilters={handleFiltersToggle}
            onResetFilters={handleResetFilters}
            showSuggestions={showSuggestions}
            searchSuggestions={searchSuggestions}
            onSuggestionClick={handleSuggestionClick}
            onSearchInputChange={handleSearchChange}
            searchInput={searchInput}
            user={userWithToken}
            token={token}
          />
        )}

        {activeTab === 'upload' && token && (
          <UploadForm
            user={userWithToken}
            token={token}
            onUploadSuccess={handleUploadSuccess}
          />
        )}

        {activeTab === 'my' && token && (
          <MyMedia
            user={userWithToken}
            token={token}
            onMediaUpdate={handleMediaUpdate}
          />
        )}

        {!token && activeTab !== 'media' && (
          <div className="auth-required">
            <div className="auth-icon">🔒</div>
            <h2>Authentication Required</h2>
            <p>Please log in to access this feature.</p>
            <button 
              onClick={() => handleTabChange('media')}
              className="back-to-media-btn"
            >
              Back to Media
            </button>
          </div>
        )}
      </main>

      {/* Notifications Component */}
      {token && (
        <Notifications
          notifications={notifications}
          userRole={userRole}
          onApprove={handleApprove}
          onReject={handleReject}
          onReport={handleReport}
          pendingMedia={pendingMedia}
          reports={reports}
          analytics={analytics}
        />
      )}
    </div>
  );
}

export default VideoMusic;