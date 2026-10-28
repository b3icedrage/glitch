export type PlatformMode = 'feed' | 'sparks' | 'tube' | 'live' | 'explore' | 'messages' | 'profile';

export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  verified?: boolean;
  followersCount: number;
  followingCount: number;
  subscribersCount: string;
  likesCount: string;
  bio: string;
  links?: string[];
  walletSparks?: number;
}

export interface StorySticker {
  type: 'poll' | 'ama' | 'countdown' | 'soundtrack';
  question?: string;
  options?: { label: string; votes: number }[];
  targetDate?: string;
  trackName?: string;
  artistName?: string;
}

export interface StoryItem {
  id: string;
  mediaUrl: string;
  type: 'image' | 'video';
  durationSeconds: number;
  timestamp: string;
  caption?: string;
  stickers?: StorySticker[];
}

export interface UserStory {
  userId: string;
  user: User;
  hasUnseen: boolean;
  items: StoryItem[];
}

export interface Comment {
  id: string;
  user: User;
  text: string;
  timestamp: string;
  likesCount: number;
  isLiked?: boolean;
  creatorLiked?: boolean;
  replies?: Comment[];
}

export interface FeedPost {
  id: string;
  author: User;
  images: string[];
  caption: string;
  location?: string;
  soundTitle?: string;
  soundArtist?: string;
  likesCount: number;
  isLiked: boolean;
  isSaved: boolean;
  commentsCount: number;
  comments: Comment[];
  timestamp: string;
  tags: string[];
}

export interface SparkReel {
  id: string;
  author: User;
  videoUrl: string;
  posterUrl: string;
  caption: string;
  tags: string[];
  soundTitle: string;
  soundArtist: string;
  soundCover: string;
  likesCount: number;
  isLiked: boolean;
  isSaved: boolean;
  commentsCount: number;
  sharesCount: number;
  comments: Comment[];
  timestamp: string;
}

export interface CinemaVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: string;
  viewsCount: string;
  uploadedAt: string;
  channel: User;
  isSubscribed: boolean;
  likesCount: number;
  isLiked: boolean;
  isDisliked: boolean;
  category: string;
  tags: string[];
  commentsCount: number;
  comments: Comment[];
}

export interface UserNote {
  id: string;
  userId: string;
  user: User;
  text: string;
  musicTrack?: string;
  timestamp: string;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  type?: 'text' | 'image' | 'voice' | 'shared_media';
  audioDuration?: string;
  mediaUrl?: string;
  reactions?: string[];
  sharedMedia?: {
    id: string;
    title: string;
    thumbnail: string;
    mediaType: 'feed' | 'spark' | 'tube';
    authorHandle: string;
  };
}

export interface ChatThread {
  id: string;
  participant: User;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
  online: boolean;
  category?: 'primary' | 'general' | 'requests';
  messages: DirectMessage[];
}

export interface GlitchNotification {
  id: string;
  type: 'like' | 'comment' | 'mention' | 'subscribe' | 'system' | 'super_spark';
  actor: User;
  content: string;
  targetId?: string;
  targetType?: 'feed' | 'spark' | 'tube' | 'live';
  targetThumbnail?: string;
  timestamp: string;
  read: boolean;
  groupedCount?: number;
}

export interface LiveStream {
  id: string;
  streamer: User;
  title: string;
  category: string;
  viewerCount: number;
  thumbnailUrl: string;
  streamUrl: string;
  startedAt: string;
  tags: string[];
  coHost?: User;
}

export interface LiveChatMessage {
  id: string;
  user: User;
  message: string;
  timestamp: string;
  isSuperSpark?: boolean;
  superSparkAmount?: number;
  superSparkTier?: 'bolt' | 'matrix' | 'crown' | 'hyper';
}

export interface GlitchSound {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  duration: string;
  usageCount: string;
  category: string;
}


