import React, { useState } from 'react';
import { GlitchNotification, User } from '../types';
import { 
  X, 
  Bell, 
  Heart, 
  MessageSquare, 
  Sparkles, 
  UserCheck, 
  AtSign, 
  ShieldCheck, 
  Check, 
  SlidersHorizontal,
  ExternalLink
} from 'lucide-react';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: GlitchNotification[];
  onMarkAllRead: () => void;
  onSelectNotification: (notif: GlitchNotification) => void;
  currentUser: User;
}

type FilterTab = 'all' | 'likes' | 'comments' | 'mentions' | 'subscriptions' | 'system';

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onSelectNotification,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [pushEnabled, setPushEnabled] = useState(false);
  const [showPushBanner, setShowPushBanner] = useState(true);

  if (!isOpen) return null;

  const filtered = notifications.filter((item) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'likes') return item.type === 'like' || item.type === 'super_spark';
    if (activeTab === 'comments') return item.type === 'comment';
    if (activeTab === 'mentions') return item.type === 'mention';
    if (activeTab === 'subscriptions') return item.type === 'subscribe';
    if (activeTab === 'system') return item.type === 'system';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotifIcon = (type: GlitchNotification['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />;
      case 'super_spark':
        return <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />;
      case 'comment':
        return <MessageSquare className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/20" />;
      case 'mention':
        return <AtSign className="w-3.5 h-3.5 text-fuchsia-400" />;
      case 'subscribe':
        return <UserCheck className="w-3.5 h-3.5 text-emerald-400" />;
      case 'system':
      default:
        return <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0d0f17] border-l border-slate-800 shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-4 md:p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white font-['Outfit']">Activity Center</h2>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500 text-slate-950">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">Real-time alerts & interactions</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllRead}
                  className="px-2.5 py-1 text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/40 rounded-lg transition-colors flex items-center gap-1"
                  title="Mark all as read"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark read</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Close activity center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Push Notification Opt-in Prompt */}
          {showPushBanner && (
            <div className="mx-4 mt-3 p-3 rounded-xl bg-gradient-to-r from-cyan-950/60 to-indigo-950/60 border border-cyan-500/30 flex items-start justify-between gap-3">
              <div className="flex gap-2.5">
                <span className="text-lg">🔔</span>
                <div>
                  <p className="text-xs font-semibold text-white">Enable Instant Push Alerts</p>
                  <p className="text-[11px] text-slate-300">Get notified when creators go live or tip your Sparks.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setPushEnabled(!pushEnabled)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    pushEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      pushEnabled ? 'translate-x-4' : 'translate-x-1'
                    }`}
                  />
                </button>
                <button 
                  onClick={() => setShowPushBanner(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Grouped Filter Chips */}
          <div className="p-3 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {(['all', 'likes', 'comments', 'mentions', 'subscriptions', 'system'] as FilterTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-lg text-xs font-medium capitalize shrink-0 transition-colors ${
                  activeTab === tab
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {tab === 'all' ? 'All Activity' : tab}
              </button>
            ))}
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-slate-800/40">
            {filtered.length === 0 ? (
              <div className="py-16 text-center text-slate-500 text-xs">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No activity yet in this filter
              </div>
            ) : (
              filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectNotification(item)}
                  className={`pt-2.5 first:pt-0 flex items-start gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${
                    !item.read
                      ? 'bg-slate-800/40 border border-cyan-500/20'
                      : 'hover:bg-slate-800/20'
                  }`}
                >
                  {/* Actor Avatar with Type Badge */}
                  <div className="relative shrink-0">
                    <img
                      src={item.actor.avatar}
                      alt={item.actor.name}
                      className="w-10 h-10 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#0d0f17] border border-slate-700 flex items-center justify-center">
                      {getNotifIcon(item.type)}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-200 leading-snug">
                      <span className="font-semibold text-white mr-1">
                        {item.actor.name}
                      </span>
                      {item.content}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-slate-400">{item.timestamp}</span>
                      {item.groupedCount && (
                        <span className="text-[10px] text-cyan-400 font-mono font-medium">
                          +{item.groupedCount} interactions
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Target Media Thumbnail Preview */}
                  {item.targetThumbnail && (
                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-800">
                      <img
                        src={item.targetThumbnail}
                        alt="Media"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {!item.read && (
                    <div className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 self-center" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-800 bg-[#0a0c13] flex items-center justify-between text-xs text-slate-400">
            <span>Logged in as @{currentUser.handle}</span>
            <span className="text-[10px] font-mono text-cyan-400">Glitch Network Active</span>
          </div>

        </div>
      </div>
    </div>
  );
};
