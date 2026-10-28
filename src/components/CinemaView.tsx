import React, { useState, useRef, useEffect } from 'react';
import { CinemaVideo, User, Comment } from '../types';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  ThumbsUp, 
  ThumbsDown, 
  Share2, 
  BookmarkPlus, 
  Download, 
  Bell, 
  Check, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare,
  Sparkles,
  ArrowLeft,
  Settings
} from 'lucide-react';

interface CinemaViewProps {
  videos: CinemaVideo[];
  currentUser: User;
  onToggleSubscribe?: (channelId: string) => void;
  subscribedChannelIds: Set<string>;
  onGoBack?: () => void;
}

export const CinemaView: React.FC<CinemaViewProps> = ({
  videos,
  currentUser,
  onToggleSubscribe,
  subscribedChannelIds,
  onGoBack
}) => {
  const [selectedVideo, setSelectedVideo] = useState<CinemaVideo | null>(null);
  const [localVideos, setLocalVideos] = useState<CinemaVideo[]>(videos);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [autoplayNext, setAutoplayNext] = useState(true);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Video player custom controls state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  // Comments state for active video
  const [commentInput, setCommentInput] = useState('');

  const categories = ['All', 'Tech & Hardware', 'Cinematic & Travel', 'Dance & Culture', 'Design & Code'];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSelectVideo = (video: CinemaVideo) => {
    setSelectedVideo(video);
    setIsPlaying(true);
    setCurrentTime(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  const handleTimeSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (videoRef.current) {
      videoRef.current.volume = v;
      setIsMuted(v === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
      videoRef.current.volume = volume || 0.5;
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const handleSpeedSelect = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current.requestFullscreen();
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleToggleLike = (video: CinemaVideo) => {
    const isLiked = !video.isLiked;
    const updated = {
      ...video,
      isLiked,
      isDisliked: false,
      likesCount: isLiked ? video.likesCount + 1 : video.likesCount - 1
    };
    setSelectedVideo(updated);
    setLocalVideos(prev => prev.map(v => v.id === video.id ? updated : v));
  };

  const handleToggleDislike = (video: CinemaVideo) => {
    const isDisliked = !video.isDisliked;
    const updated = {
      ...video,
      isDisliked,
      isLiked: false,
      likesCount: video.isLiked ? video.likesCount - 1 : video.likesCount
    };
    setSelectedVideo(updated);
    setLocalVideos(prev => prev.map(v => v.id === video.id ? updated : v));
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !selectedVideo) return;

    const newComment: Comment = {
      id: `ytc_${Date.now()}`,
      user: currentUser,
      text: commentInput.trim(),
      timestamp: 'Just now',
      likesCount: 0,
      isLiked: false
    };

    const updated = {
      ...selectedVideo,
      commentsCount: selectedVideo.commentsCount + 1,
      comments: [newComment, ...selectedVideo.comments]
    };

    setSelectedVideo(updated);
    setLocalVideos(prev => prev.map(v => v.id === selectedVideo.id ? updated : v));
    setCommentInput('');
    showToast('Comment published to Cinema thread!');
  };

  // Filtered videos for browse view
  const filteredVideos = localVideos.filter(v => {
    const matchesCategory = activeCategory === 'All' || v.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.channel.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-cyan-500/40 text-cyan-300 text-xs px-4 py-2.5 rounded-full shadow-lg backdrop-blur-md">
          {toastMessage}
        </div>
      )}

      {/* WATCH VIEW (When a video is selected) */}
      {selectedVideo ? (
        <div className="space-y-6">
          
          {/* Back button */}
          <button
            onClick={() => setSelectedVideo(null)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Cinema Browse</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Primary Video & Watch Details Column */}
            <div className={`space-y-4 ${isTheaterMode ? 'lg:col-span-12' : 'lg:col-span-8'}`}>
              
              {/* Custom 16:9 Video Player */}
              <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800/80 group">
                <video
                  ref={videoRef}
                  src={selectedVideo.videoUrl}
                  poster={selectedVideo.thumbnailUrl}
                  playsInline
                  autoPlay
                  onClick={togglePlayPause}
                  onTimeUpdate={(e) => {
                    const v = e.currentTarget;
                    setCurrentTime(v.currentTime);
                    setDuration(v.duration || 0);
                  }}
                  onEnded={() => {
                    if (autoplayNext) {
                      const next = localVideos.find(v => v.id !== selectedVideo.id);
                      if (next) handleSelectVideo(next);
                    }
                  }}
                  className="w-full h-full object-cover cursor-pointer"
                />

                {/* Video Controls Bar Overlay */}
                <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  
                  {/* Timeline Scrubber */}
                  <div className="relative mb-3 flex items-center">
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      value={currentTime}
                      onChange={handleTimeSeek}
                      className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500 hover:h-2 transition-all"
                    />
                  </div>

                  {/* Buttons & Indicators Row */}
                  <div className="flex items-center justify-between text-white text-xs">
                    
                    <div className="flex items-center gap-4">
                      {/* Play/Pause */}
                      <button
                        onClick={togglePlayPause}
                        className="hover:text-red-400 transition-colors p-1"
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                      >
                        {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
                      </button>

                      {/* Volume Slider */}
                      <div className="flex items-center gap-2 group/vol">
                        <button onClick={toggleMute} aria-label={isMuted ? 'Unmute' : 'Mute'}>
                          {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
                        </button>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.05}
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          className="w-16 h-1 bg-slate-700 rounded appearance-none cursor-pointer accent-white"
                        />
                      </div>

                      {/* Timestamp */}
                      <span className="font-mono text-slate-300">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Speed Picker */}
                      <div className="relative">
                        <button
                          onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                          className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded font-mono text-[11px] transition-colors"
                        >
                          {playbackSpeed}x
                        </button>
                        {showSpeedMenu && (
                          <div className="absolute bottom-8 right-0 bg-[#0d0f17] border border-slate-700 rounded-lg py-1 shadow-xl z-30 w-20 text-center">
                            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                              <button
                                key={s}
                                onClick={() => handleSpeedSelect(s)}
                                className={`block w-full py-1 text-xs hover:bg-slate-800 ${
                                  playbackSpeed === s ? 'text-red-400 font-bold' : 'text-slate-300'
                                }`}
                              >
                                {s}x
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Theater Mode Toggle */}
                      <button
                        onClick={() => setIsTheaterMode(!isTheaterMode)}
                        className="hover:text-red-400 transition-colors hidden md:block"
                        title={isTheaterMode ? 'Default View' : 'Theater View'}
                      >
                        <div className={`w-4 h-3 border-2 border-white rounded-[2px] ${isTheaterMode ? 'bg-white' : ''}`} />
                      </button>

                      {/* Fullscreen */}
                      <button
                        onClick={toggleFullscreen}
                        className="hover:text-red-400 transition-colors p-1"
                        aria-label="Fullscreen"
                      >
                        <Maximize className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                </div>

              </div>

              {/* Title & Metadata */}
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-snug">
                  {selectedVideo.title}
                </h1>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-mono">
                  <span>{selectedVideo.viewsCount} views</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedVideo.uploadedAt}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-cyan-400 font-sans font-medium">{selectedVideo.category}</span>
                </div>
              </div>

              {/* Channel Row & Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-y border-slate-800/80">
                
                {/* Channel Details */}
                <div className="flex items-center gap-3">
                  <img
                    src={selectedVideo.channel.avatar}
                    alt={selectedVideo.channel.name}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-700"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <p className="text-sm font-semibold text-white flex items-center gap-1">
                      {selectedVideo.channel.name}
                      {selectedVideo.channel.verified && (
                        <span className="w-3.5 h-3.5 rounded-full bg-cyan-400 text-slate-950 text-[9px] flex items-center justify-center font-bold">
                          ✓
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-400 font-mono">
                      {selectedVideo.channel.subscribersCount} subscribers
                    </p>
                  </div>

                  {/* Subscribe Button */}
                  <button
                    onClick={() => onToggleSubscribe?.(selectedVideo.channel.id)}
                    className={`ml-3 px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      subscribedChannelIds.has(selectedVideo.channel.id)
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'bg-white hover:bg-slate-200 text-slate-950'
                    }`}
                  >
                    {subscribedChannelIds.has(selectedVideo.channel.id) ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Subscribed</span>
                        <Bell className="w-3 h-3 text-slate-400 ml-0.5" />
                      </>
                    ) : (
                      <span>Subscribe</span>
                    )}
                  </button>
                </div>

                {/* Actions: Like, Dislike, Share, Save */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Like/Dislike Segmented Group */}
                  <div className="flex items-center bg-slate-800/80 border border-slate-700/60 rounded-full overflow-hidden">
                    <button
                      onClick={() => handleToggleLike(selectedVideo)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium transition-colors hover:bg-slate-700/80 ${
                        selectedVideo.isLiked ? 'text-red-400 font-semibold' : 'text-slate-300'
                      }`}
                      aria-label="Like video"
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${selectedVideo.isLiked ? 'fill-red-400' : ''}`} />
                      <span className="font-mono tabular-nums">{selectedVideo.likesCount.toLocaleString()}</span>
                    </button>
                    <div className="w-[1px] h-4 bg-slate-700" />
                    <button
                      onClick={() => handleToggleDislike(selectedVideo)}
                      className={`px-3 py-1.5 text-xs hover:bg-slate-700/80 transition-colors ${
                        selectedVideo.isDisliked ? 'text-red-400' : 'text-slate-400'
                      }`}
                      aria-label="Dislike video"
                    >
                      <ThumbsDown className={`w-3.5 h-3.5 ${selectedVideo.isDisliked ? 'fill-red-400' : ''}`} />
                    </button>
                  </div>

                  {/* Share */}
                  <button
                    onClick={() => {
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(`https://glitch.network/watch/${selectedVideo.id}`);
                      }
                      showToast('Video link copied to clipboard!');
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700/80 text-xs font-medium text-slate-300 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </button>

                  {/* Save to Playlist */}
                  <button
                    onClick={() => showToast('Saved to your "Watch Later" playlist')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700/80 text-xs font-medium text-slate-300 transition-colors"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>

                  {/* Download */}
                  <button
                    onClick={() => showToast('Downloading offline stream in 1080p...')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700/80 text-xs font-medium text-slate-300 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>

              </div>

              {/* Description Box */}
              <div className="bg-[#0d0f17] border border-slate-800/80 rounded-2xl p-4 text-xs text-slate-300 leading-relaxed space-y-2">
                <div className={showFullDesc ? '' : 'line-clamp-3'}>
                  <p className="whitespace-pre-line">{selectedVideo.description}</p>
                </div>
                <button
                  onClick={() => setShowFullDesc(!showFullDesc)}
                  className="font-semibold text-white hover:text-cyan-400 flex items-center gap-1 pt-1"
                >
                  {showFullDesc ? (
                    <>Show less <ChevronUp className="w-3.5 h-3.5" /></>
                  ) : (
                    <>Show more <ChevronDown className="w-3.5 h-3.5" /></>
                  )}
                </button>
              </div>

              {/* Comments Section */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-white font-['Outfit']">
                    {selectedVideo.commentsCount.toLocaleString()} Comments
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">Sort by Top</span>
                </div>

                {/* Add Comment Input */}
                <form onSubmit={handleAddComment} className="flex items-start gap-3">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-9 h-9 rounded-full object-cover shrink-0 mt-0.5"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="Add a comment on Glitch Cinema..."
                      className="w-full bg-slate-900 border-b border-slate-700 focus:border-cyan-400 px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none transition-colors"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setCommentInput('')}
                        className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!commentInput.trim()}
                        className="px-4 py-1.5 text-xs font-semibold bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:hover:bg-red-600 text-white rounded-full transition-colors"
                      >
                        Comment
                      </button>
                    </div>
                  </div>
                </form>

                {/* Comments List */}
                <div className="space-y-4 pt-2">
                  {selectedVideo.comments.map((c) => (
                    <div key={c.id} className="flex items-start gap-3">
                      <img
                        src={c.user.avatar}
                        alt={c.user.name}
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white">
                            @{c.user.handle}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {c.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                          {c.text}
                        </p>
                        {c.creatorLiked && (
                          <div className="flex items-center gap-1 mt-1 text-[11px] text-red-400 font-medium">
                            <span className="w-3 h-3 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-[9px]">
                              ❤️
                            </span>
                            <span>Hearted by creator</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

              </div>

            </div>

            {/* Related Videos / Up Next Sidebar */}
            <aside className={`space-y-4 ${isTheaterMode ? 'lg:col-span-12' : 'lg:col-span-4'}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase font-['Outfit']">
                  Up Next
                </span>
                <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                  <span>Autoplay</span>
                  <input
                    type="checkbox"
                    checked={autoplayNext}
                    onChange={(e) => setAutoplayNext(e.target.checked)}
                    className="accent-red-500 rounded cursor-pointer"
                  />
                </label>
              </div>

              <div className="space-y-3">
                {localVideos.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => handleSelectVideo(video)}
                    className={`flex items-start gap-3 p-2 rounded-xl cursor-pointer transition-colors ${
                      video.id === selectedVideo.id
                        ? 'bg-slate-800/80 ring-1 ring-red-500/50'
                        : 'hover:bg-slate-800/50'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-36 aspect-video bg-black rounded-lg overflow-hidden shrink-0">
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute bottom-1 right-1 bg-black/80 text-white font-mono text-[10px] px-1 py-0.5 rounded">
                        {video.duration}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-semibold text-white line-clamp-2 leading-snug">
                        {video.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 truncate">
                        {video.channel.name}
                      </p>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                        <span>{video.viewsCount}</span>
                        <span aria-hidden="true">·</span>
                        <span>{video.uploadedAt}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </aside>

          </div>

        </div>
      ) : (
        /* BROWSE GRID VIEW */
        <div className="space-y-6">
          
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

          {/* Search & Category Filter Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Category Segmented Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto p-1 bg-slate-900/80 border border-slate-800 rounded-xl">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                    activeCategory === cat
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Video Search Input */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search videos & creators..."
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-red-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

          </div>

          {/* Videos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <article
                key={video.id}
                onClick={() => handleSelectVideo(video)}
                className="bg-[#0d0f17] border border-slate-800/80 rounded-2xl overflow-hidden cursor-pointer group hover:border-slate-700 transition-all duration-200 hover:-translate-y-0.5"
              >
                {/* 16:9 Thumbnail Frame */}
                <div className="relative aspect-video bg-black overflow-hidden">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  {/* Duration Badge */}
                  <span className="absolute bottom-2 right-2 bg-black/85 text-white font-mono text-xs px-1.5 py-0.5 rounded font-medium">
                    {video.duration}
                  </span>

                  {/* Play on hover cue */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 ml-0.5 fill-white" />
                    </div>
                  </div>
                </div>

                {/* Video Info Header */}
                <div className="p-4 flex items-start gap-3">
                  <img
                    src={video.channel.avatar}
                    alt={video.channel.name}
                    className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-700 shrink-0 mt-0.5"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-white line-clamp-2 leading-snug group-hover:text-red-400 transition-colors">
                      {video.title}
                    </h3>
                    
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 truncate">
                      {video.channel.name}
                      {video.channel.verified && (
                        <span className="w-3 h-3 rounded-full bg-cyan-400 text-slate-950 text-[8px] flex items-center justify-center font-bold">
                          ✓
                        </span>
                      )}
                    </p>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono mt-0.5">
                      <span>{video.viewsCount} views</span>
                      <span aria-hidden="true">·</span>
                      <span>{video.uploadedAt}</span>
                    </div>
                  </div>
                </div>

              </article>
            ))}
          </div>

        </div>
      )}

    </div>
  );
};
