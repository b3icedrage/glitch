import React, { useState } from 'react';
import { User, FeedPost, SparkReel, CinemaVideo } from '../types';
import { 
  Grid3X3, 
  Flame, 
  PlaySquare, 
  Bookmark, 
  Settings, 
  Share2, 
  Link as LinkIcon, 
  Heart, 
  MessageCircle,
  Play,
  Edit3,
  ArrowLeft
} from 'lucide-react';

interface ProfileViewProps {
  currentUser: User;
  onUpdateUser: (updated: Partial<User>) => void;
  userPosts: FeedPost[];
  userSparks: SparkReel[];
  userVideos: CinemaVideo[];
  onSelectPost: (post: FeedPost) => void;
  onSelectSpark: (spark: SparkReel) => void;
  onSelectVideo: (video: CinemaVideo) => void;
  onNavigateToMessages?: () => void;
  onGoBack?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  onUpdateUser,
  userPosts,
  userSparks,
  userVideos,
  onSelectPost,
  onSelectSpark,
  onSelectVideo,
  onNavigateToMessages,
  onGoBack
}) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'sparks' | 'videos' | 'saved'>('posts');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(currentUser.name);
  const [editBio, setEditBio] = useState(currentUser.bio);
  const [editHandle, setEditHandle] = useState(currentUser.handle);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      name: editName,
      bio: editBio,
      handle: editHandle
    });
    setIsEditing(false);
    showToast('Profile updated successfully!');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-cyan-500/40 text-cyan-300 text-xs px-4 py-2.5 rounded-full shadow-lg backdrop-blur-md">
          {toastMessage}
        </div>
      )}

      {onGoBack && (
        <button
          onClick={onGoBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors w-fit shadow-sm"
          title="Back to previous page"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" />
          <span>Back to previous page</span>
        </button>
      )}

      {/* Profile Header Card */}
      <div className="bg-[#0d0f17] border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
          
          {/* Avatar with glowing aura */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full p-[3px] bg-gradient-to-tr from-cyan-400 via-indigo-500 to-fuchsia-500 shadow-lg shadow-fuchsia-500/20">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Details & Actions */}
          <div className="flex-1 text-center md:text-left space-y-4 min-w-0">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white flex items-center justify-center md:justify-start gap-2">
                  {currentUser.name}
                  {currentUser.verified && (
                    <span className="w-4 h-4 rounded-full bg-cyan-400 text-slate-950 text-[10px] flex items-center justify-center font-bold">
                      ✓
                    </span>
                  )}
                </h1>
                <p className="text-sm text-cyan-400/90 font-mono mt-0.5">
                  @{currentUser.handle}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-2.5 flex-wrap">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>

                <button
                  onClick={onNavigateToMessages}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-950/40 border border-cyan-800/60 hover:bg-cyan-900/50 text-xs font-semibold text-cyan-300 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Direct Messages</span>
                </button>

                <button
                  onClick={() => {
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(`https://glitch.network/@${currentUser.handle}`);
                    }
                    showToast('Profile link copied to clipboard!');
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Share profile"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Cross-Platform Stats Row */}
            <div className="flex items-center justify-center md:justify-start gap-6 md:gap-8 pt-1 text-xs">
              <div className="flex flex-col items-center md:items-start">
                <span className="text-base md:text-lg font-bold text-white font-mono">
                  {currentUser.followersCount.toLocaleString()}
                </span>
                <span className="text-slate-400">Followers</span>
              </div>
              <div className="w-[1px] h-8 bg-slate-800" />
              <div className="flex flex-col items-center md:items-start">
                <span className="text-base md:text-lg font-bold text-white font-mono">
                  {currentUser.likesCount}
                </span>
                <span className="text-slate-400">Spark Likes</span>
              </div>
              <div className="w-[1px] h-8 bg-slate-800" />
              <div className="flex flex-col items-center md:items-start">
                <span className="text-base md:text-lg font-bold text-white font-mono">
                  {currentUser.subscribersCount}
                </span>
                <span className="text-slate-400">Subscribers</span>
              </div>
            </div>

            {/* Bio & Links */}
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-xl">
              {currentUser.bio}
            </p>

            {currentUser.links && currentUser.links.length > 0 && (
              <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap text-xs text-cyan-400">
                {currentUser.links.map((link, idx) => (
                  <span key={idx} className="flex items-center gap-1 hover:underline cursor-pointer">
                    <LinkIcon className="w-3.5 h-3.5" />
                    {link}
                  </span>
                ))}
              </div>
            )}

          </div>

        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d0f17] border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-white font-['Outfit'] mb-4">
              Edit Creator Profile
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Display Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Handle (@)</label>
                <input
                  type="text"
                  value={editHandle}
                  onChange={(e) => setEditHandle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Bio</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white font-semibold shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Platform Content Navigation Tabs */}
      <div className="flex items-center justify-center border-t border-slate-800">
        <div className="flex items-center gap-8 -mt-[1px]">
          
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex items-center gap-2 py-4 text-xs font-semibold uppercase tracking-wider transition-colors border-t-2 ${
              activeTab === 'posts'
                ? 'border-cyan-400 text-white'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
            <span>Feeds</span>
          </button>

          <button
            onClick={() => setActiveTab('sparks')}
            className={`flex items-center gap-2 py-4 text-xs font-semibold uppercase tracking-wider transition-colors border-t-2 ${
              activeTab === 'sparks'
                ? 'border-fuchsia-400 text-white'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Sparks</span>
          </button>

          <button
            onClick={() => setActiveTab('videos')}
            className={`flex items-center gap-2 py-4 text-xs font-semibold uppercase tracking-wider transition-colors border-t-2 ${
              activeTab === 'videos'
                ? 'border-red-400 text-white'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <PlaySquare className="w-4 h-4" />
            <span>Cinema</span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 py-4 text-xs font-semibold uppercase tracking-wider transition-colors border-t-2 ${
              activeTab === 'saved'
                ? 'border-amber-400 text-white'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved</span>
          </button>

        </div>
      </div>

      {/* Content Displays */}
      {activeTab === 'posts' && (
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          {userPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => onSelectPost(post)}
              className="relative aspect-square bg-slate-900 rounded-xl overflow-hidden cursor-pointer group"
            >
              <img
                src={post.images[0]}
                alt={post.caption}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-6 text-white font-mono text-xs transition-opacity">
                <span className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4 fill-white" />
                  {post.likesCount}
                </span>
                <span className="flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 fill-white" />
                  {post.commentsCount}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'sparks' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {userSparks.map((spark) => (
            <div
              key={spark.id}
              onClick={() => onSelectSpark(spark)}
              className="relative aspect-[9/16] bg-slate-900 rounded-2xl overflow-hidden cursor-pointer group border border-slate-800 hover:border-fuchsia-500/60 transition-all"
            >
              <img
                src={spark.posterUrl}
                alt={spark.caption}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-end">
                <span className="flex items-center gap-1 text-white text-xs font-mono font-semibold">
                  <Play className="w-3.5 h-3.5 fill-white" />
                  {(spark.likesCount / 1000).toFixed(1)}k
                </span>
                <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">{spark.caption}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'videos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userVideos.map((video) => (
            <div
              key={video.id}
              onClick={() => onSelectVideo(video)}
              className="bg-[#0d0f17] border border-slate-800 rounded-2xl overflow-hidden cursor-pointer group hover:border-red-500/50 transition-colors"
            >
              <div className="relative aspect-video bg-black overflow-hidden">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-2 right-2 bg-black/80 text-white font-mono text-[11px] px-1.5 py-0.5 rounded">
                  {video.duration}
                </span>
              </div>
              <div className="p-4">
                <h4 className="text-sm font-semibold text-white line-clamp-1 group-hover:text-red-400 transition-colors">
                  {video.title}
                </h4>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-mono">
                  <span>{video.viewsCount} views</span>
                  <span aria-hidden="true">·</span>
                  <span>{video.uploadedAt}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'saved' && (
        <div className="text-center py-12 text-slate-500 text-xs">
          <Bookmark className="w-10 h-10 mx-auto mb-2 text-slate-600 stroke-[1.5]" />
          <p className="font-medium text-slate-400">All bookmarked media will appear here</p>
          <p className="text-slate-500 mt-1">Bookmark posts, sparks, and tubes to curate your inspiration board.</p>
        </div>
      )}

    </div>
  );
};
