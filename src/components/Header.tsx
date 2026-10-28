import React from 'react';
import { PlatformMode, User } from '../types';
import { Sparkles, Compass, MessageCircle, PlaySquare, Plus, Bell, Flame, ArrowLeft, Radio, Zap } from 'lucide-react';

interface HeaderProps {
  currentMode: PlatformMode;
  onSelectMode: (mode: PlatformMode) => void;
  currentUser: User;
  onOpenCreate: () => void;
  unreadCount?: number;
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
  onOpenWallet?: () => void;
  canGoBack?: boolean;
  onGoBack?: () => void;
  previousModeLabel?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  currentUser,
  onOpenCreate,
  unreadCount = 1,
  unreadNotificationsCount = 3,
  onOpenNotifications,
  onOpenWallet,
  canGoBack = false,
  onGoBack,
  previousModeLabel
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#090a0f]/95 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 md:gap-8">
        
        {/* Zone 1: Back Navigation Arrow + Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          {canGoBack && onGoBack && (
            <button
              onClick={onGoBack}
              className="flex items-center gap-1.5 p-1.5 md:px-2.5 md:py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/60 shadow-sm transition-all duration-150 active:scale-95 group shrink-0"
              title={`Back to ${previousModeLabel || 'previous page'}`}
              aria-label="Back to previous page"
            >
              <ArrowLeft className="w-4 h-4 text-cyan-400 group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline text-xs font-semibold capitalize text-slate-300 group-hover:text-white">
                Back
              </span>
            </button>
          )}

          <div 
            onClick={() => onSelectMode('feed')}
            className="flex items-center gap-2 cursor-pointer select-none shrink-0 group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 via-indigo-500 to-fuchsia-500 p-[1.5px] transition-transform duration-200 group-hover:scale-105">
              <div className="w-full h-full bg-[#090a0f] rounded-[6px] flex items-center justify-center">
                <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 to-fuchsia-400 text-base tracking-tighter">
                  G
                </span>
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight text-white whitespace-nowrap shrink-0 font-['Outfit'] flex items-center gap-1.5">
              GLITCH
              <span className="text-[10px] font-mono font-medium text-cyan-400/80 tracking-widest uppercase">
                ONE
              </span>
            </span>
          </div>
        </div>

        {/* Zone 2: 4-5 clean, single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <button
            onClick={() => onSelectMode('feed')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 relative ${
              currentMode === 'feed'
                ? 'text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Feed
            {currentMode === 'feed' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-fuchsia-500 to-cyan-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onSelectMode('sparks')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 relative flex items-center gap-1.5 ${
              currentMode === 'sparks'
                ? 'text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-fuchsia-400" />
            Sparks
            {currentMode === 'sparks' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-fuchsia-500 to-cyan-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onSelectMode('tube')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 relative flex items-center gap-1.5 ${
              currentMode === 'tube'
                ? 'text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PlaySquare className="w-3.5 h-3.5 text-red-400" />
            Watch
            {currentMode === 'tube' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-fuchsia-500 to-cyan-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onSelectMode('live')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 relative flex items-center gap-1.5 ${
              currentMode === 'live'
                ? 'text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            Live
            {currentMode === 'live' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-rose-500 to-amber-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onSelectMode('explore')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 relative flex items-center gap-1.5 ${
              currentMode === 'explore'
                ? 'text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Explore
            {currentMode === 'explore' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-fuchsia-500 to-cyan-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onSelectMode('messages')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 relative flex items-center gap-1.5 ${
              currentMode === 'messages'
                ? 'text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Direct
            {unreadCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
            )}
            {currentMode === 'messages' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-fuchsia-500 to-cyan-500 rounded-full" />
            )}
          </button>
        </nav>

        {/* Zone 3: Wallet + Notifications + Create + Profile */}
        <div className="flex items-center gap-2 md:gap-2.5 shrink-0">
          
          {/* Glitch Sparks Wallet Pill */}
          <button
            onClick={onOpenWallet}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold transition-all active:scale-95"
            title="Glitch Sparks Virtual Wallet"
          >
            <Zap className="w-3.5 h-3.5 fill-amber-400" />
            <span className="font-mono">{(currentUser.walletSparks ?? 2850).toLocaleString()}</span>
          </button>

          {/* Activity Center Bell Button */}
          <button
            onClick={onOpenNotifications}
            className="relative p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            aria-label="Activity Center"
            title="Activity Center"
          >
            <Bell className="w-4 h-4 text-slate-300" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 text-slate-950 font-mono text-[9px] font-bold flex items-center justify-center ring-2 ring-[#090a0f]">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Mobile Direct icon shortcut */}
          <button
            onClick={() => onSelectMode('messages')}
            className="md:hidden relative p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            aria-label="Direct Messages"
          >
            <MessageCircle className="w-4 h-4 text-cyan-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-[#090a0f]" />
            )}
          </button>

          <button
            onClick={onOpenCreate}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-fuchsia-600 to-cyan-600 hover:from-fuchsia-500 hover:to-cyan-500 rounded-lg shadow-sm transition-all duration-200 hover:shadow-cyan-500/20 whitespace-nowrap active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Create</span>
          </button>

          <button
            onClick={() => onSelectMode('profile')}
            className={`relative rounded-full p-0.5 transition-transform duration-200 hover:scale-105 ${
              currentMode === 'profile'
                ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#090a0f]'
                : 'hover:ring-1 hover:ring-slate-600'
            }`}
            title="Profile"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          </button>
        </div>

      </div>
    </header>
  );
};
