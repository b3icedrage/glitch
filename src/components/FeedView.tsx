import React, { useState } from 'react';
import { FeedPost, User, UserStory } from '../types';
import { StoriesBar } from './StoriesBar';
import { 
  Heart, 
  MessageCircle, 
  Send, 
  Bookmark, 
  Music, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight,
  Flame,
  PlaySquare,
  Check
} from 'lucide-react';

interface FeedViewProps {
  posts: FeedPost[];
  stories: UserStory[];
  currentUser: User;
  creators: Record<string, User>;
  onSelectStory: (index: number) => void;
  onAddStory: () => void;
  onOpenComments: (post: FeedPost) => void;
  onNavigateToSparks: () => void;
  onNavigateToTube: () => void;
  onNavigateToMessages?: (creatorId?: string) => void;
  onToggleFollow: (userId: string) => void;
  followedUserIds: Set<string>;
}

export const FeedView: React.FC<FeedViewProps> = ({
  posts,
  stories,
  currentUser,
  creators,
  onSelectStory,
  onAddStory,
  onOpenComments,
  onNavigateToSparks,
  onNavigateToTube,
  onNavigateToMessages,
  onToggleFollow,
  followedUserIds
}) => {
  const [localPosts, setLocalPosts] = useState<FeedPost[]>(posts);
  const [carouselIndexes, setCarouselIndexes] = useState<Record<string, number>>({});
  const [doubleTapHearts, setDoubleTapHearts] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleToggleLike = (postId: string) => {
    setLocalPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          const isLiked = !p.isLiked;
          return {
            ...p,
            isLiked,
            likesCount: isLiked ? p.likesCount + 1 : p.likesCount - 1
          };
        }
        return p;
      })
    );
  };

  const handleDoubleTap = (postId: string) => {
    // Show heart pop
    setDoubleTapHearts(prev => ({ ...prev, [postId]: true }));
    setTimeout(() => {
      setDoubleTapHearts(prev => ({ ...prev, [postId]: false }));
    }, 900);

    // If not already liked, toggle to liked
    setLocalPosts(prev =>
      prev.map(p => {
        if (p.id === postId && !p.isLiked) {
          return {
            ...p,
            isLiked: true,
            likesCount: p.likesCount + 1
          };
        }
        return p;
      })
    );
  };

  const handleToggleSave = (postId: string) => {
    setLocalPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          const isSaved = !p.isSaved;
          if (isSaved) showToast('Post saved to your collection');
          return { ...p, isSaved };
        }
        return p;
      })
    );
  };

  const handleShare = (post: FeedPost) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`https://glitch.network/p/${post.id}`);
    }
    showToast('Link copied to clipboard!');
  };

  const nextCarousel = (postId: string, total: number) => {
    setCarouselIndexes(prev => ({
      ...prev,
      [postId]: ((prev[postId] || 0) + 1) % total
    }));
  };

  const prevCarousel = (postId: string, total: number) => {
    setCarouselIndexes(prev => ({
      ...prev,
      [postId]: ((prev[postId] || 0) - 1 + total) % total
    }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-cyan-500/40 text-cyan-300 text-xs px-4 py-2.5 rounded-full shadow-lg backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
          {toastMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left / Center Column: Stories & Main Feed */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Top Stories Bar */}
          <StoriesBar
            stories={stories}
            currentUser={currentUser}
            onSelectStory={onSelectStory}
            onAddStory={onAddStory}
          />

          {/* Feed Posts */}
          <div className="space-y-6">
            {localPosts.map((post) => {
              const currentImgIdx = carouselIndexes[post.id] || 0;
              const hasMultipleImages = post.images.length > 1;

              return (
                <article
                  key={post.id}
                  className="bg-[#0d0f17] border border-slate-800/80 rounded-2xl overflow-hidden shadow-sm"
                >
                  {/* Card Header */}
                  <div className="p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-700"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-white leading-none hover:text-cyan-400 cursor-pointer">
                            {post.author.handle}
                          </span>
                          {post.author.verified && (
                            <span className="w-3.5 h-3.5 rounded-full bg-cyan-400 text-slate-950 text-[9px] flex items-center justify-center font-bold">
                              ✓
                            </span>
                          )}
                          <span className="text-slate-500 text-xs" aria-hidden="true">·</span>
                          <span className="text-xs text-slate-500 font-mono">{post.timestamp}</span>
                        </div>
                        {post.location && (
                          <p className="text-[11px] text-slate-400 mt-0.5">{post.location}</p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => showToast(`Post options for @${post.author.handle}`)}
                      className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
                      aria-label="More options"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Media Frame (Double tap to like) */}
                  <div
                    className="relative w-full aspect-square md:aspect-[4/3] bg-black overflow-hidden cursor-pointer select-none group"
                    onDoubleClick={() => handleDoubleTap(post.id)}
                  >
                    <img
                      src={post.images[currentImgIdx]}
                      alt={post.caption}
                      className="w-full h-full object-cover transition-opacity duration-200"
                      referrerPolicy="no-referrer"
                    />

                    {/* Double-tap Floating Animated Heart Burst */}
                    {doubleTapHearts[post.id] && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                        <Heart className="w-24 h-24 text-red-500 fill-red-500 animate-ping opacity-90 drop-shadow-2xl" />
                      </div>
                    )}

                    {/* Carousel Navigation Buttons */}
                    {hasMultipleImages && (
                      <>
                        {currentImgIdx > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              prevCarousel(post.id, post.images.length);
                            }}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm transition-transform active:scale-90"
                            aria-label="Previous image"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                        )}
                        {currentImgIdx < post.images.length - 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              nextCarousel(post.id, post.images.length);
                            }}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm transition-transform active:scale-90"
                            aria-label="Next image"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        )}

                        {/* Carousel Dots */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm">
                          {post.images.map((_, dotIdx) => (
                            <span
                              key={dotIdx}
                              className={`w-1.5 h-1.5 rounded-full transition-all ${
                                dotIdx === currentImgIdx
                                  ? 'bg-cyan-400 w-3'
                                  : 'bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleToggleLike(post.id)}
                          className={`transition-transform active:scale-125 ${
                            post.isLiked ? 'text-red-500' : 'text-slate-300 hover:text-white'
                          }`}
                          aria-label={post.isLiked ? 'Unlike' : 'Like'}
                        >
                          <Heart className={`w-6 h-6 ${post.isLiked ? 'fill-red-500' : ''}`} />
                        </button>

                        <button
                          onClick={() => onOpenComments(post)}
                          className="text-slate-300 hover:text-white transition-colors"
                          aria-label="View comments"
                        >
                          <MessageCircle className="w-6 h-6" />
                        </button>

                        <button
                          onClick={() => handleShare(post)}
                          className="text-slate-300 hover:text-white transition-colors"
                          aria-label="Share post"
                        >
                          <Send className="w-6 h-6" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleToggleSave(post.id)}
                        className={`transition-colors ${
                          post.isSaved ? 'text-cyan-400' : 'text-slate-300 hover:text-white'
                        }`}
                        aria-label={post.isSaved ? 'Unsave' : 'Save'}
                      >
                        <Bookmark className={`w-6 h-6 ${post.isSaved ? 'fill-cyan-400' : ''}`} />
                      </button>
                    </div>

                    {/* Likes Count */}
                    <div className="text-xs font-semibold text-white font-mono tabular-nums">
                      {post.likesCount.toLocaleString()} likes
                    </div>

                    {/* Sound Attribution if present */}
                    {post.soundTitle && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Music className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="font-medium text-slate-300 truncate max-w-xs">
                          {post.soundTitle}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-500 truncate">{post.soundArtist}</span>
                      </div>
                    )}

                    {/* Caption */}
                    <div className="text-xs text-slate-200 leading-relaxed">
                      <span className="font-semibold text-white mr-1.5">
                        {post.author.handle}
                      </span>
                      {post.caption}
                    </div>

                    {/* Hashtags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 text-xs text-cyan-400/90 font-medium">
                        {post.tags.map((tag) => (
                          <span key={tag} className="hover:underline cursor-pointer">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Comments Trigger */}
                    {post.commentsCount > 0 && (
                      <button
                        onClick={() => onOpenComments(post)}
                        className="text-xs text-slate-500 hover:text-slate-400 font-medium block pt-1"
                      >
                        View all {post.commentsCount} comments
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

        </div>

        {/* Right Desktop Sidebar: Profile Mini Card, Suggested Creators & Quick Switches */}
        <aside className="hidden lg:block lg:col-span-4 space-y-6 sticky top-20">
          
          {/* Current User Quick Header */}
          <div className="bg-[#0d0f17] border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-cyan-500/50"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white flex items-center gap-1 truncate">
                  {currentUser.handle}
                  <span className="w-3.5 h-3.5 rounded-full bg-cyan-400 text-slate-950 text-[9px] flex items-center justify-center font-bold">
                    ✓
                  </span>
                </p>
                <p className="text-xs text-slate-400 truncate">{currentUser.name}</p>
              </div>
            </div>
            <span className="text-xs font-mono text-cyan-400 font-medium">
              Glitch Creator
            </span>
          </div>

          {/* Quick Platform Cross-Promotion Banners */}
          <div className="grid grid-cols-2 gap-3">
            <div
              onClick={onNavigateToSparks}
              className="bg-gradient-to-br from-fuchsia-950/40 to-slate-900 border border-fuchsia-500/30 hover:border-fuchsia-500/70 p-3.5 rounded-xl cursor-pointer transition-all duration-200 group"
            >
              <div className="flex items-center gap-2 text-fuchsia-400 text-xs font-semibold">
                <Flame className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Sparks Reels</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-tight">
                Vertical 9:16 reels & live sounds
              </p>
            </div>

            <div
              onClick={onNavigateToTube}
              className="bg-gradient-to-br from-red-950/40 to-slate-900 border border-red-500/30 hover:border-red-500/70 p-3.5 rounded-xl cursor-pointer transition-all duration-200 group"
            >
              <div className="flex items-center gap-2 text-red-400 text-xs font-semibold">
                <PlaySquare className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Glitch Cinema</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-tight">
                4K long-form & masterclasses
              </p>
            </div>
          </div>

          {/* Suggested Creators */}
          <div className="bg-[#0d0f17] border border-slate-800/80 rounded-2xl p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase font-['Outfit']">
                Suggested Creators
              </span>
              <span className="text-xs text-cyan-400 cursor-pointer hover:underline font-medium">
                See all
              </span>
            </div>

            <div className="space-y-3 pt-1">
              {Object.values(creators).map((creator) => {
                const isFollowed = followedUserIds.has(creator.id);
                return (
                  <div key={creator.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={creator.avatar}
                        alt={creator.name}
                        className="w-9 h-9 rounded-full object-cover shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate hover:text-cyan-400 cursor-pointer">
                          {creator.handle}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {creator.followersCount.toLocaleString()} followers
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => onNavigateToMessages?.(creator.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition-colors"
                        title={`Message @${creator.handle}`}
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onToggleFollow(creator.id)}
                        className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                          isFollowed
                            ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30'
                        }`}
                      >
                        {isFollowed ? (
                          <>
                            <Check className="w-3 h-3 text-cyan-400" />
                            <span>Following</span>
                          </>
                        ) : (
                          <span>Follow</span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Glitch Footer Links */}
          <div className="text-[11px] text-slate-500 space-y-1.5 px-2">
            <div className="flex flex-wrap gap-x-2 gap-y-1">
              <span>About</span>
              <span>·</span>
              <span>Help</span>
              <span>·</span>
              <span>API</span>
              <span>·</span>
              <span>Creator Fund</span>
              <span>·</span>
              <span>Privacy</span>
              <span>·</span>
              <span>Terms</span>
            </div>
            <p className="font-mono text-[10px] text-slate-600">
              © 2026 GLITCH SOCIAL CORP. ALL CHANNELS SYNCHRONIZED.
            </p>
          </div>

        </aside>

      </div>
    </div>
  );
};
