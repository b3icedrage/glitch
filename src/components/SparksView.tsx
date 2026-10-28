import React, { useState, useRef, useEffect } from 'react';
import { SparkReel, User } from '../types';
import { 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Share2, 
  Music, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  ChevronUp, 
  ChevronDown, 
  Plus,
  Check,
  ArrowLeft,
  Layers,
  Sparkles
} from 'lucide-react';

interface SparksViewProps {
  reels: SparkReel[];
  currentUser: User;
  onOpenComments: (reel: SparkReel) => void;
  onToggleFollow: (userId: string) => void;
  followedUserIds: Set<string>;
  onGoBack?: () => void;
  onOpenSoundHub?: (soundTitle: string, soundArtist: string, soundCover: string) => void;
}

export const SparksView: React.FC<SparksViewProps> = ({
  reels,
  currentUser,
  onOpenComments,
  onToggleFollow,
  followedUserIds,
  onGoBack,
  onOpenSoundHub
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true); // Default muted to ensure autoplay works reliably in all browsers
  const [isDuetMode, setIsDuetMode] = useState(false);
  const [localReels, setLocalReels] = useState<SparkReel[]>(reels);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [clickHearts, setClickHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const activeReel = localReels[currentIndex];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Keyboard navigation (Arrow Up / Down)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        goToNext();
      } else if (e.key === 'ArrowUp') {
        goToPrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key.toLowerCase() === 'm') {
        setIsMuted(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, localReels.length]);

  // Video playback management on index change
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      if (isPlaying) {
        videoRef.current.play().catch(() => {
          // Autoplay fallback: if blocked with audio, mute and play
          setIsMuted(true);
          videoRef.current?.play().catch(() => {});
        });
      }
    }
  }, [currentIndex]);

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const goToNext = () => {
    if (currentIndex < localReels.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsPlaying(true);
    } else {
      // Loop back to start
      setCurrentIndex(0);
      setIsPlaying(true);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsPlaying(true);
    }
  };

  const handleDoubleTap = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const heartId = Date.now();
    setClickHearts(prev => [...prev, { id: heartId, x, y }]);
    setTimeout(() => {
      setClickHearts(prev => prev.filter(h => h.id !== heartId));
    }, 1000);

    // Toggle like if not liked
    if (!activeReel.isLiked) {
      toggleLike(activeReel.id);
    }
  };

  const toggleLike = (reelId: string) => {
    setLocalReels(prev =>
      prev.map(r => {
        if (r.id === reelId) {
          const isLiked = !r.isLiked;
          return {
            ...r,
            isLiked,
            likesCount: isLiked ? r.likesCount + 1 : r.likesCount - 1
          };
        }
        return r;
      })
    );
  };

  const toggleSave = (reelId: string) => {
    setLocalReels(prev =>
      prev.map(r => {
        if (r.id === reelId) {
          const isSaved = !r.isSaved;
          if (isSaved) showToast('Saved to your sparks collection');
          return { ...r, isSaved };
        }
        return r;
      })
    );
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`https://glitch.network/sparks/${activeReel.id}`);
    }
    showToast('Sparks link copied to clipboard!');
  };

  const formatReelCount = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (!activeReel) return null;

  const isAuthorFollowed = followedUserIds.has(activeReel.author.id);

  return (
    <div className="relative w-full h-[calc(100vh-65px)] max-h-[920px] flex items-center justify-center p-0 md:p-4 select-none overflow-hidden">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-cyan-500/40 text-cyan-300 text-xs px-4 py-2 rounded-full shadow-lg backdrop-blur-md">
          {toastMessage}
        </div>
      )}

      {/* Main Sparks Container (9:16 Aspect Ratio) */}
      <div className="relative w-full max-w-[420px] h-full bg-black md:rounded-3xl overflow-hidden shadow-2xl border border-slate-800/60 flex items-center justify-center">
        
        {/* Video Player & Duet Split */}
        {isDuetMode ? (
          <div className="w-full h-full flex flex-col md:flex-row">
            {/* Original Spark */}
            <div className="relative flex-1 h-1/2 md:h-full border-b md:border-b-0 md:border-r border-cyan-500/40">
              <video
                ref={videoRef}
                src={activeReel.videoUrl}
                poster={activeReel.posterUrl}
                playsInline
                loop
                muted={isMuted}
                className="w-full h-full object-cover cursor-pointer"
                onClick={togglePlayPause}
                onDoubleClick={handleDoubleTap}
                onTimeUpdate={(e) => {
                  const v = e.currentTarget;
                  if (v.duration) {
                    setProgress((v.currentTime / v.duration) * 100);
                    setDuration(v.duration);
                  }
                }}
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[9px] font-mono text-cyan-400">
                Original by @{activeReel.author.handle}
              </div>
            </div>

            {/* Duet Camera Reaction */}
            <div className="relative flex-1 h-1/2 md:h-full bg-slate-900 flex items-center justify-center overflow-hidden">
              <img
                src={currentUser.avatar}
                alt="Duet reaction"
                className="w-full h-full object-cover filter brightness-90"
              />
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-rose-600 text-[9px] font-bold text-white flex items-center gap-1 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                RECORDING REMIX
              </div>
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[9px] font-mono text-white">
                You (@{currentUser.handle})
              </div>
            </div>
          </div>
        ) : (
          <video
            ref={videoRef}
            src={activeReel.videoUrl}
            poster={activeReel.posterUrl}
            playsInline
            loop
            muted={isMuted}
            className="w-full h-full object-cover cursor-pointer"
            onClick={togglePlayPause}
            onDoubleClick={handleDoubleTap}
            onTimeUpdate={(e) => {
              const v = e.currentTarget;
              if (v.duration) {
                setProgress((v.currentTime / v.duration) * 100);
                setDuration(v.duration);
              }
            }}
          />
        )}

        {/* Play / Pause Central Indicator Icon on Tap */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/90">
              <Play className="w-8 h-8 ml-1 fill-white" />
            </div>
          </div>
        )}

        {/* Floating Double Tap Hearts */}
        {clickHearts.map(h => (
          <div
            key={h.id}
            className="absolute pointer-events-none z-30 transform -translate-x-1/2 -translate-y-1/2 animate-ping"
            style={{ left: h.x, top: h.y }}
          >
            <Heart className="w-20 h-20 text-red-500 fill-red-500 drop-shadow-xl" />
          </div>
        ))}

        {/* Audio Mute / Unmute Button at Top Corner */}
        <button
          onClick={() => setIsMuted(prev => !prev)}
          className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md flex items-center justify-center transition-colors"
          aria-label={isMuted ? 'Unmute video' : 'Mute video'}
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-cyan-400" />}
        </button>

        {/* Top Navigation Row: Back Arrow + Sound Pill */}
        <div className="absolute top-4 left-4 z-30 flex items-center gap-2">
          {onGoBack && (
            <button
              onClick={onGoBack}
              className="w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center transition-transform active:scale-90 shadow-md"
              aria-label="Back to previous page"
              title="Back to previous page"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div 
            onClick={() => onOpenSoundHub?.(activeReel.soundTitle, activeReel.soundArtist, activeReel.soundCover)}
            className="flex items-center gap-1.5 px-3 py-1 bg-black/40 hover:bg-black/70 backdrop-blur-md rounded-full text-[11px] text-white/90 font-medium cursor-pointer transition-colors"
            title="Open Glitch Audio Hub"
          >
            <Music className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span className="truncate max-w-[140px]">{activeReel.soundTitle}</span>
          </div>
        </div>

        {/* Vertical Swipe Hint Overlay (Desktop helper) */}
        <div className="hidden lg:flex flex-col gap-2 absolute -right-16 top-1/2 -translate-y-1/2 z-30">
          <button
            onClick={goToPrev}
            disabled={currentIndex === 0}
            className="w-11 h-11 rounded-full bg-slate-900 border border-slate-700 hover:border-cyan-400 text-white flex items-center justify-center disabled:opacity-30 disabled:hover:border-slate-700 transition-all active:scale-95 shadow-lg"
            title="Previous Spark (Up Arrow)"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <button
            onClick={goToNext}
            className="w-11 h-11 rounded-full bg-slate-900 border border-slate-700 hover:border-cyan-400 text-white flex items-center justify-center transition-all active:scale-95 shadow-lg"
            title="Next Spark (Down Arrow)"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* Right Action Bar (Signature Vertical Sparks Style) */}
        <div className="absolute right-3 bottom-20 z-30 flex flex-col items-center gap-4">
          
          {/* Creator Avatar with follow button */}
          <div className="relative mb-1">
            <div className="w-11 h-11 rounded-full p-[1.5px] bg-gradient-to-tr from-cyan-400 to-fuchsia-500">
              <img
                src={activeReel.author.avatar}
                alt={activeReel.author.name}
                className="w-full h-full rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <button
              onClick={() => onToggleFollow(activeReel.author.id)}
              className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full flex items-center justify-center text-white transition-transform duration-200 active:scale-90 ${
                isAuthorFollowed
                  ? 'bg-slate-700'
                  : 'bg-red-500 hover:bg-red-400'
              }`}
              title={isAuthorFollowed ? 'Following' : 'Follow'}
            >
              {isAuthorFollowed ? (
                <Check className="w-3 h-3 text-cyan-300" />
              ) : (
                <Plus className="w-3 h-3 stroke-[3]" />
              )}
            </button>
          </div>

          {/* Like Button */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => toggleLike(activeReel.id)}
              className={`w-11 h-11 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center transition-transform active:scale-125 ${
                activeReel.isLiked ? 'text-red-500' : 'text-white hover:text-red-400'
              }`}
              aria-label="Like Spark"
            >
              <Heart className={`w-6 h-6 ${activeReel.isLiked ? 'fill-red-500' : ''}`} />
            </button>
            <span className="text-[11px] font-semibold text-white mt-1 drop-shadow-md font-mono tabular-nums">
              {formatReelCount(activeReel.likesCount)}
            </span>
          </div>

          {/* Comment Button */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => onOpenComments(activeReel)}
              className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md text-white hover:text-cyan-400 flex items-center justify-center transition-colors"
              aria-label="Comments"
            >
              <MessageCircle className="w-6 h-6" />
            </button>
            <span className="text-[11px] font-semibold text-white mt-1 drop-shadow-md font-mono tabular-nums">
              {formatReelCount(activeReel.commentsCount)}
            </span>
          </div>

          {/* Bookmark Button */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => toggleSave(activeReel.id)}
              className={`w-11 h-11 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center transition-colors ${
                activeReel.isSaved ? 'text-amber-400' : 'text-white hover:text-amber-400'
              }`}
              aria-label="Bookmark Spark"
            >
              <Bookmark className={`w-6 h-6 ${activeReel.isSaved ? 'fill-amber-400' : ''}`} />
            </button>
            <span className="text-[11px] font-semibold text-white mt-1 drop-shadow-md font-mono tabular-nums">
              {activeReel.isSaved ? 'Saved' : 'Save'}
            </span>
          </div>

          {/* Share Button */}
          <div className="flex flex-col items-center">
            <button
              onClick={handleShare}
              className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md text-white hover:text-cyan-400 flex items-center justify-center transition-colors"
              aria-label="Share Spark"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <span className="text-[11px] font-semibold text-white mt-1 drop-shadow-md font-mono tabular-nums">
              {formatReelCount(activeReel.sharesCount)}
            </span>
          </div>

          {/* Duet / Remix Button */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => {
                setIsDuetMode(!isDuetMode);
                showToast(isDuetMode ? 'Exited Duet mode' : 'Duet / Remix mode activated! 🎬');
              }}
              className={`w-11 h-11 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center transition-all ${
                isDuetMode ? 'text-cyan-400 border border-cyan-400 shadow-lg shadow-cyan-400/20' : 'text-white hover:text-cyan-400'
              }`}
              aria-label="Duet / Remix Spark"
              title="Duet / Remix Spark"
            >
              <Layers className="w-5 h-5" />
            </button>
            <span className="text-[11px] font-semibold text-white mt-1 drop-shadow-md font-mono">
              Remix
            </span>
          </div>

          {/* Rotating Vinyl Disc Sound Attribution (Signature Sparks Audio) */}
          <div 
            onClick={() => onOpenSoundHub?.(activeReel.soundTitle, activeReel.soundArtist, activeReel.soundCover)}
            className="relative mt-2 cursor-pointer group"
            title="Open Glitch Audio Hub"
          >
            <div className={`w-11 h-11 rounded-full bg-gradient-to-tr from-slate-950 via-slate-800 to-slate-900 border-2 border-slate-700/80 group-hover:border-cyan-400 p-1 shadow-lg transition-colors ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`}>
              <img
                src={activeReel.soundCover}
                alt="Sound"
                className="w-full h-full rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Music note particles */}
            {isPlaying && (
              <span className="absolute -top-3 -right-1 text-cyan-400 text-xs animate-bounce pointer-events-none">
                ♪
              </span>
            )}
          </div>

        </div>

        {/* Bottom Left Info Scrim & Details */}
        <div className="absolute left-0 bottom-0 right-16 p-4 z-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-auto">
          
          {/* Creator handle */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="font-semibold text-white text-sm hover:underline cursor-pointer">
              @{activeReel.author.handle}
            </span>
            {activeReel.author.verified && (
              <span className="w-3.5 h-3.5 rounded-full bg-cyan-400 text-slate-950 text-[9px] flex items-center justify-center font-bold">
                ✓
              </span>
            )}
            <span className="text-slate-400 text-xs" aria-hidden="true">·</span>
            <span className="text-xs text-slate-400 font-mono">{activeReel.timestamp}</span>
          </div>

          {/* Caption */}
          <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">
            {activeReel.caption}
          </p>

          {/* Hashtags */}
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {activeReel.tags.map((tag) => (
              <span key={tag} className="text-xs text-cyan-300 font-medium hover:underline cursor-pointer">
                #{tag}
              </span>
            ))}
          </div>

          {/* Running Sound Marquee */}
          <div className="flex items-center gap-2 mt-2.5 text-xs text-slate-300">
            <Music className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <div className="overflow-hidden whitespace-nowrap max-w-[220px]">
              <span className="inline-block animate-[marquee_12s_linear_infinite]">
                {activeReel.soundTitle} · {activeReel.soundArtist}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Progress Bar Scrubber */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-30">
          <div
            className="h-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

      </div>
    </div>
  );
};
