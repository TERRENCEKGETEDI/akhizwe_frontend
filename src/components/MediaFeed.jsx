import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import './MediaFeed.css';

const MediaFeed = ({ 
  mediaType = 'all', // 'music', 'video', 'all'
  filters = {},
  onFiltersChange = () => {},
  searchExpanded = false,
  filtersOpen = false,
  onToggleFilters = () => {},
  onResetFilters = () => {},
  showSuggestions = false,
  searchSuggestions = [],
  onSuggestionClick = () => {},
  onSearchInputChange = () => {},
  searchInput = '',
  user,
  token 
}) => {
  // Component state
  const [media, setMedia] = useState([]);
  const [likedMedia, setLikedMedia] = useState({});
  const [favoritedMedia, setFavoritedMedia] = useState({});
  const [comments, setComments] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [replyInputs, setReplyInputs] = useState({});
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(1);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [pauseButtonVisible, setPauseButtonVisible] = useState(false);
  const [pauseButtonFading, setPauseButtonFading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  
  // Refs
  const videoRefs = useRef([]);
  const feedRef = useRef(null);
  const [socket, setSocket] = useState(null);
  
  // Constants
  const userEmail = user?.email;

  // Data fetching functions
  const fetchMedia = async () => {
    try {
      const query = new URLSearchParams({ ...filters, media_type: mediaType });
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media?${query}`);
      const data = await res.json();
      setMedia(data.media || []);
    } catch (error) {
      console.error('Error fetching media:', error);
    }
  };

  const fetchComments = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/${id}/comments`);
      if (!res.ok) {
        throw new Error(`Failed to fetch comments: ${res.status}`);
      }
      const data = await res.json();
      setComments(prev => ({...prev, [id]: data.comments || []}));
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments(prev => ({...prev, [id]: []}));
    }
  };

  const fetchLikedMedia = async () => {
    if (!token || !userEmail) return;
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/liked`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          console.error('Authentication failed - token may be expired');
          return;
        }
        throw new Error(`Failed to fetch liked media: ${res.status}`);
      }
      
      const data = await res.json();
      const liked = {};
      for (const mediaId of data.likedMediaIds || []) {
        liked[mediaId] = true;
      }
      setLikedMedia(liked);
    } catch (error) {
      console.error('Error fetching liked media:', error);
      setLikedMedia({});
    }
  };

  const fetchFavoritedMedia = async () => {
    if (!token || !userEmail) return;
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/favorites`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          console.error('Authentication failed - token may be expired');
          return;
        }
        throw new Error(`Failed to fetch favorited media: ${res.status}`);
      }
      
      const data = await res.json();
      const favorited = {};
      for (const mediaId of data.favoritedMediaIds || []) {
        favorited[mediaId] = true;
      }
      setFavoritedMedia(favorited);
    } catch (error) {
      console.error('Error fetching favorited media:', error);
      setFavoritedMedia({});
    }
  };

  // Setup WebSocket connection
  useEffect(() => {
    if (token && user) {
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        auth: { token: token }
      });

      newSocket.on('connect', () => {
        console.log('Connected to WebSocket server');
      });

      newSocket.on('new_notification', (notification) => {
        console.log('Received real-time notification:', notification);
        // Handle real-time updates if needed
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
  }, [token, user]);

  // Effects
  useEffect(() => {
    fetchMedia();
  }, [filters, mediaType]);

  useEffect(() => {
    if (token) {
      fetchFavoritedMedia();
      fetchLikedMedia();
    }
  }, [token, userEmail]);

  // Helper functions
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

  const getMediaWithFavoriteState = useCallback(() => {
    return media.map(m => ({
      ...m,
      isFavorited: favoritedMedia[m.media_id] || false,
      effectiveUrl: getMediaUrl(m)
    }));
  }, [media, favoritedMedia, getMediaUrl]);

  // Interaction handlers
  const handleVideoEnd = () => {
    if (currentVideoIndex < media.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    } else {
      setCurrentVideoIndex(0);
    }
  };

  const handleScroll = useCallback(() => {
    if (!feedRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = feedRef.current;
    const newIndex = Math.round(scrollTop / window.innerHeight);
    if (newIndex !== currentVideoIndex && newIndex < media.length) {
      setCurrentVideoIndex(newIndex);
    }
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      if (filters.page * filters.limit < media.length) {
        onFiltersChange(prev => ({ ...prev, page: prev.page + 1 }));
      }
    }
  }, [filters, media.length, currentVideoIndex]);

  const handleSwipe = (direction) => {
    if (direction === 'up' && currentVideoIndex < media.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    } else if (direction === 'down' && currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    }
  };

  const togglePlayPause = () => {
    const newPlaying = !isPlaying;
    setIsPlaying(newPlaying);
    setShowPlayButton(!newPlaying);
    if (newPlaying) {
      setPauseButtonVisible(true);
      setPauseButtonFading(false);
      setTimeout(() => {
        setPauseButtonFading(true);
        setTimeout(() => setPauseButtonVisible(false), 300);
      }, 2000);
    } else {
      setPauseButtonVisible(false);
      setPauseButtonFading(false);
    }
  };

  const toggleVolume = () => {
    setVolume(volume > 0 ? 0 : 1);
  };

  const toggleLike = async (id) => {
    if (!token) {
      alert('Please log in to like media');
      return;
    }

    const isCurrentlyLiked = likedMedia[id] || false;

    try {
      const method = isCurrentlyLiked ? 'DELETE' : 'POST';
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/${id}/like`, {
        method,
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to toggle like');
      }

      setLikedMedia(prev => ({ ...prev, [id]: !isCurrentlyLiked }));
      fetchMedia(); // Refresh to update like counts

    } catch (error) {
      console.error(`Error toggling like for media ${id}:`, error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleFavorite = async (id) => {
    if (!token) {
      alert('Please log in to favorite media');
      return;
    }

    const isCurrentlyFavorited = favoritedMedia[id];

    try {
      const method = isCurrentlyFavorited ? 'DELETE' : 'POST';
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/${id}/favorite`, {
        method,
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to toggle favorite');
      }

      setFavoritedMedia(prev => ({ ...prev, [id]: !isCurrentlyFavorited }));

    } catch (error) {
      console.error(`Error processing favorite for media ${id}:`, error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleComment = async (id, text) => {
    if (!text || !text.trim()) {
      alert('Please enter a comment');
      return;
    }

    setIsSubmittingComment(true);
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

      setCommentInputs(prev => ({ ...prev, [id]: '' }));
      fetchComments(id);
    } catch (error) {
      console.error('Error posting comment:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmittingComment(false);
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

  // Touch handling for swipe gestures
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
    if (distance > minSwipeDistance) {
      handleSwipe('up');
    }
    if (distance < -minSwipeDistance) {
      handleSwipe('down');
    }
  };

  // Effects for video management and scroll handling
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

  useEffect(() => {
    const feed = feedRef.current;
    if (feed) {
      feed.addEventListener('scroll', handleScroll);
      return () => feed.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const mediaWithFavoriteState = getMediaWithFavoriteState();

  return (
    <div className="media-feed-container">
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
              {m.media_type === 'image' ? (
                <img
                  className="video-player"
                  src={m.effectiveUrl}
                  alt={m.title}
                  style={{
                    opacity: index === currentVideoIndex ? 1 : 0,
                    pointerEvents: index === currentVideoIndex ? 'auto' : 'none'
                  }}
                />
              ) : m.media_type === 'video' ? (
                <video
                  ref={(el) => (videoRefs.current[index] = el)}
                  className="video-player"
                  loop
                  muted={volume === 0}
                  controls={false}
                  onEnded={handleVideoEnd}
                  onClick={togglePlayPause}
                  preload="metadata"
                  onLoadStart={() => { console.log(`Video ${m.media_id} load started`); setIsLoading(true); }}
                  onCanPlay={() => { console.log(`Video ${m.media_id} can play`); setIsLoading(false); }}
                  onWaiting={() => setIsLoading(true)}
                  onPlaying={() => setIsLoading(false)}
                  onLoadedData={() => { console.log(`Video ${m.media_id} loaded data`); if (isPlaying) videoRefs.current[index]?.play(); }}
                  onError={(e) => { console.error(`Video ${m.media_id} load error:`, e); setIsLoading(false); }}
                  style={{
                    opacity: index === currentVideoIndex ? 1 : 0,
                    pointerEvents: index === currentVideoIndex ? 'auto' : 'none'
                  }}
                >
                  <source src={m.effectiveUrl} type="video/mp4" />
                </video>
              ) : m.media_type === 'audio' ? (
                <div className="audio-player-container">
                  {/* Music Note Thumbnail */}
                  <div className="audio-thumbnail-overlay">
                    <div className="music-note-icon">
                      <svg 
                        width="120" 
                        height="120" 
                        viewBox="0 0 24 24" 
                        fill="currentColor"
                        className="music-note-svg"
                      >
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                      </svg>
                    </div>
                    <div className="audio-label-overlay">
                      <span className="audio-type-label"> 🎵 MUSIC</span>
                    </div>
                  </div>
                  
                  {/* Hidden Audio Element for Playback */}
                  <audio
                    ref={(el) => (videoRefs.current[index] = el)}
                    className="hidden-audio"
                    loop
                    muted={volume === 0}
                    onEnded={handleVideoEnd}
                    preload="metadata"
                    onLoadStart={() => { setIsLoading(true); }}
                    onCanPlay={() => { setIsLoading(false); }}
                    onWaiting={() => setIsLoading(true)}
                    onPlaying={() => setIsLoading(false)}
                    onLoadedData={() => { if (isPlaying) el?.play(); }}
                    onError={() => { setIsLoading(false); }}
                  >
                    <source src={m.effectiveUrl} type="audio/mpeg" />
                  </audio>
                  
                  {/* Custom Audio Controls Overlay */}
                  <div className="audio-controls-overlay">
                    <div className="audio-progress-bar">
                      <div className="audio-progress-fill"></div>
                    </div>
                    <div className="audio-time-display">
                      <span className="current-time">0:00</span>
                      <span className="duration">0:00</span>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Play/Pause Overlays */}
              {m.media_type === 'video' && showPlayButton && (
                <div className="play-button-overlay">
                  <button className="play-button" onClick={togglePlayPause}>
                    ▶️
                  </button>
                </div>
              )}
              {m.media_type === 'video' && pauseButtonVisible && (
                <div className={`pause-button-overlay ${pauseButtonFading ? 'fade-out' : ''}`}>
                  <div className="pause-button">
                    ⏸️
                  </div>
                </div>
              )}
              {m.media_type === 'audio' && showPlayButton && (
                <div className="play-button-overlay audio-play-overlay">
                  <button className="play-button audio-play-button" onClick={togglePlayPause}>
                    ▶️
                  </button>
                </div>
              )}
              {m.media_type === 'audio' && pauseButtonVisible && (
                <div className={`pause-button-overlay audio-pause-overlay ${pauseButtonFading ? 'fade-out' : ''}`}>
                  <div className="pause-button audio-pause-button">
                    ⏸️
                  </div>
                </div>
              )}
              {(m.media_type === 'video' || m.media_type === 'audio') && isLoading && (
                <div className="loading-overlay">
                  <div className="loading-spinner"></div>
                </div>
              )}

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
                  {m.media_type === 'audio' && (
                    <div className="audio-info">
                      <span className="audio-badge">🎵 Audio Content</span>
                    </div>
                  )}
                </div>
                <div className="interactions">
                  <button
                    onClick={() => toggleLike(m.media_id)}
                    className={`interaction-btn ${likedMedia[m.media_id] ? 'active' : ''}`}
                    title="Like this media"
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
                    title="View comments"
                    disabled={index !== currentVideoIndex}
                  >
                    <div className="icon">💬</div>
                    <div className="comment-count">{m.comments}</div>
                  </button>
                  <button
                    onClick={() => handleFavorite(m.media_id)}
                    className={`interaction-btn ${m.isFavorited ? 'active' : ''}`}
                    title="Add to favorites"
                  >
                    <div className="icon">{m.isFavorited ? '⭐' : '☆'}</div>
                  </button>
                  <button
                    onClick={() => {}}
                    className="interaction-btn"
                    title="Share this media"
                  >
                    <div className="icon">📤</div>
                  </button>
                  <button
                    onClick={toggleVolume}
                    className="interaction-btn"
                    title={volume > 0 ? 'Mute audio' : 'Unmute audio'}
                  >
                    <div className="icon">{volume > 0 ? '🔊' : '🔇'}</div>
                  </button>
                  {m.media_type === 'audio' && (
                    <button
                      onClick={togglePlayPause}
                      className="interaction-btn audio-play-pause-btn"
                      title={isPlaying ? 'Pause audio' : 'Play audio'}
                    >
                      <div className="icon">{isPlaying ? '⏸️' : '▶️'}</div>
                      <span className="audio-control-label">{isPlaying ? 'Pause' : 'Play'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Comment Section */}
      {expandedComments[media[currentVideoIndex]?.media_id] && (
        <div className="bottom-comment-section">
          <div className="comment-header">
            <h3>Comments</h3>
            <button
              onClick={() => setExpandedComments(prev => ({ ...prev, [media[currentVideoIndex].media_id]: false }))}
              className="comment-close-btn"
              title="Close comments"
            >
              ✕
            </button>
          </div>
          <div className="comment-input-section">
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentInputs[media[currentVideoIndex].media_id] || ''}
              onChange={(e) => setCommentInputs(prev => ({ ...prev, [media[currentVideoIndex].media_id]: e.target.value }))}
              onKeyPress={(e) => e.key === 'Enter' && handleComment(media[currentVideoIndex].media_id, commentInputs[media[currentVideoIndex].media_id])}
              className="comment-input"
            />
            <button
              onClick={() => handleComment(media[currentVideoIndex].media_id, commentInputs[media[currentVideoIndex].media_id])}
              disabled={isSubmittingComment}
              className="comment-submit-btn"
            >
              {isSubmittingComment ? 'Posting...' : 'Comment'}
            </button>
          </div>
          <div className="comments-list">
            {comments[media[currentVideoIndex].media_id]?.map((comment) => (
              <div key={comment.comment_id} className="comment-item">
                <div className="comment-content">
                  <div className="comment-header-row">
                    <span className="comment-username">{comment.commenter_name}</span>
                    {comment.created_at && <span className="comment-timestamp">{new Date(comment.created_at).toLocaleString()}</span>}
                  </div>
                  <div className="comment-text">{comment.comment_text}</div>
                  <div className="comment-actions">
                    <button onClick={() => handleCommentLike(comment.comment_id)} className="like-btn">
                      👍 {comment.likes}
                    </button>
                    <button onClick={() => setReplyInputs(prev => ({ ...prev, [comment.comment_id]: !prev[comment.comment_id] }))} className="reply-btn">Reply</button>
                  </div>
                  {replyInputs[comment.comment_id] && (
                    <div className="reply-input">
                      <input
                        type="text"
                        placeholder="Write a reply..."
                        value={replyInputs[comment.comment_id] || ''}
                        onChange={(e) => setReplyInputs(prev => ({ ...prev, [comment.comment_id]: e.target.value }))}
                        onKeyPress={(e) => e.key === 'Enter' && handleReply(media[currentVideoIndex].media_id, comment.comment_id, replyInputs[comment.comment_id])}
                      />
                      <button onClick={() => handleReply(media[currentVideoIndex].media_id, comment.comment_id, replyInputs[comment.comment_id])}>Reply</button>
                    </div>
                  )}
                </div>
                {comment.replies && comment.replies.map((reply) => (
                  <div key={reply.comment_id} className="reply-item">
                    <div className="comment-content">
                      <div className="comment-header-row">
                        <span className="comment-username">{reply.commenter_name}</span>
                        {reply.created_at && <span className="comment-timestamp">{new Date(reply.created_at).toLocaleString()}</span>}
                      </div>
                      <div className="comment-text">{reply.comment_text}</div>
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
        </div>
      )}
    </div>
  );
};

export default MediaFeed;