import { useState, useEffect, useCallback, useRef } from 'react';
import Notifications from './Notifications';
import './VideoMusic.css';

function VideoMusic() {
  const [activeTab, setActiveTab] = useState('media'); // media, upload, my
  const [media, setMedia] = useState([]);
  const [myMedia, setMyMedia] = useState([]);
  const [pendingMedia, setPendingMedia] = useState([]);
  const [reports, setReports] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [filters, setFilters] = useState({ page: 1, limit: 10 });
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [uploadForm, setUploadForm] = useState({});
  const [isUploadProcessing, setIsUploadProcessing] = useState(false);
  const [uploadStatusMessage, setUploadStatusMessage] = useState('');
  const [comments, setComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({}); // Track comment input values
  const [replyInputs, setReplyInputs] = useState({}); // Track reply input values
  const [likedMedia, setLikedMedia] = useState({}); // Track liked media by user
  const [favoritedMedia, setFavoritedMedia] = useState({}); // Track favorited media by user
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [expandedComments, setExpandedComments] = useState({}); // Track which media comments are expanded
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRefs = useRef([]);
  const feedRef = useRef(null);
  const token = localStorage.getItem('token');
  const userRole = JSON.parse(localStorage.getItem('user'))?.role; // Assume user object stored
  const userEmail = JSON.parse(localStorage.getItem('user'))?.email; // Get user email for tracking
  const user = JSON.parse(localStorage.getItem('user'));
  const userWithToken = { ...user, token };

  useEffect(() => {
    const processing = localStorage.getItem('uploadProcessing');
    if (processing === 'true') {
      setIsUploadProcessing(true);
      setUploadStatusMessage('Processing your upload...');
    }
  }, []);

  const fetchMedia = async () => {
    const query = new URLSearchParams(filters);
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media?${query}`);
    const data = await res.json();
    setMedia(data.media || []);
  };

  const fetchMyMedia = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/my`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setMyMedia(data.media || []);
  };

  const fetchPending = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/pending`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setPendingMedia(data.media || []);
  };

  const fetchReports = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/reports`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setReports(data.reports || []);
  };

  const fetchNotifications = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/notifications`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setNotifications(data.notifications || []);
  };

  const fetchAnalytics = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/analytics`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setAnalytics(data);
  };

  const fetchComments = async (id) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/${id}/comments`);
    const data = await res.json();
    setComments(prev => ({...prev, [id]: data.comments || []}));
  };

  // Fetch user's liked media
  const fetchLikedMedia = async () => {
    if (!token || !userEmail) {
      console.log('No token or user email available for fetching likes');
      return;
    }
    
    try {
      console.log('Fetching liked media for user:', userEmail);
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/liked`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          console.error('Authentication failed - token may be expired');
          alert('Your session has expired. Please log in again.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.reload();
          return;
        }
        throw new Error(`Failed to fetch liked media: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log('Liked media IDs from backend:', data.likedMediaIds);
      
      // Create a map of liked media IDs for quick lookup
      const liked = {};
      for (const mediaId of data.likedMediaIds || []) {
        liked[mediaId] = true;
      }
      
      console.log('Liked media map:', liked);
      setLikedMedia(liked);
    } catch (error) {
      console.error('Error fetching liked media:', error);
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        console.error('Network error while fetching likes');
        alert('Unable to connect to server. Please check your internet connection.');
      }
      // Initialize as empty if there's an error
      setLikedMedia({});
    }
  };

  // Fetch user's favorited media
  const fetchFavoritedMedia = async () => {
    if (!token || !userEmail) {
      console.log('No token or user email available for fetching favorites');
      return;
    }
    
    try {
      console.log('Fetching favorited media for user:', userEmail);
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/favorites`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          console.error('Authentication failed - token may be expired');
          alert('Your session has expired. Please log in again.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.reload();
          return;
        }
        throw new Error(`Failed to fetch favorited media: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log('Favorited media IDs from backend:', data.favoritedMediaIds);
      
      // Create a map of favorited media IDs for quick lookup
      const favorited = {};
      for (const mediaId of data.favoritedMediaIds || []) {
        favorited[mediaId] = true;
      }
      
      console.log('Favorited media map:', favorited);
      setFavoritedMedia(favorited);
    } catch (error) {
      console.error('Error fetching favorited media:', error);
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        console.error('Network error while fetching favorites');
        alert('Unable to connect to server. Please check your internet connection.');
      }
      // Initialize as empty if there's an error
      setFavoritedMedia({});
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [filters]);

  // Fetch search suggestions
  const fetchSearchSuggestions = async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/search/suggestions?q=${encodeURIComponent(query)}&limit=8`);
      const data = await response.json();
      setSearchSuggestions(data.suggestions || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching search suggestions:', error);
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchInput(suggestion.title);
    setShowSuggestions(false);
    setSearchInput(suggestion.title);
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

  // Video feed functions
  const handleVideoEnd = () => {
    if (currentVideoIndex < media.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    } else {
      // Load more or loop
      setCurrentVideoIndex(0);
    }
  };

  const handleScroll = useCallback(() => {
    if (!feedRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = feedRef.current;
    console.log('Scroll event: scrollTop=', scrollTop, 'clientHeight=', clientHeight, 'scrollHeight=', scrollHeight);
    // Update currentVideoIndex based on scroll position
    const newIndex = Math.round(scrollTop / window.innerHeight);
    console.log('Calculated newIndex:', newIndex, 'current:', currentVideoIndex);
    if (newIndex !== currentVideoIndex && newIndex < media.length) {
      setCurrentVideoIndex(newIndex);
    }
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      // Load more media
      if (filters.page * filters.limit < media.length) {
        setFilters(prev => ({ ...prev, page: prev.page + 1 }));
      }
    }
  }, [filters, media.length, currentVideoIndex, media.length]);

  const handleSwipe = (direction) => {
    if (direction === 'up' && currentVideoIndex < media.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    } else if (direction === 'down' && currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleVolume = () => {
    setVolume(volume > 0 ? 0 : 1);
  };

  const toggleFilters = () => {
    setFiltersOpen(!filtersOpen);
  };

  const resetFilters = () => {
    setFilters({ page: 1, limit: 10 });
    setSearchInput('');
  };

  useEffect(() => {
    if (token) {
      // Fetch data in sequence to ensure proper initialization
      const fetchData = async () => {
        await fetchFavoritedMedia(); // Fetch favorites first
        await fetchLikedMedia(); // Fetch likes after favorites
        fetchMyMedia();
        fetchNotifications();
      };
      fetchData();
    }
    if (userRole === 'ADMIN') {
      fetchPending();
      fetchReports();
      fetchAnalytics();
    }
  }, []);

  // Handle scroll for infinite scroll
  useEffect(() => {
    const feed = feedRef.current;
    if (feed) {
      feed.addEventListener('scroll', handleScroll);
      return () => feed.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Manage video playback
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === currentVideoIndex) {
          if (isPlaying) {
            video.play();
          } else {
            video.pause();
          }
          video.volume = volume;
        } else {
          video.pause();
        }
      }
    });
  }, [currentVideoIndex, isPlaying, volume]);

  // Synchronize media with favorited state
  const getMediaWithFavoriteState = useCallback(() => {
    return media.map(m => ({
      ...m,
      isFavorited: favoritedMedia[m.media_id] || false
    }));
  }, [media, favoritedMedia]);

  const mediaWithFavoriteState = getMediaWithFavoriteState();

  // Debug: Log when media or favoritedMedia changes
  useEffect(() => {
    console.log('Media data loaded:', media.length, 'items');
    console.log('Favorited media IDs:', Object.keys(favoritedMedia));
    console.log('Media with favorite state:', mediaWithFavoriteState.map(m => ({ id: m.media_id, favorited: m.isFavorited })));
  }, [media, favoritedMedia, mediaWithFavoriteState]);

  // Debug: Log when likedMedia changes
  useEffect(() => {
    console.log('Liked media state updated:', likedMedia);
    console.log('Liked media IDs:', Object.keys(likedMedia).filter(id => likedMedia[id]));
  }, [likedMedia]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (isUploadProcessing) return;

    setIsUploadProcessing(true);
    setUploadStatusMessage('Processing your upload...');
    localStorage.setItem('uploadProcessing', 'true');

    try {
      const formData = new FormData();
      Object.keys(uploadForm).forEach(key => {
        if (uploadForm[key]) formData.append(key, uploadForm[key]);
      });
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      alert(data.message);
      setUploadForm({});
      fetchMyMedia();
      setUploadStatusMessage('Upload completed successfully!');
      localStorage.removeItem('uploadProcessing');
    } catch (error) {
      setUploadStatusMessage('Upload failed. Please try again.');
      localStorage.removeItem('uploadProcessing');
    } finally {
      setIsUploadProcessing(false);
    }
  };

  const toggleLike = async (id) => {
    if (!token) {
      alert('Please log in to like media');
      return;
    }

    const isCurrentlyLiked = likedMedia[id] || false;
    console.log(`Toggle like for media ${id}, currently liked:`, isCurrentlyLiked);

    try {
      if (isCurrentlyLiked) {
        // Unlike the media
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/${id}/like`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to unlike media');
        }

        console.log(`Unliked media ${id} successfully`);
      } else {
        // Like the media
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/${id}/like`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to like media');
        }

        console.log(`Liked media ${id} successfully`);
      }

      // Update local state
      const newLikeState = !isCurrentlyLiked;
      setLikedMedia(prev => ({ ...prev, [id]: newLikeState }));
      console.log(`Updated like state for media ${id}:`, newLikeState);

      // Refresh media to update like counts
      fetchMedia();

    } catch (error) {
      console.error(`Error toggling like for media ${id}:`, error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleFavorite = async (id) => {
    console.log(`Favorite button clicked for media ${id}`);
    const isCurrentlyFavorited = favoritedMedia[id];
    
    if (!token) {
      alert('Please log in to favorite media');
      return;
    }
    
    try {
      if (isCurrentlyFavorited) {
        // Unfavorite the media
        console.log(`Unfavoriting media ${id}`);
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/${id}/favorite`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          const errorMessage = errorData.error || 'Failed to unfavorite media';
          console.error(`Failed to unfavorite media ${id}:`, errorMessage);
          alert(`Error: ${errorMessage}`);
          return;
        }
        
        const data = await response.json();
        console.log(`Unfavorite successful:`, data.message);
        alert('Removed from favorites!');
      } else {
        // Favorite the media
        console.log(`Favoriting media ${id}`);
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/${id}/favorite`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          const errorMessage = errorData.error || 'Failed to favorite media';
          console.error(`Failed to favorite media ${id}:`, errorMessage);
          alert(`Error: ${errorMessage}`);
          return;
        }
        
        const data = await response.json();
        console.log(`Favorite successful:`, data.message);
        alert('Added to favorites!');
      }
      
      // Update local state
      setFavoritedMedia(prev => ({ ...prev, [id]: !isCurrentlyFavorited }));
      
    } catch (error) {
      console.error(`Error processing favorite for media ${id}:`, error);
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        alert('Network error: Please check your connection and try again.');
      } else {
        alert(`Error: ${error.message || 'An unexpected error occurred'}`);
      }
    }
  };

  const handleComment = async (id, text) => {
    if (!text || !text.trim()) {
      alert('Please enter a comment');
      return;
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/${id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ comment_text: text.trim() })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to post comment');
      }
      
      // Clear the input and refresh comments
      setCommentInputs(prev => ({ ...prev, [id]: '' }));
      fetchComments(id);
    } catch (error) {
      console.error('Error posting comment:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleReply = async (mediaId, commentId, text) => {
    if (!text || !text.trim()) {
      alert('Please enter a reply');
      return;
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/${mediaId}/comment/${commentId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reply_text: text.trim() })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to post reply');
      }
      
      // Clear the input and refresh comments
      setReplyInputs(prev => ({ ...prev, [commentId]: '' }));
      fetchComments(mediaId);
    } catch (error) {
      console.error('Error posting reply:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleCommentLike = async (commentId) => {
    if (!token) {
      alert('Please log in to like comments');
      return;
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/comment/${commentId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to like comment');
      }
      
      // Refresh comments to update like counts
      const mediaId = Object.keys(comments).find(id =>
        comments[id].some(c => c.comment_id === commentId)
      );
      if (mediaId) fetchComments(mediaId);
    } catch (error) {
      console.error('Error liking comment:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleApprove = async (id) => {
    await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/${id}/approve`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    fetchPending();
  };

  const handleReject = async (id) => {
    await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/${id}/reject`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    fetchPending();
  };

  const handleReport = async (id, reason) => {
    await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/${id}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ reason })
    });
    alert('Reported');
  };


  // Swipe handling
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientY);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      handleSwipe('up');
    }
    if (isRightSwipe) {
      handleSwipe('down');
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeTab === 'media') {
        switch (e.key) {
          case 'ArrowUp':
            e.preventDefault();
            handleSwipe('down');
            break;
          case 'ArrowDown':
            e.preventDefault();
            handleSwipe('up');
            break;
          case ' ':
            e.preventDefault();
            togglePlayPause();
            break;
          case 'm':
            e.preventDefault();
            toggleVolume();
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, searchExpanded, filtersOpen]);

  return (
    <div className="video-music-container">
      {/* Sticky Navigation Bar */}
      <nav className="sticky-nav">
        <div className="nav-buttons">
          <button
            className={activeTab === 'media' ? 'active' : ''}
            onClick={() => setActiveTab('media')}
            title="Media Feed"
          >
            Media
          </button>
          {token && (
            <button
              className={activeTab === 'upload' ? 'active' : ''}
              onClick={() => setActiveTab('upload')}
              title="Upload Media"
            >
              Upload
            </button>
          )}
          {token && (
            <button
              className={activeTab === 'my' ? 'active' : ''}
              onClick={() => setActiveTab('my')}
              title="My Media"
            >
              My Media
            </button>
          )}
        </div>
        <div className="nav-actions">
          <button
            className="search-toggle"
            onClick={() => setSearchExpanded(!searchExpanded)}
            title="Search"
          >
            🔍
          </button>
          <button
            className={`filters-toggle ${filtersOpen ? 'active' : ''}`}
            onClick={toggleFilters}
            title="Filters"
          >
            🔽
          </button>
        </div>
      </nav>

      {/* Expandable Search Bar */}
      {searchExpanded && (
        <div className="search-overlay">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search media..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onFocus={() => searchInput.length >= 2 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="search-input"
            />
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="search-suggestions">
                {searchSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="search-suggestion-item"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion.title}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filters Dropdown */}
      {filtersOpen && (
        <div className="filters-dropdown">
          <div className="filters-content">
            <h3>Filters</h3>
            <div className="filters-grid">
              <div className="filter-group">
                <label>Genre</label>
                <select onChange={(e) => setFilters({...filters, genre: e.target.value, page: 1})}>
                  <option value="">All</option>
                  <option value="pop">Pop</option>
                  <option value="rock">Rock</option>
                  <option value="hip-hop">Hip-Hop</option>
                  <option value="electronic">Electronic</option>
                  <option value="jazz">Jazz</option>
                  <option value="classical">Classical</option>
                  <option value="country">Country</option>
                  <option value="reggae">Reggae</option>
                  <option value="blues">Blues</option>
                  <option value="folk">Folk</option>
                  <option value="rnb">R&B</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Artist</label>
                <input
                  type="text"
                  placeholder="Artist name"
                  onChange={(e) => setFilters({...filters, artist: e.target.value, page: 1})}
                />
              </div>
              <div className="filter-group">
                <label>Date Added</label>
                <select onChange={(e) => setFilters({...filters, date: e.target.value, page: 1})}>
                  <option value="">All</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Media Length</label>
                <select onChange={(e) => setFilters({...filters, duration: e.target.value, page: 1})}>
                  <option value="">All</option>
                  <option value="short">Short (0-2 min)</option>
                  <option value="medium">Medium (2-10 min)</option>
                  <option value="long">Long (10+ min)</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Popularity</label>
                <select onChange={(e) => setFilters({...filters, popularity: e.target.value, page: 1})}>
                  <option value="">All</option>
                  <option value="trending">Trending</option>
                  <option value="popular">Popular</option>
                  <option value="new">New Releases</option>
                </select>
              </div>
              <div className="filter-group reset-container">
                <button onClick={resetFilters} className="reset-filters">Reset</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {activeTab === 'media' && (
        <div className="video-feed" ref={feedRef}>
          {mediaWithFavoriteState.map((m, index) => (
            <div
              key={m.media_id}
              className="video-item"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <div className="media-container">
                <video
                  ref={(el) => (videoRefs.current[index] = el)}
                  className="video-player"
                  src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${m.file_path}`}
                  loop
                  muted={volume === 0}
                  controls={false}
                  onEnded={handleVideoEnd}
                  onClick={togglePlayPause}
                  preload="auto"
                  onLoadStart={() => console.log(`Video ${m.media_id} load started`)}
                  onCanPlay={() => console.log(`Video ${m.media_id} can play`)}
                  onError={(e) => console.error(`Video ${m.media_id} load error:`, e)}
                  onLoadedData={() => console.log(`Video ${m.media_id} loaded data`)}
                  style={{
                    opacity: index === currentVideoIndex ? 1 : 0,
                    pointerEvents: index === currentVideoIndex ? 'auto' : 'none'
                  }}
                />
                {/* Top Overlay */}
                <div className="top-overlay">
                  <div className="user-info">
                    <div className="user-avatar-container">
                      <img
                        src={m.creator_profile_pic || "/default-avatar.jpg"}
                        alt="User"
                        className="user-avatar"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="user-avatar-fallback" style={{ display: 'none' }}>
                        👤
                      </div>
                    </div>
                    <div className="user-details">
                      <span className="user-name">{m.creator_name}</span>
                    </div>
                  </div>
                </div>
                {/* Bottom Overlay */}
                <div className="bottom-overlay">
                  <div className="media-metadata">
                    <h3>{m.title}</h3>
                    <p>{m.description}</p>
                  </div>
                  <div className="interactions">
                    <button
                      onClick={() => toggleLike(m.media_id)}
                      className={`interaction-btn ${likedMedia[m.media_id] ? 'active' : ''}`}
                      title="Like this video (L)"
                    >
                      <div className="icon">{likedMedia[m.media_id] ? '💖' : '❤️'}</div>
                      <div className="like-count">{m.likes}</div>
                    </button>
                    <button
                      onClick={() => {
                        const isExpanded = expandedComments[m.media_id];
                        if (!isExpanded) {
                          fetchComments(m.media_id);
                        }
                        setExpandedComments(prev => ({ ...prev, [m.media_id]: !isExpanded }));
                      }}
                      className={`interaction-btn ${expandedComments[m.media_id] ? 'active' : ''}`}
                      title="View comments (C)"
                    >
                      <div className="icon">💬</div>
                      <div className="comment-count">{m.comments}</div>
                    </button>
                    <button
                      onClick={() => handleFavorite(m.media_id)}
                      className={`interaction-btn ${m.isFavorited ? 'active' : ''}`}
                      title="Add to favorites (F)"
                    >
                      <div className="icon">{m.isFavorited ? '⭐' : '☆'}</div>
                    </button>
                    <button
                      onClick={() => {}}
                      className="interaction-btn"
                      title="Share this video"
                    >
                      <div className="icon">📤</div>
                    </button>
                    <button
                      onClick={toggleVolume}
                      className="interaction-btn"
                      title={volume > 0 ? 'Mute audio (M)' : 'Unmute audio (M)'}
                    >
                      <div className="icon">{volume > 0 ? '🔊' : '🔇'}</div>
                    </button>
                  </div>
                </div>

                {/* Comments Section */}
                {expandedComments[m.media_id] && (
                  <div className="comments-section">
                    <div className="comments-list">
                      {comments[m.media_id]?.map((comment) => (
                        <div key={comment.comment_id} className="comment-item">
                          <div className="comment-content">
                            <strong>{comment.commenter_name}</strong>: {comment.comment_text}
                            <div className="comment-actions">
                              <button onClick={() => handleCommentLike(comment.comment_id)} className="like-btn">
                                👍 {comment.likes}
                              </button>
                              <button onClick={() => setReplyInputs(prev => ({ ...prev, [comment.comment_id]: !prev[comment.comment_id] }))} >
                                Reply
                              </button>
                            </div>
                            {replyInputs[comment.comment_id] && (
                              <div className="reply-input">
                                <input
                                  type="text"
                                  placeholder="Write a reply..."
                                  value={replyInputs[comment.comment_id] || ''}
                                  onChange={(e) => setReplyInputs(prev => ({ ...prev, [comment.comment_id]: e.target.value }))}
                                  onKeyPress={(e) => e.key === 'Enter' && handleReply(m.media_id, comment.comment_id, replyInputs[comment.comment_id])}
                                />
                                <button onClick={() => handleReply(m.media_id, comment.comment_id, replyInputs[comment.comment_id])}>Reply</button>
                              </div>
                            )}
                          </div>
                          {comment.replies && comment.replies.map((reply) => (
                            <div key={reply.comment_id} className="reply-item">
                              <div className="comment-content">
                                <strong>{reply.commenter_name}</strong>: {reply.comment_text}
                                <div className="comment-actions">
                                  <button onClick={() => handleCommentLike(reply.comment_id)} className="like-btn">
                                    👍 {reply.likes}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                    <div className="comment-input-section">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={commentInputs[m.media_id] || ''}
                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [m.media_id]: e.target.value }))}
                        onKeyPress={(e) => e.key === 'Enter' && handleComment(m.media_id, commentInputs[m.media_id])}
                      />
                      <button onClick={() => handleComment(m.media_id, commentInputs[m.media_id])}>Comment</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'upload' && (
        <div className="upload-section">
          <form onSubmit={handleUpload} className="upload-form">
            <input type="file" accept="audio/*,video/*" onChange={(e) => setUploadForm({...uploadForm, file: e.target.files[0]})} required disabled={isUploadProcessing} />
            <input type="text" placeholder="Title" onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})} required disabled={isUploadProcessing} />
            <textarea placeholder="Description" onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})} disabled={isUploadProcessing} />
            <select onChange={(e) => setUploadForm({...uploadForm, media_type: e.target.value})} required disabled={isUploadProcessing}>
              <option value="">Select Type</option>
              <option value="audio">Audio</option>
              <option value="video">Video</option>
            </select>
            <input type="text" placeholder="Category" onChange={(e) => setUploadForm({...uploadForm, category: e.target.value})} disabled={isUploadProcessing} />
            <button type="submit" disabled={isUploadProcessing} aria-describedby="upload-status-message">
              {isUploadProcessing ? 'Processing...' : 'Upload'}
            </button>
            {isUploadProcessing && <div className="spinner" aria-hidden="true"></div>}
            <div id="upload-status-message" aria-live="polite" className="sr-only">{uploadStatusMessage}</div>
          </form>
        </div>
      )}

      {activeTab === 'my' && (
        <div className="my-media-section">
          {myMedia.map(m => (
            <div key={m.media_id} className="media-card">
              <div className="media-header">
                <h3>{m.title}</h3>
                <span className={`status ${m.is_approved ? 'approved' : 'pending'}`}>{m.is_approved ? 'Approved' : 'Pending'}</span>
              </div>
              <p className="media-description">{m.description || 'No description'}</p>
              <div className="media-stats">
                <span>Views: {m.view_count}</span>
                <span>Likes: {m.likes}</span>
                <span>Downloads: {m.download_count}</span>
              </div>
              <div className="media-meta">
                <span>Type: {m.media_type}</span>
                <span>Uploaded: {m.created_at ? new Date(m.created_at).toLocaleDateString() : 'N/A'}</span>
              </div>
              <button onClick={async () => { if (confirm('Are you sure you want to delete this media?')) { await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/${m.media_id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); fetchMyMedia(); } }}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default VideoMusic;