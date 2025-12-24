import { useState, useEffect } from 'react';
import './MediaApproval.css';

function MediaApproval() {
  const [pendingMedia, setPendingMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPendingMedia();
  }, []);

  const fetchPendingMedia = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pending media');
      }

      const data = await response.json();
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

      // Remove from pending list
      setPendingMedia(pendingMedia.filter(media => media.media_id !== mediaId));
      alert('Media approved successfully');
    } catch (err) {
      alert('Error approving media: ' + err.message);
    }
  };

  const handleReject = async (mediaId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/${mediaId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to reject media');
      }

      // Remove from pending list
      setPendingMedia(pendingMedia.filter(media => media.media_id !== mediaId));
      alert('Media rejected successfully');
    } catch (err) {
      alert('Error rejecting media: ' + err.message);
    }
  };

  if (loading) {
    return <div className="media-approval-loading">Loading pending media...</div>;
  }

  if (error) {
    return <div className="media-approval-error">Error: {error}</div>;
  }

  return (
    <div className="media-approval">
      <h2>Media Approval</h2>
      {pendingMedia.length === 0 ? (
        <p>No pending media for approval.</p>
      ) : (
        <div className="pending-media-list">
          {pendingMedia.map(media => (
            <div key={media.media_id} className="media-item">
              <div className="media-info">
                <h3>{media.title}</h3>
                <p><strong>Artist:</strong> {media.artist}</p>
                <p><strong>Type:</strong> {media.media_type}</p>
                <p><strong>Category:</strong> {media.category}</p>
                <p><strong>Uploader:</strong> {media.creator_name}</p>
                <p><strong>Uploaded:</strong> {new Date(media.uploaded_at).toLocaleDateString()}</p>
                {media.description && <p><strong>Description:</strong> {media.description}</p>}
              </div>
              <div className="media-preview">
                {media.media_type === 'video' ? (
                  <video controls className="media-player">
                    <source src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${media.file_path}`} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <audio controls className="media-player">
                    <source src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${media.file_path}`} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                )}
              </div>
              <div className="media-actions">
                <button
                  className="approve-btn"
                  onClick={() => handleApprove(media.media_id)}
                >
                  Approve
                </button>
                <button
                  className="reject-btn"
                  onClick={() => handleReject(media.media_id)}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MediaApproval;