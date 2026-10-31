import React from 'react';
import { useSupabaseAuth } from '../auth/supabaseAuth';
import { PlatformMode, User } from '../types';
import {
  Flame,
  Home,
  Compass,
  Radio,
  MessageCircle,
  Bell,
  Plus,
  Crown,
  LogOut,
} from 'lucide-react';

interface HeaderProps {
  currentMode: PlatformMode;
  onSelectMode: (mode: PlatformMode) => void;
  currentUser: User;
  onOpenCreate: () => void;
  onOpenNotifications: () => void;
  onOpenPricing: () => void;
  isPro?: boolean;
  unreadNotificationsCount?: number;
  unreadMessagesCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  currentUser,
  onOpenCreate,
  onOpenNotifications,
  onOpenPricing,
  isPro = false,
  unreadNotificationsCount = 3,
  unreadMessagesCount = 2,
}) => {
  const auth = useSupabaseAuth();
  return (
    <header className="sticky top-0 z-40 bg-[#07080d]/95 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-4 md:px-6 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">

        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          <button
            onClick={() => onSelectMode('sparks')}
            className="flex items-center gap-2 group text-left min-w-0"
            aria-label="Glitch home"
          >
            <img
              src="/glitch-mark.svg"
              alt=""
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover shadow-[0_0_18px_rgba(6,182,212,0.22)] group-hover:scale-105 transition-transform shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white group-hover:text-cyan-300 transition-colors font-['Plus_Jakarta_Sans']">
                  GLITCH
                </span>
                <span className="hidden min-[380px]:inline text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30 font-mono font-bold whitespace-nowrap">
                  CREATOR STUDIO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Short Videos · Live · Creators
              </p>
            </div>
          </button>
        </div>

        {/* Primary navigation tabs for desktop and tablet */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 border border-slate-800 rounded-xl p-1 text-xs font-semibold">
          <button
            onClick={() => onSelectMode('sparks')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              currentMode === 'sparks'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Sparks (For You)</span>
          </button>

          <button
            onClick={() => onSelectMode('feed')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              currentMode === 'feed'
                ? 'bg-fuchsia-500 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Following Feed</span>
          </button>

          <button
            onClick={() => onSelectMode('live')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all relative ${
              currentMode === 'live'
                ? 'bg-red-500 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            <span>LIVE</span>
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping absolute top-1.5 right-1.5" />
          </button>

          <button
            onClick={() => onSelectMode('explore')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              currentMode === 'explore'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Explore</span>
          </button>
        </nav>

        {/* Compact actions remain usable on narrow phones. */}
        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">

          <button
            onClick={onOpenCreate}
            className="px-2 sm:px-3.5 py-2 sm:py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-pink-500 hover:opacity-90 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(236,72,153,0.3)] transition-all active:scale-95"
            title="Create & Upload Video"
            aria-label="Create and upload"
          >
            <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
            <span className="hidden sm:inline">Upload</span>
          </button>

          <button
            onClick={onOpenPricing}
            className={`p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all border ${
              isPro
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                : 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-300 hover:from-amber-500/30'
            }`}
            title="Kelviq Pro Pass"
            aria-label={isPro ? 'Pro subscription active' : 'Get Pro'}
          >
            <Crown className={`w-3.5 h-3.5 ${isPro ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span className="hidden md:inline">{isPro ? 'Pro Active' : 'Get Pro ($9)'}</span>
          </button>

          <button
            onClick={() => onSelectMode('messages')}
            className={`relative p-2 rounded-xl border transition-colors ${
              currentMode === 'messages'
                ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Direct Messages"
            aria-label={`Direct messages${unreadMessagesCount > 0 ? `, ${unreadMessagesCount} unread` : ''}`}
          >
            <MessageCircle className="w-4 h-4" />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-cyan-500 text-[10px] font-bold text-slate-950 flex items-center justify-center">
                {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Activity Notifications"
            aria-label={`Notifications${unreadNotificationsCount > 0 ? `, ${unreadNotificationsCount} unread` : ''}`}
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-pink-500 text-[10px] font-bold text-white flex items-center justify-center">
                {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => { void auth.signOut(); }}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 p-2 sm:px-2 sm:py-1.5 text-[10px] font-semibold text-slate-300 hover:border-slate-500 hover:text-white"
            title={auth.user?.email || 'Sign out'}
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>

          <button
            onClick={() => onSelectMode('profile')}
            className={`flex items-center gap-2 p-0.5 rounded-full ring-2 transition-all ${
              currentMode === 'profile' ? 'ring-cyan-400' : 'ring-slate-800 hover:ring-slate-700'
            }`}
            title="View Profile"
            aria-label="View profile"
          >
            <img
              src={currentUser.avatar}
              alt=""
              className="w-8 h-8 rounded-full object-cover"
            />
          </button>

        </div>
      </div>
    </header>
  );
};
