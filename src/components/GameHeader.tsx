import React, { useState } from 'react';
import { soundEngine } from '../services/soundEngine';

interface GameHeaderProps {
  currentTab: 'arena' | 'select' | 'story' | 'dojo';
  onNavClick: (tab: 'arena' | 'select' | 'story' | 'dojo') => void;
  onQuickBattle: () => void;
  onOpenPricing: () => void;
  isPro?: boolean;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  currentTab,
  onNavClick,
  onQuickBattle,
  onOpenPricing,
  isPro = false,
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(soundEngine.getIsMuted());

  const handleToggleSound = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      soundEngine.playHit('light');
    }
  };

  return (
    <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark in display face */}
      <button
        onClick={() => onNavClick('select')}
        className="text-lg font-black tracking-tight text-white whitespace-nowrap shrink-0 hover:text-cyan-400 transition-colors"
      >
        Jujutsu Kaisen: Cursed Clash
      </button>

      {/* Zone 2: 4 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
        <button
          onClick={() => onNavClick('select')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'select' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Sorcerers
        </button>
        <button
          onClick={() => onNavClick('arena')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'arena' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Arena
        </button>
        <button
          onClick={() => onNavClick('story')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'story' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Story
        </button>
        <button
          onClick={() => onNavClick('dojo')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'dojo' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Dojo
        </button>
      </nav>

      {/* Zone 3: Actions + Kelviq Billing */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenPricing}
          className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
            isPro
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900'
              : 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/50 text-amber-300 hover:from-amber-500/30 hover:to-orange-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
          }`}
          title="Kelviq Billing & Subscription"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>{isPro ? 'Pro Active' : 'Upgrade ($9/mo)'}</span>
        </button>
        <button
          onClick={handleToggleSound}
          className="px-3 py-1.5 text-xs font-mono font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          {isMuted ? 'Audio: Muted' : 'Audio: Active'}
        </button>
        <button
          onClick={onQuickBattle}
          className="px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 rounded-lg shadow-sm active:scale-95 transition-all whitespace-nowrap shrink-0"
        >
          Quick Battle
        </button>
      </div>
    </header>
  );
};
