import React from 'react';
import { PlatformMode, User } from '../types';
import { Home, Flame, PlaySquare, MessageCircle, User as UserIcon } from 'lucide-react';

interface BottomNavProps {
  currentMode: PlatformMode;
  onSelectMode: (mode: PlatformMode) => void;
  onOpenCreate: () => void;
  currentUser: User;
  unreadCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentMode,
  onSelectMode,
  currentUser,
  unreadCount = 2
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070b10]/95 backdrop-blur-lg border-t border-[#1c303b] px-2 py-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))] flex items-center justify-around">
      <button
        onClick={() => onSelectMode('feed')}
        className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] px-2 transition-colors ${
          currentMode === 'feed' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
        }`}
        aria-label="Feed"
      >
        <Home className={`w-5 h-5 ${currentMode === 'feed' ? 'stroke-[2.5] text-fuchsia-400' : ''}`} />
        <span className="text-[10px] font-medium mt-1">Feed</span>
      </button>

      <button
        onClick={() => onSelectMode('sparks')}
        className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] px-2 transition-colors ${
          currentMode === 'sparks' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
        }`}
        aria-label="Sparks"
      >
        <Flame className={`w-5 h-5 ${currentMode === 'sparks' ? 'stroke-[2.5] text-cyan-400' : ''}`} />
        <span className="text-[10px] font-medium mt-1">Sparks</span>
      </button>

      {/* Direct Messages Tab with Unread Badge */}
      <button
        onClick={() => onSelectMode('messages')}
        className={`relative flex flex-col items-center justify-center min-h-[44px] min-w-[44px] px-2 transition-colors ${
          currentMode === 'messages' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
        }`}
        aria-label="Direct Messages"
      >
        <div className="relative">
          <MessageCircle className={`w-5 h-5 ${currentMode === 'messages' ? 'stroke-[2.5] text-cyan-400' : ''}`} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 ring-2 ring-[#070b10]" />
          )}
        </div>
        <span className="text-[10px] font-medium mt-1">Direct</span>
      </button>

      <button
        onClick={() => onSelectMode('tube')}
        className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] px-2 transition-colors ${
          currentMode === 'tube' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
        }`}
        aria-label="Watch"
      >
        <PlaySquare className={`w-5 h-5 ${currentMode === 'tube' ? 'stroke-[2.5] text-lime-400' : ''}`} />
        <span className="text-[10px] font-medium mt-1">Watch</span>
      </button>

      <button
        onClick={() => onSelectMode('profile')}
        className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] px-2 transition-colors ${
          currentMode === 'profile' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
        }`}
        aria-label="Profile"
      >
        <div className={`w-5 h-5 rounded-full overflow-hidden ${
          currentMode === 'profile' ? 'ring-1 ring-cyan-400' : ''
        }`}>
          <img
            src={currentUser.avatar}
            alt="Profile"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <span className="text-[10px] font-medium mt-1">Profile</span>
      </button>
    </nav>
  );
};
