import React, { useState } from 'react';
import { GlitchSound, SparkReel } from '../types';
import { X, Play, Pause, Bookmark, Sparkles, Music, Share2, Disc3 } from 'lucide-react';

interface SoundHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  sound: GlitchSound | null;
  sparks: SparkReel[];
  onSelectSpark: (spark: SparkReel) => void;
  onUseSoundInStudio: (sound: GlitchSound) => void;
}

export const SoundHubModal: React.FC<SoundHubModalProps> = ({
  isOpen,
  onClose,
  sound,
  sparks,
  onSelectSpark,
  onUseSoundInStudio
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !sound) return null;

  const relevantSparks = sparks.filter(
    (s) => s.soundTitle.toLowerCase().includes(sound.title.toLowerCase()) || sound.title.includes(s.soundTitle)
  );
  const displaySparks = relevantSparks.length > 0 ? relevantSparks : sparks.slice(0, 4);

  const handleShare = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="w-full max-w-lg bg-[#0d0f17] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Disc3 className={`w-5 h-5 text-cyan-400 ${isPlaying ? 'animate-spin' : ''}`} />
            <h2 className="text-sm font-bold text-white font-['Outfit']">Glitch Audio Hub</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sound Card Details */}
        <div className="p-5 flex items-center gap-4 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border-b border-slate-800">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-cyan-500/30 shrink-0 group">
            <img
              src={sound.coverUrl}
              alt={sound.title}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"
            >
              {isPlaying ? <Pause className="w-8 h-8 fill-white" /> : <Play className="w-8 h-8 fill-white pl-1" />}
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-white truncate">{sound.title}</h3>
            <p className="text-xs text-cyan-400 font-semibold truncate">{sound.artist}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
              <span className="font-mono text-white font-bold">{sound.usageCount} Sparks</span>
              <span>•</span>
              <span className="font-mono">{sound.duration}</span>
              <span>•</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                {sound.category}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-2">
          <button
            onClick={() => onUseSoundInStudio(sound)}
            className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-fuchsia-600 hover:brightness-110 text-white flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
          >
            <Music className="w-4 h-4" />
            <span>Use this Sound</span>
          </button>

          <button
            onClick={() => setIsSaved(!isSaved)}
            className={`p-2.5 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-semibold ${
              isSaved
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:text-white'
            }`}
            title="Save sound"
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-400' : ''}`} />
            <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          <button
            onClick={handleShare}
            className={`p-2.5 rounded-xl border transition-all ${
              copied
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700/60'
            }`}
            title="Share sound"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Sparks Using this Sound Grid */}
        <div className="p-4 flex-1 overflow-y-auto max-h-72">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sparks using this track</span>
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {displaySparks.map((spark) => (
              <div
                key={spark.id}
                onClick={() => {
                  onSelectSpark(spark);
                  onClose();
                }}
                className="group relative aspect-[9/14] rounded-xl overflow-hidden cursor-pointer border border-slate-800 hover:border-cyan-400/60 transition-all"
              >
                <img
                  src={spark.posterUrl}
                  alt={spark.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2">
                  <span className="text-[10px] font-bold text-white truncate">
                    @{spark.author.handle}
                  </span>
                  <span className="text-[9px] text-slate-300">
                    {spark.likesCount.toLocaleString()} likes
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
