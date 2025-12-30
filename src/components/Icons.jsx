// Icon components using Heroicons style SVG paths
import React from 'react';

const IconWrapper = ({ children, className = '', ...props }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {children}
  </svg>
);

// Phone and Data Icon
export const PhoneDataIcon = ({ className = '', ...props }) => (
  <IconWrapper className={className} {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 9h8M8 13h4"
    />
  </IconWrapper>
);

// Video and Music Icon
export const VideoMusicIcon = ({ className = '', ...props }) => (
  <IconWrapper className={className} {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 18V6l12-3v13"
    />
  </IconWrapper>
);

// Tickets Icon
export const TicketsIcon = ({ className = '', ...props }) => (
  <IconWrapper className={className} {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
    />
  </IconWrapper>
);

// Generic Arrow Right Icon for button indicators
export const ArrowRightIcon = ({ className = '', ...props }) => (
  <IconWrapper className={className} {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5l7 7-7 7"
    />
  </IconWrapper>
);

// Icon component factory for consistent styling
export const createIconComponent = (IconComponent) => ({
  className = '',
  size = 'w-6 h-6',
  ...props
}) => (
  <IconComponent 
    className={`${size} ${className}`} 
    {...props} 
  />
);

// Export all icons with consistent styling
export const Icons = {
  phoneData: createIconComponent(PhoneDataIcon),
  videoMusic: createIconComponent(VideoMusicIcon),
  tickets: createIconComponent(TicketsIcon),
  arrowRight: createIconComponent(ArrowRightIcon),
};