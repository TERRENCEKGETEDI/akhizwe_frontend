// Component exports for easy importing
export { default as VideoMusic } from './VideoMusic';
export { default as MediaFeed } from './MediaFeed';
export { default as UploadForm } from './UploadForm';
export { default as MyMedia } from './MyMedia';
export { default as SharedNavigation } from './SharedNavigation';
export { default as Notifications } from './Notifications';
export { default as Profile } from './Profile';

// Re-export with more descriptive names for different use cases
export const MusicVideoMusic = (props) => <VideoMusic {...props} mediaType="music" />;
export const VideoOnlyVideoMusic = (props) => <VideoMusic {...props} mediaType="video" />;
export const AllMediaVideoMusic = (props) => <VideoMusic {...props} mediaType="all" />;