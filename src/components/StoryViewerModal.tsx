import React, { useState, useEffect, useRef } from 'react';
import { UserStory } from '../types';
import { X, ChevronLeft, ChevronRight, Heart, Send, Sparkles } from 'lucide-react';

interface StoryViewerModalProps {
  stories: UserStory[];
  initialUserIndex: number;
  onClose: () => void;
  onStoryViewed?: (userId: string) => void;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  stories,
  initialUserIndex,
  onClose,
  onStoryViewed
}) => {
  const [currentUserIndex, setCurrentUserIndex] = useState(initialUserIndex);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [reactionBurst, setReactionBurst] = useState<string | null>(null);

  const activeStory = stories[currentUserIndex];
  const activeSlide = activeStory?.items[currentSlideIndex];

  const durationMs = (activeSlide?.durationSeconds || 5) * 1000;
  const intervalStepMs = 50;

  useEffect(() => {
    if (activeStory) {
      onStoryViewed?.(activeStory.userId);
    }
  }, [currentUserIndex, activeStory, onStoryViewed]);

  // Timer loop for story progress
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (intervalStepMs / durationMs) * 100;
        if (next >= 100) {
          handleNextSlide();
          return 0;
        }
        return next;
      });
    }, intervalStepMs);

    return () => clearInterval(timer);
  }, [isPaused, durationMs, currentSlideIndex, currentUserIndex]);

  const handleNextSlide = () => {
    if (!activeStory) return;
    if (currentSlideIndex < activeStory.items.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
      setProgress(0);
    } else if (currentUserIndex < stories.length - 1) {
      setCurrentUserIndex((prev) => prev + 1);
      setCurrentSlideIndex(0);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
      setProgress(0);
    } else if (currentUserIndex > 0) {
      const prevUser = currentUserIndex - 1;
      setCurrentUserIndex(prevUser);
      setCurrentSlideIndex(stories[prevUser].items.length - 1);
      setProgress(0);
    }
  };

  const sendReaction = (emoji: string) => {
    setReactionBurst(emoji);
    setTimeout(() => setReactionBurst(null), 1200);
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    sendReaction('💌');
    setCommentText('');
  };

  if (!activeStory || !activeSlide) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-0 md:p-4 select-none">
      
      {/* Background close click */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white flex items-center justify-center transition-colors"
        aria-label="Close stories"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Desktop Navigation Chevrons */}
      {currentUserIndex > 0 && (
        <button
          onClick={handlePrevSlide}
          className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center backdrop-blur-md transition-transform active:scale-95"
          aria-label="Previous story"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {currentUserIndex < stories.length - 1 && (
        <button
          onClick={handleNextSlide}
          className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center backdrop-blur-md transition-transform active:scale-95"
          aria-label="Next story"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Main Story Container (9:16 aspect ratio on mobile & desktop) */}
      <div 
        className="relative w-full max-w-sm h-full md:h-[88vh] md:max-h-[820px] bg-slate-900 md:rounded-2xl overflow-hidden flex flex-col justify-between shadow-2xl border border-slate-800/50"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        
        {/* Background media */}
        <div className="absolute inset-0 z-0">
          <img
            src={activeSlide.mediaUrl}
            alt={activeSlide.caption || 'Story'}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          {/* Subtle gradient scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none" />
        </div>

        {/* Reaction burst animation overlay */}
        {reactionBurst && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none animate-bounce text-6xl">
            {reactionBurst}
          </div>
        )}

        {/* Top Header & Progress bars */}
        <div className="relative z-20 p-3 pt-4 space-y-2">
          {/* Segmented Progress Bars */}
          <div className="flex items-center gap-1.5 w-full">
            {activeStory.items.map((item, idx) => {
              let fillWidth = 0;
              if (idx < currentSlideIndex) fillWidth = 100;
              else if (idx === currentSlideIndex) fillWidth = progress;

              return (
                <div key={item.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-75 ease-linear"
                    style={{ width: `${fillWidth}%` }}
                  />
                </div>
              );
            })}
          </div>

          {/* User info bar */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2.5">
              <img
                src={activeStory.user.avatar}
                alt={activeStory.user.name}
                className="w-9 h-9 rounded-full object-cover border-2 border-fuchsia-500"
                referrerPolicy="no-referrer"
              />
              <div>
                <p className="text-sm font-semibold text-white leading-tight flex items-center gap-1">
                  {activeStory.user.handle}
                  {activeStory.user.verified && (
                    <span className="w-3.5 h-3.5 rounded-full bg-cyan-400 text-black text-[9px] flex items-center justify-center font-bold">
                      ✓
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-300 font-mono">{activeSlide.timestamp}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="md:hidden text-white/80 hover:text-white p-1"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tap zones for slide navigation */}
        <div className="absolute inset-x-0 top-20 bottom-24 z-10 flex">
          <div
            className="w-1/3 h-full cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handlePrevSlide();
            }}
          />
          <div
            className="w-2/3 h-full cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleNextSlide();
            }}
          />
        </div>

        {/* Bottom Interactive Area: Stickers, Caption & Comment Input */}
        <div className="relative z-20 p-4 space-y-3 pb-6 md:pb-4">
          
          {/* Interactive Story Stickers Layer */}
          {activeSlide.stickers && activeSlide.stickers.length > 0 && (
            <div className="space-y-2 pointer-events-auto">
              {activeSlide.stickers.map((sticker, sIdx) => {
                if (sticker.type === 'poll') {
                  const totalVotes = (sticker.options || []).reduce((acc, opt) => acc + opt.votes, 0);
                  return (
                    <div key={sIdx} className="bg-black/80 backdrop-blur-md rounded-2xl p-3 border border-fuchsia-500/40 shadow-xl">
                      <p className="text-xs font-bold text-white text-center mb-2 font-['Outfit']">
                        📊 {sticker.question}
                      </p>
                      <div className="space-y-1.5">
                        {sticker.options?.map((opt, oIdx) => {
                          const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 50;
                          return (
                            <button
                              key={oIdx}
                              onClick={(e) => {
                                e.stopPropagation();
                                sendReaction('⚡');
                              }}
                              className="relative w-full overflow-hidden rounded-xl border border-white/20 bg-white/10 p-2 text-left transition-all hover:border-cyan-400 group"
                            >
                              <div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-fuchsia-600/40 to-cyan-500/40 rounded-xl transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                              <div className="relative z-10 flex items-center justify-between text-xs font-medium text-white">
                                <span>{opt.label}</span>
                                <span className="font-mono text-cyan-300 font-bold">{pct}%</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                if (sticker.type === 'countdown') {
                  return (
                    <div key={sIdx} className="bg-gradient-to-r from-rose-950/80 to-purple-950/80 backdrop-blur-md rounded-2xl p-3 border border-rose-500/40 text-center shadow-xl">
                      <p className="text-[11px] font-bold text-rose-300 uppercase tracking-wider mb-1">
                        ⏳ {sticker.question}
                      </p>
                      <div className="flex items-center justify-center gap-2 font-mono text-lg font-extrabold text-white">
                        <span className="px-2 py-0.5 rounded bg-black/60 border border-white/10">02</span>:
                        <span className="px-2 py-0.5 rounded bg-black/60 border border-white/10">45</span>:
                        <span className="px-2 py-0.5 rounded bg-black/60 border border-white/10">18</span>
                      </div>
                    </div>
                  );
                }

                if (sticker.type === 'ama') {
                  return (
                    <div key={sIdx} className="bg-black/80 backdrop-blur-md rounded-2xl p-3 border border-cyan-500/40 shadow-xl">
                      <p className="text-xs font-bold text-cyan-300 text-center mb-1.5 font-['Outfit']">
                        💬 {sticker.question}
                      </p>
                      <div className="flex items-center gap-1.5 bg-white/10 rounded-xl px-2.5 py-1.5 border border-white/10">
                        <input
                          type="text"
                          placeholder="Type an answer or question..."
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            sendReaction('💌');
                          }}
                          className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 px-1"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  );
                }

                if (sticker.type === 'soundtrack') {
                  return (
                    <div key={sIdx} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-cyan-400/40 text-xs text-white shadow-lg">
                      <span className="text-cyan-400 animate-spin">💿</span>
                      <span className="font-semibold">{sticker.trackName}</span>
                      <span className="text-slate-400">• {sticker.artistName}</span>
                    </div>
                  );
                }

                return null;
              })}
            </div>
          )}

          {activeSlide.caption && (
            <p className="text-sm font-medium text-white drop-shadow-md text-balance bg-black/40 backdrop-blur-sm p-2.5 rounded-lg border border-white/10">
              {activeSlide.caption}
            </p>
          )}

          {/* Quick Reaction Emojis */}
          <div className="flex items-center justify-between px-1">
            {['🔥', '❤️', '⚡', '👏', '😮', '🚀'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => sendReaction(emoji)}
                className="text-xl hover:scale-125 active:scale-95 transition-transform p-1"
                aria-label={`React with ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Story Reply Form */}
          <form onSubmit={handleSendComment} className="flex items-center gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={`Reply to ${activeStory.user.handle}...`}
              className="flex-1 bg-white/15 border border-white/20 rounded-full px-4 py-2 text-xs text-white placeholder-slate-300 focus:outline-none focus:border-cyan-400 backdrop-blur-md"
            />
            <button
              type="submit"
              className="w-9 h-9 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center transition-colors shrink-0"
              aria-label="Send reply"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
