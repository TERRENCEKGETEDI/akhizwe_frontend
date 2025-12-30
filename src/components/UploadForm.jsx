import { useState, useEffect } from 'react';
import './UploadForm.css';

const UploadForm = ({ user, token, onUploadSuccess = () => {} }) => {
  // Component state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    media_type: '',
    category: '',
    file: null
  });
  const [isUploadProcessing, setIsUploadProcessing] = useState(false);
  const [uploadStatusMessage, setUploadStatusMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  // Check for existing upload processing state
  useEffect(() => {
    const processing = localStorage.getItem('uploadProcessing');
    if (processing === 'true') {
      setIsUploadProcessing(true);
      setUploadStatusMessage('Processing your upload...');
    }
  }, []);

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setUploadForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 100MB)
      const maxSize = 100 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('File size must be less than 100MB');
        return;
      }

      // Auto-detect media type based on file
      const fileType = file.type;
      let detectedType = '';
      
      if (fileType.startsWith('image/')) {
        detectedType = 'image';
      } else if (fileType.startsWith('video/')) {
        detectedType = 'video';
      } else if (fileType.startsWith('audio/')) {
        detectedType = 'audio';
      } else {
        alert('Please select a valid image, video, or audio file');
        return;
      }

      setUploadForm(prev => ({
        ...prev,
        file: file,
        media_type: detectedType
      }));

      // Auto-generate title if not provided
      if (!uploadForm.title) {
        const fileName = file.name.split('.')[0];
        setUploadForm(prev => ({
          ...prev,
          title: fileName
        }));
      }
    }
  };

  // Simulate upload progress for better UX
  const simulateProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 90) {
        progress = 90;
        clearInterval(interval);
      }
      setUploadProgress(progress);
    }, 500);
    
    return interval;
  };

  // Handle form submission
  const handleUpload = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!uploadForm.file) {
      alert('Please select a file to upload');
      return;
    }

    if (!uploadForm.title.trim()) {
      alert('Please enter a title for your media');
      return;
    }

    if (!uploadForm.media_type) {
      alert('Please select a media type');
      return;
    }

    if (isUploadProcessing) return;

    setIsUploadProcessing(true);
    setUploadStatusMessage('Processing your upload...');
    setUploadProgress(0);
    localStorage.setItem('uploadProcessing', 'true');

    try {
      // Start progress simulation
      const progressInterval = simulateProgress();

      // Prepare form data
      const formData = new FormData();
      Object.keys(uploadForm).forEach(key => {
        if (uploadForm[key]) {
          formData.append(key, uploadForm[key]);
        }
      });

      // Add user metadata
      formData.append('creator_name', user?.name || 'Anonymous');
      formData.append('creator_email', user?.email || '');

      // Make upload request
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/media/upload`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}` 
        },
        body: formData
      });

      const data = await response.json();

      // Clear progress interval
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      // Success
      setUploadStatusMessage('Upload completed successfully!');
      alert(data.message || 'Upload successful!');
      
      // Reset form
      setUploadForm({
        title: '',
        description: '',
        media_type: '',
        category: '',
        file: null
      });
      
      setUploadProgress(0);
      onUploadSuccess(data);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatusMessage('Upload failed. Please try again.');
      
      let errorMessage = 'Upload failed. Please try again.';
      if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
      setUploadProgress(0);

    } finally {
      setIsUploadProcessing(false);
      localStorage.removeItem('uploadProcessing');
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const fakeEvent = {
        target: {
          files: files
        }
      };
      handleFileChange(fakeEvent);
    }
  };

  // File type options based on media type
  const getAcceptAttribute = () => {
    if (!uploadForm.media_type || uploadForm.media_type === '') {
      return 'audio/*,video/*,image/*';
    }
    
    switch (uploadForm.media_type) {
      case 'image':
        return 'image/*';
      case 'video':
        return 'video/*';
      case 'audio':
        return 'audio/*';
      default:
        return 'audio/*,video/*,image/*';
    }
  };

  // Get file type icon
  const getFileTypeIcon = (mediaType) => {
    switch (mediaType) {
      case 'image':
        return '🖼️';
      case 'video':
        return '🎥';
      case 'audio':
        return '🎵';
      default:
        return '📄';
    }
  };

  // Get file size string
  const getFileSizeString = (bytes) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="upload-form-container">
      <div className="upload-section">
        <div className="upload-header">
          <h2>Upload Media</h2>
          <p>Share your creative content with the community</p>
        </div>

        <form onSubmit={handleUpload} className="upload-form" noValidate>
          {/* File Upload Area */}
          <div 
            className={`file-upload-area ${uploadForm.file ? 'has-file' : ''}`}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept={getAcceptAttribute()}
              onChange={handleFileChange}
              disabled={isUploadProcessing}
              id="file-upload"
              className="file-input"
            />
            
            <label htmlFor="file-upload" className="file-upload-label">
              {uploadForm.file ? (
                <div className="file-info">
                  <div className="file-icon">{getFileTypeIcon(uploadForm.media_type)}</div>
                  <div className="file-details">
                    <span className="file-name">{uploadForm.file.name}</span>
                    <span className="file-size">{getFileSizeString(uploadForm.file.size)}</span>
                  </div>
                  <button
                    type="button"
                    className="remove-file-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      setUploadForm(prev => ({ ...prev, file: null }));
                    }}
                    disabled={isUploadProcessing}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <div className="upload-icon">📁</div>
                  <span>Drop your file here or click to browse</span>
                  <small>Supports images, videos, and audio files (max 100MB)</small>
                </div>
              )}
            </label>
          </div>

          {/* Media Type Selection */}
          <div className="form-group">
            <label htmlFor="media-type">Media Type</label>
            <select
              id="media-type"
              value={uploadForm.media_type}
              onChange={(e) => handleInputChange('media_type', e.target.value)}
              required
              disabled={isUploadProcessing}
              className="form-control"
            >
              <option value="">Select Type</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="audio">Audio</option>
            </select>
          </div>

          {/* Title Input */}
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              placeholder="Enter a descriptive title"
              value={uploadForm.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
              disabled={isUploadProcessing}
              className="form-control"
              maxLength={100}
            />
            <small className="form-help">{uploadForm.title.length}/100 characters</small>
          </div>

          {/* Description Input */}
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              placeholder="Tell us about your media (optional)"
              value={uploadForm.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              disabled={isUploadProcessing}
              className="form-control"
              rows={4}
              maxLength={500}
            />
            <small className="form-help">{uploadForm.description.length}/500 characters</small>
          </div>

          {/* Category Input */}
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <input
              type="text"
              id="category"
              placeholder="e.g., Pop, Rock, Hip-Hop, Electronic"
              value={uploadForm.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              disabled={isUploadProcessing}
              className="form-control"
              list="category-suggestions"
            />
            <datalist id="category-suggestions">
              <option value="Pop" />
              <option value="Rock" />
              <option value="Hip-Hop" />
              <option value="Electronic" />
              <option value="Jazz" />
              <option value="Classical" />
              <option value="Country" />
              <option value="R&B" />
              <option value="Blues" />
              <option value="Folk" />
              <option value="Reggae" />
              <option value="Indie" />
              <option value="Alternative" />
              <option value="Metal" />
              <option value="Punk" />
            </datalist>
            <small className="form-help">Helps users discover your content</small>
          </div>

          {/* Upload Progress */}
          {isUploadProcessing && (
            <div className="upload-progress-container">
              <div className="upload-progress-bar">
                <div 
                  className="upload-progress-fill" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <div className="upload-status">
                <span className="upload-status-text">{uploadStatusMessage}</span>
                <span className="upload-progress-text">{Math.round(uploadProgress)}%</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isUploadProcessing || !uploadForm.file || !uploadForm.title.trim()}
            className="upload-submit-btn"
            aria-describedby="upload-status-message"
          >
            {isUploadProcessing ? (
              <>
                <div className="loading-spinner"></div>
                Processing...
              </>
            ) : (
              <>
                <span className="btn-icon">⬆️</span>
                Upload Media
              </>
            )}
          </button>

          {/* Screen Reader Status */}
          <div 
            id="upload-status-message" 
            aria-live="polite" 
            className="sr-only"
          >
            {uploadStatusMessage}
          </div>
        </form>

        {/* Upload Guidelines */}
        <div className="upload-guidelines">
          <h3>Upload Guidelines</h3>
          <ul>
            <li>📝 Provide a clear, descriptive title</li>
            <li>📄 Add a helpful description to explain your content</li>
            <li>🏷️ Choose an appropriate category for better discoverability</li>
            <li>⚖️ Ensure you have rights to share the content</li>
            <li>🔒 Content will be reviewed before appearing publicly</li>
            <li>📊 You can track your upload status in "My Media"</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UploadForm;