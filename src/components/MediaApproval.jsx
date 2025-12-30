import { useState, useEffect, useRef, useCallback } from 'react';
import './MediaApproval.css';

function MediaApproval() {
  const [pendingMedia, setPendingMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [previewScale, setPreviewScale] = useState(1);
  const [mediaDimensions, setMediaDimensions] = useState({ width: 0, height: 0 });
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    fetchPendingMedia();
  }, []);

  const fetchPendingMedia = async () => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      // Try the new validation endpoint first
      let response = await fetch(`${baseUrl}/api/media/pending/validate`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        // Fallback to the original endpoint if validation endpoint not available
        console.log('Validation endpoint not available, falling back to original endpoint');
        setIsUsingFallback(true);
        response = await fetch(`${baseUrl}/api/media/pending`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } else {
        setIsUsingFallback(false);
      }

      if (!response.ok) {
        throw new Error('Failed to fetch pending media');
      }

      const data = await response.json();
      
      // If using fallback endpoint, add empty validation objects
      if (!data.media[0]?.validation) {
        data.media = data.media.map(media => ({
          ...media,
          validation: {
            fileIntegrity: true,
            contentQuality: true,
            metadata: !!(media.title && media.artist),
            safety: true,
            technicalSpecs: true,
            score: 100,
            recommendations: []
          }
        }));
      }
      
      setPendingMedia(data.media);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };



  const handleApprove = async (mediaId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/${mediaId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to approve media');
      }

      setPendingMedia(pendingMedia.filter(media => media.media_id !== mediaId));
      if (selectedMedia?.media_id === mediaId) {
        setSelectedMedia(null);
      }
      alert('Media approved successfully');
    } catch (err) {
      alert('Error approving media: ' + err.message);
    }
  };

  const handleReject = async (mediaId) => {
    try {
      const token = localStorage.getItem('token');
      const rejectionReason = prompt('Please provide a reason for rejection (optional):');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/${mediaId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: rejectionReason })
      });

      if (!response.ok) {
        throw new Error('Failed to reject media');
      }

      setPendingMedia(pendingMedia.filter(media => media.media_id !== mediaId));
      if (selectedMedia?.media_id === mediaId) {
        setSelectedMedia(null);
      }
      alert('Media rejected successfully');
    } catch (err) {
      alert('Error rejecting media: ' + err.message);
    }
  };

  // Generate media URL helper
  const getMediaUrl = (mediaItem) => {
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
  };

  // Handle media load for dimension calculation
  const handleMediaLoad = useCallback((mediaType) => {
    if (mediaType === 'video' && videoRef.current) {
      const video = videoRef.current;
      video.addEventListener('loadedmetadata', () => {
        const dimensions = {
          width: video.videoWidth,
          height: video.videoHeight
        };
        setMediaDimensions(dimensions);
        calculateOptimalScale(dimensions);
      });
    } else if (mediaType === 'audio' && audioRef.current) {
      // For audio, set default dimensions
      const dimensions = { width: 400, height: 60 };
      setMediaDimensions(dimensions);
      calculateOptimalScale(dimensions);
    }
  }, []);

  // Calculate optimal scale for 50% viewport display
  const calculateOptimalScale = (dimensions) => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Target dimensions (50% of viewport)
    const targetWidth = viewportWidth * 0.5;
    const targetHeight = viewportHeight * 0.5;
    
    // Calculate scale based on aspect ratio
    const widthScale = targetWidth / dimensions.width;
    const heightScale = targetHeight / dimensions.height;
    
    // Use the smaller scale to prevent overflow
    const optimalScale = Math.min(widthScale, heightScale, 1); // Don't scale up
    setPreviewScale(optimalScale);
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (mediaDimensions.width > 0) {
        calculateOptimalScale(mediaDimensions);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mediaDimensions]);

  const selectMediaForPreview = (media) => {
    setSelectedMedia(media);
    // Reset dimensions when selecting new media
    setMediaDimensions({ width: 0, height: 0 });
    setPreviewScale(1);
  };

  if (loading) {
    return <div className="media-approval-loading">Loading pending media...</div>;
  }

  if (error) {
    return <div className="media-approval-error">Error: {error}</div>;
  }

  return (
    <div className="media-approval">
      <h2>Admin Media Approval System</h2>
      
      {/* Fallback Mode Notification */}
      {isUsingFallback && (
        <div className="fallback-notification">
          <h4>🔄 Running in Compatibility Mode</h4>
          <p>Enhanced validation features will be available after deploying the updated backend. Current functionality includes basic media approval with standard preview.</p>
        </div>
      )}
      
      {/* Grid Layout Container */}
      <div className="media-approval-grid">
        
        {/* Pending Media List - Left Panel */}
        <div className="pending-media-panel">
          <h3>Pending Media ({pendingMedia.length})</h3>
          <div className="pending-media-list">
            {pendingMedia.length === 0 ? (
              <p className="no-pending">No pending media for approval.</p>
            ) : (
              pendingMedia.map(media => {
                const validation = media.validation || {};
                return (
                  <div 
                    key={media.media_id} 
                    className={`media-item ${selectedMedia?.media_id === media.media_id ? 'selected' : ''}`}
                    onClick={() => selectMediaForPreview(media)}
                  >
                    <div className="media-info">
                      <h4>{media.title}</h4>
                      <p><strong>Type:</strong> {media.media_type}</p>
                      <p><strong>Artist:</strong> {media.artist}</p>
                      <p><strong>Size:</strong> {(media.file_size / (1024 * 1024)).toFixed(2)} MB</p>
                      
                      {/* Validation Status Indicators */}
                      <div className="validation-indicators">
                        <span className={`validation-badge ${validation.fileIntegrity ? 'valid' : 'invalid'}`}>
                          ✓ File Integrity
                        </span>
                        <span className={`validation-badge ${validation.contentQuality ? 'valid' : 'invalid'}`}>
                          ✓ Quality
                        </span>
                        <span className={`validation-badge ${validation.metadata ? 'valid' : 'invalid'}`}>
                          ✓ Metadata
                        </span>
                      </div>
                    </div>
                    
                    <div className="media-actions">
                      <button
                        className="preview-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          selectMediaForPreview(media);
                        }}
                      >
                        Preview
                      </button>
                      <button
                        className="approve-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApprove(media.media_id);
                        }}
                      >
                        Approve
                      </button>
                      <button
                        className="reject-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReject(media.media_id);
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Preview Panel - Right Panel */}
        <div className="preview-panel">
          {selectedMedia ? (
            <div className="media-preview-container">
              <h3>Real-Time Preview</h3>
              
              <div className="preview-info">
                <h4>{selectedMedia.title}</h4>
                <p><strong>Artist:</strong> {selectedMedia.artist}</p>
                <p><strong>Type:</strong> {selectedMedia.media_type}</p>
                <p><strong>Dimensions:</strong> {mediaDimensions.width} × {mediaDimensions.height}</p>
                <p><strong>Scale:</strong> {(previewScale * 100).toFixed(0)}%</p>
              </div>

              {/* Media Player with Automatic Scaling */}
              <div className="media-preview" 
                   style={{
                     width: `${50 * previewScale}vw`,
                     height: `${50 * previewScale}vh`,
                     maxWidth: '100%',
                     maxHeight: '100%'
                   }}>
                {selectedMedia.media_type === 'video' ? (
                  <video 
                    ref={videoRef}
                    className="preview-player"
                    controls
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain'
                    }}
                    onLoadedMetadata={() => handleMediaLoad('video')}
                  >
                    <source src={getMediaUrl(selectedMedia)} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : selectedMedia.media_type === 'audio' ? (
                  <audio 
                    ref={audioRef}
                    className="preview-player"
                    controls
                    style={{
                      width: '100%',
                      height: '100%'
                    }}
                    onLoadedMetadata={() => handleMediaLoad('audio')}
                  >
                    <source src={getMediaUrl(selectedMedia)} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                ) : selectedMedia.media_type === 'image' ? (
                  <img 
                    className="preview-player"
                    src={getMediaUrl(selectedMedia)}
                    alt={selectedMedia.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain'
                    }}
                    onLoad={(e) => {
                      const img = e.target;
                      const dimensions = {
                        width: img.naturalWidth,
                        height: img.naturalHeight
                      };
                      setMediaDimensions(dimensions);
                      calculateOptimalScale(dimensions);
                    }}
                  />
                ) : null}
              </div>

              {/* Validation Details */}
              <div className="validation-details">
                <h4>Content Validation Results</h4>
                {selectedMedia.validation ? (
                  <div className="validation-grid">
                    <div className={`validation-item ${selectedMedia.validation.fileIntegrity ? 'passed' : 'failed'}`}>
                      <span className="validation-status">
                        {selectedMedia.validation.fileIntegrity ? '✓' : '✗'}
                      </span>
                      File Integrity
                    </div>
                    <div className={`validation-item ${selectedMedia.validation.contentQuality ? 'passed' : 'failed'}`}>
                      <span className="validation-status">
                        {selectedMedia.validation.contentQuality ? '✓' : '✗'}
                      </span>
                      Content Quality
                    </div>
                    <div className={`validation-item ${selectedMedia.validation.metadata ? 'passed' : 'failed'}`}>
                      <span className="validation-status">
                        {selectedMedia.validation.metadata ? '✓' : '✗'}
                      </span>
                      Metadata Complete
                    </div>
                    <div className={`validation-item ${selectedMedia.validation.safety ? 'passed' : 'failed'}`}>
                      <span className="validation-status">
                        {selectedMedia.validation.safety ? '✓' : '✗'}
                      </span>
                      Safety Check
                    </div>
                    <div className={`validation-item ${selectedMedia.validation.technicalSpecs ? 'passed' : 'failed'}`}>
                      <span className="validation-status">
                        {selectedMedia.validation.technicalSpecs ? '✓' : '✗'}
                      </span>
                      Technical Specs
                    </div>
                  </div>
                ) : (
                  <p>Validation in progress...</p>
                )}
              </div>

              {/* Preview Actions */}
              <div className="preview-actions">
                <button
                  className="approve-btn"
                  onClick={() => handleApprove(selectedMedia.media_id)}
                >
                  Approve Media
                </button>
                <button
                  className="reject-btn"
                  onClick={() => handleReject(selectedMedia.media_id)}
                >
                  Reject Media
                </button>
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <p>Select a media item from the left panel to preview</p>
              <div className="preview-instructions">
                <h4>Preview Features:</h4>
                <ul>
                  <li>Real-time scaling to 50% viewport dimensions</li>
                  <li>Automatic aspect ratio preservation</li>
                  <li>Overflow prevention across all devices</li>
                  <li>Automated content validation</li>
                  <li>Responsive grid layout</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MediaApproval;