// Enhanced Hollow/Outline Icons with Interactive Color Filling
import React from 'react';

const EnhancedIconWrapper = ({ 
  children, 
  className = '', 
  isActive = false, 
  fillColor = 'currentColor',
  strokeColor = 'currentColor',
  strokeWidth = 2,
  animationDuration = '0.3s',
  ...props 
}) => (
  <svg
    className={`enhanced-icon ${isActive ? 'active' : ''} ${className}`}
    fill="none"
    stroke={strokeColor}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      '--fill-color': fillColor,
      '--stroke-color': strokeColor,
      '--animation-duration': animationDuration
    }}
    {...props}
  >
    {children}
  </svg>
);

// Heart Icon (for likes) - Hollow that fills with red when active
export const HollowHeartIcon = ({ isActive = false, size = 32, ...props }) => (
  <EnhancedIconWrapper 
    isActive={isActive}
    fillColor={isActive ? '#ff4757' : 'transparent'}
    strokeColor={isActive ? '#ff4757' : 'currentColor'}
    className="heart-icon"
    width={size}
    height={size}
    {...props}
  >
    <path 
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      className="heart-path"
    />
  </EnhancedIconWrapper>
);

// Star Icon (for favorites) - Hollow that fills with orange when active
export const HollowStarIcon = ({ isActive = false, size = 32, ...props }) => (
  <EnhancedIconWrapper 
    isActive={isActive}
    fillColor={isActive ? '#ffa502' : 'transparent'}
    strokeColor={isActive ? '#ffa502' : 'currentColor'}
    className="star-icon"
    width={size}
    height={size}
    {...props}
  >
    <path 
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      className="star-path"
    />
  </EnhancedIconWrapper>
);

// Comment Icon (for comments) - Hollow that fills with blue when active
export const HollowCommentIcon = ({ isActive = false, size = 32, ...props }) => (
  <EnhancedIconWrapper 
    isActive={isActive}
    fillColor={isActive ? '#3742fa' : 'transparent'}
    strokeColor={isActive ? '#3742fa' : 'currentColor'}
    className="comment-icon"
    width={size}
    height={size}
    {...props}
  >
    <path 
      d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
      className="comment-path"
    />
  </EnhancedIconWrapper>
);

// Share Icon (for sharing) - Hollow that fills with green when active
export const HollowShareIcon = ({ isActive = false, size = 32, ...props }) => (
  <EnhancedIconWrapper 
    isActive={isActive}
    fillColor={isActive ? '#2ed573' : 'transparent'}
    strokeColor={isActive ? '#2ed573' : 'currentColor'}
    className="share-icon"
    width={size}
    height={size}
    {...props}
  >
    <path 
      d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"
      className="share-path"
    />
  </EnhancedIconWrapper>
);

// Volume Icons - Hollow that fills with purple when active
export const HollowVolumeUpIcon = ({ isActive = false, size = 32, ...props }) => (
  <EnhancedIconWrapper 
    isActive={isActive}
    fillColor={isActive ? '#5f27cd' : 'transparent'}
    strokeColor={isActive ? '#5f27cd' : 'currentColor'}
    className="volume-up-icon"
    width={size}
    height={size}
    {...props}
  >
    <path 
      d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"
      className="volume-up-path"
    />
  </EnhancedIconWrapper>
);

export const HollowVolumeMuteIcon = ({ isActive = false, size = 32, ...props }) => (
  <EnhancedIconWrapper 
    isActive={isActive}
    fillColor={isActive ? '#5f27cd' : 'transparent'}
    strokeColor={isActive ? '#5f27cd' : 'currentColor'}
    className="volume-mute-icon"
    width={size}
    height={size}
    {...props}
  >
    <path 
      d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6"
      className="volume-mute-path"
    />
  </EnhancedIconWrapper>
);

// Play/Pause Icons - Hollow that fills with yellow when active
export const HollowPlayIcon = ({ isActive = false, size = 32, ...props }) => (
  <EnhancedIconWrapper 
    isActive={isActive}
    fillColor={isActive ? '#ffa502' : 'transparent'}
    strokeColor={isActive ? '#ffa502' : 'currentColor'}
    className="play-icon"
    width={size}
    height={size}
    {...props}
  >
    <path 
      d="M8 5v14l11-7z"
      className="play-path"
    />
  </EnhancedIconWrapper>
);

export const HollowPauseIcon = ({ isActive = false, size = 32, ...props }) => (
  <EnhancedIconWrapper 
    isActive={isActive}
    fillColor={isActive ? '#ffa502' : 'transparent'}
    strokeColor={isActive ? '#ffa502' : 'currentColor'}
    className="pause-icon"
    width={size}
    height={size}
    {...props}
  >
    <path 
      d="M6 4h4v16H6zM14 4h4v16h-4z"
      className="pause-path"
    />
  </EnhancedIconWrapper>
);

// Navigation Arrow Icons - Hollow that fills with cyan when active
export const HollowArrowUpIcon = ({ isActive = false, size = 32, ...props }) => (
  <EnhancedIconWrapper 
    isActive={isActive}
    fillColor={isActive ? '#00d2d3' : 'transparent'}
    strokeColor={isActive ? '#00d2d3' : 'currentColor'}
    className="arrow-up-icon"
    width={size}
    height={size}
    {...props}
  >
    <path 
      d="M12 19V5M5 12l7-7 7 7"
      className="arrow-up-path"
    />
  </EnhancedIconWrapper>
);

export const HollowArrowDownIcon = ({ isActive = false, size = 32, ...props }) => (
  <EnhancedIconWrapper 
    isActive={isActive}
    fillColor={isActive ? '#00d2d3' : 'transparent'}
    strokeColor={isActive ? '#00d2d3' : 'currentColor'}
    className="arrow-down-icon"
    width={size}
    height={size}
    {...props}
  >
    <path 
      d="M12 5v14M5 12l7 7 7-7"
      className="arrow-down-path"
    />
  </EnhancedIconWrapper>
);

// Music Note Icon (for audio content) - Hollow that fills with pink when active
export const HollowMusicNoteIcon = ({ isActive = false, size = 32, ...props }) => (
  <EnhancedIconWrapper 
    isActive={isActive}
    fillColor={isActive ? '#ff3838' : 'transparent'}
    strokeColor={isActive ? '#ff3838' : 'currentColor'}
    className="music-note-icon"
    width={size}
    height={size}
    {...props}
  >
    <path 
      d="M9 18V5l12-2v13M9 18c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zm12-2c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3z"
      className="music-note-path"
    />
  </EnhancedIconWrapper>
);

// Close Icon (for closing comments, etc.) - Hollow that fills with red when active
export const HollowCloseIcon = ({ isActive = false, size = 32, ...props }) => (
  <EnhancedIconWrapper 
    isActive={isActive}
    fillColor={isActive ? '#ff4757' : 'transparent'}
    strokeColor={isActive ? '#ff4757' : 'currentColor'}
    className="close-icon"
    width={size}
    height={size}
    {...props}
  >
    <path 
      d="M18 6L6 18M6 6l12 12"
      className="close-path"
    />
  </EnhancedIconWrapper>
);

// Thumbs Up Icon (for comment likes) - Hollow that fills with green when active
export const HollowThumbsUpIcon = ({ isActive = false, size = 32, ...props }) => (
  <EnhancedIconWrapper 
    isActive={isActive}
    fillColor={isActive ? '#2ed573' : 'transparent'}
    strokeColor={isActive ? '#2ed573' : 'currentColor'}
    className="thumbs-up-icon"
    width={size}
    height={size}
    {...props}
  >
    <path 
      d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"
      className="thumbs-up-path"
    />
  </EnhancedIconWrapper>
);

// Reply Icon (for comment replies) - Hollow that fills with blue when active
export const HollowReplyIcon = ({ isActive = false, size = 32, ...props }) => (
  <EnhancedIconWrapper 
    isActive={isActive}
    fillColor={isActive ? '#3742fa' : 'transparent'}
    strokeColor={isActive ? '#3742fa' : 'currentColor'}
    className="reply-icon"
    width={size}
    height={size}
    {...props}
  >
    <path 
      d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"
      className="reply-path"
    />
  </EnhancedIconWrapper>
);

// Loading Spinner - Animated hollow circle
export const HollowSpinnerIcon = ({ size = 32, ...props }) => (
  <EnhancedIconWrapper 
    fillColor="transparent"
    strokeColor="#ffffff"
    className="spinner-icon"
    width={size}
    height={size}
    {...props}
  >
    <path 
      d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
      className="spinner-path"
    />
  </EnhancedIconWrapper>
);

// User Avatar Icon (for user fallback) - Hollow that fills with teal when active
export const HollowUserIcon = ({ isActive = false, size = 32, ...props }) => (
  <EnhancedIconWrapper 
    isActive={isActive}
    fillColor={isActive ? '#01a3a4' : 'transparent'}
    strokeColor={isActive ? '#01a3a4' : 'currentColor'}
    className="user-icon"
    width={size}
    height={size}
    {...props}
  >
    <path 
      d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
      className="user-path"
    />
  </EnhancedIconWrapper>
);

// Export all enhanced icons
export const EnhancedIcons = {
  heart: HollowHeartIcon,
  star: HollowStarIcon,
  comment: HollowCommentIcon,
  share: HollowShareIcon,
  volumeUp: HollowVolumeUpIcon,
  volumeMute: HollowVolumeMuteIcon,
  play: HollowPlayIcon,
  pause: HollowPauseIcon,
  arrowUp: HollowArrowUpIcon,
  arrowDown: HollowArrowDownIcon,
  musicNote: HollowMusicNoteIcon,
  close: HollowCloseIcon,
  thumbsUp: HollowThumbsUpIcon,
  reply: HollowReplyIcon,
  spinner: HollowSpinnerIcon,
  user: HollowUserIcon,
};

// Icon component factory for consistent usage
export const createEnhancedIconComponent = (IconComponent) => ({
  isActive = false,
  size = 32,
  className = '',
  ...props
}) => (
  <IconComponent 
    isActive={isActive}
    size={size}
    className={className}
    {...props} 
  />
);