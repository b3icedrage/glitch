import React, { useState } from 'react';
import { 
  PlatformMode, 
  User, 
  FeedPost, 
  SparkReel, 
  CinemaVideo, 
  UserStory, 
  ChatThread,
  GlitchNotification,
  LiveStream,
  LiveChatMessage,
  GlitchSound
} from './types';
import { 
  CURRENT_USER, 
  CREATORS, 
  INITIAL_FEED_POSTS, 
  INITIAL_SPARKS, 
  INITIAL_CINEMA_VIDEOS, 
  INITIAL_STORIES, 
  INITIAL_CHATS,
  INITIAL_NOTIFICATIONS,
  INITIAL_LIVE_STREAMS,
  INITIAL_LIVE_CHATS,
  INITIAL_SOUNDS
} from './data/mockData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { FeedView } from './components/FeedView';
import { SparksView } from './components/SparksView';
import { CinemaView } from './components/CinemaView';
import { LiveStreamView } from './components/LiveStreamView';
import { ExploreView } from './components/ExploreView';
import { DirectMessages } from './components/DirectMessages';
import { ProfileView } from './components/ProfileView';
import { StoryViewerModal } from './components/StoryViewerModal';
import { CommentsDrawer } from './components/CommentsDrawer';
import { CreateModal } from './components/CreateModal';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { WalletModal } from './components/WalletModal';
import { SoundHubModal } from './components/SoundHubModal';

export default function App() {
  const [currentMode, setCurrentMode] = useState<PlatformMode>('feed');
  const [historyStack, setHistoryStack] = useState<PlatformMode[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(CURRENT_USER);
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>(INITIAL_FEED_POSTS);
  const [sparks, setSparks] = useState<SparkReel[]>(INITIAL_SPARKS);
  const [cinemaVideos, setCinemaVideos] = useState<CinemaVideo[]>(INITIAL_CINEMA_VIDEOS);
  const [stories, setStories] = useState<UserStory[]>(INITIAL_STORIES);
  const [chats, setChats] = useState<ChatThread[]>(INITIAL_CHATS);
  const [notifications, setNotifications] = useState<GlitchNotification[]>(INITIAL_NOTIFICATIONS);
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>(INITIAL_LIVE_STREAMS);
  const [liveChats, setLiveChats] = useState<LiveChatMessage[]>(INITIAL_LIVE_CHATS);

  // Cross-Platform Follow & Subscribe State
  const [followedUserIds, setFollowedUserIds] = useState<Set<string>>(new Set(['user_kai']));
  const [subscribedChannelIds, setSubscribedChannelIds] = useState<Set<string>>(new Set(['user_kai']));

  // Active Modals & Viewers
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [activeCommentsItem, setActiveCommentsItem] = useState<{
    type: 'feed' | 'spark';
    item: FeedPost | SparkReel;
  } | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [activeSoundForHub, setActiveSoundForHub] = useState<GlitchSound | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleTipCreator = (amount: number, streamerId: string) => {
    setCurrentUser(prev => ({
      ...prev,
      walletSparks: Math.max(0, (prev.walletSparks ?? 2850) - amount)
    }));
    showToast(`Tipped ${amount.toLocaleString()} Super-Sparks! ⚡`);
  };

  const handleAddSparks = (amount: number) => {
    setCurrentUser(prev => ({
      ...prev,
      walletSparks: (prev.walletSparks ?? 2850) + amount
    }));
    showToast(`Added +${amount.toLocaleString()} Sparks to your wallet! ⚡`);
  };

  const handlePayout = (amount: number) => {
    showToast(`$${amount.toFixed(2)} transferred to your connected Stripe account! 🏦`);
  };

  const handleOpenSoundHub = (soundTitle: string, soundArtist: string, soundCover: string) => {
    const existing = INITIAL_SOUNDS.find(s => s.title.toLowerCase().includes(soundTitle.toLowerCase()));
    if (existing) {
      setActiveSoundForHub(existing);
    } else {
      setActiveSoundForHub({
        id: `sound_${Date.now()}`,
        title: soundTitle,
        artist: soundArtist,
        coverUrl: soundCover,
        duration: '0:30',
        usageCount: '1.2K',
        category: 'Original Audio'
      });
    }
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast('All notifications marked as read! ✓');
  };

  const handleSelectNotification = (notif: GlitchNotification) => {
    setNotifications(prev => prev.map(n => (n.id === notif.id ? { ...n, read: true } : n)));
    setIsNotificationsOpen(false);
    if (notif.targetType === 'spark') {
      navigateWithHistory('sparks');
    } else if (notif.targetType === 'tube') {
      navigateWithHistory('tube');
    } else if (notif.targetType === 'live') {
      navigateWithHistory('live');
    } else {
      navigateWithHistory('feed');
    }
  };

  const navigateWithHistory = (newMode: PlatformMode) => {
    if (newMode !== currentMode) {
      setHistoryStack(prev => [...prev, currentMode]);
      setCurrentMode(newMode);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleGoBack = () => {
    if (historyStack.length > 0) {
      const prevMode = historyStack[historyStack.length - 1];
      setHistoryStack(prev => prev.slice(0, -1));
      setCurrentMode(prevMode);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setCurrentMode('feed');
    }
  };

  const handleToggleFollow = (userId: string) => {
    setFollowedUserIds(prev => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
        showToast('Unfollowed creator');
      } else {
        next.add(userId);
        showToast('Now following on Glitch!');
      }
      return next;
    });
  };

  const handleToggleSubscribe = (channelId: string) => {
    setSubscribedChannelIds(prev => {
      const next = new Set(prev);
      if (next.has(channelId)) {
        next.delete(channelId);
        showToast('Unsubscribed from channel');
      } else {
        next.add(channelId);
        showToast('Subscribed to channel with notifications enabled!');
      }
      return next;
    });
  };

  const handleStoryViewed = (userId: string) => {
    setStories(prev =>
      prev.map(s => (s.userId === userId ? { ...s, hasUnseen: false } : s))
    );
  };

  // Publishing Handlers from Creation Studio
  const handlePublishFeedPost = (newPost: FeedPost) => {
    setFeedPosts([newPost, ...feedPosts]);
    navigateWithHistory('feed');
    showToast('Feed post published successfully! 📸');
  };

  const handlePublishSpark = (newSpark: SparkReel) => {
    setSparks([newSpark, ...sparks]);
    navigateWithHistory('sparks');
    showToast('Spark reel dropped to Glitch algorithm! ⚡');
  };

  const handlePublishCinemaVideo = (newVideo: CinemaVideo) => {
    setCinemaVideos([newVideo, ...cinemaVideos]);
    navigateWithHistory('tube');
    showToast('Cinema episode uploaded to Glitch Cinema! 🎬');
  };

  const handlePublishStory = (newStory: UserStory) => {
    setStories([newStory, ...stories.filter(s => s.userId !== currentUser.id)]);
    showToast('Story added for the next 24 hours! ⭕');
  };

  const unreadMessagesCount = chats.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  const previousMode = historyStack.length > 0 ? historyStack[historyStack.length - 1] : undefined;

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans'] pb-20 md:pb-0">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-cyan-500/50 text-cyan-300 text-xs px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
          {toastMessage}
        </div>
      )}

      {/* Strict 3-Zone Top Navigation Contract with Persistent Back Arrow */}
      <Header
        currentMode={currentMode}
        onSelectMode={(mode) => navigateWithHistory(mode)}
        currentUser={currentUser}
        onOpenCreate={() => setIsCreateOpen(true)}
        unreadCount={unreadMessagesCount}
        unreadNotificationsCount={notifications.filter(n => !n.read).length}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenWallet={() => setIsWalletOpen(true)}
        canGoBack={historyStack.length > 0}
        onGoBack={handleGoBack}
        previousModeLabel={previousMode}
      />

      {/* Main Mode View Routing */}
      <main className="flex-1 w-full">
        {currentMode === 'feed' && (
          <FeedView
            posts={feedPosts}
            stories={stories}
            currentUser={currentUser}
            creators={CREATORS}
            onSelectStory={(idx) => setActiveStoryIndex(idx)}
            onAddStory={() => setIsCreateOpen(true)}
            onOpenComments={(post) => setActiveCommentsItem({ type: 'feed', item: post })}
            onNavigateToSparks={() => navigateWithHistory('sparks')}
            onNavigateToTube={() => navigateWithHistory('tube')}
            onNavigateToMessages={(creatorId) => navigateWithHistory('messages')}
            onToggleFollow={handleToggleFollow}
            followedUserIds={followedUserIds}
          />
        )}

        {currentMode === 'sparks' && (
          <SparksView
            reels={sparks}
            currentUser={currentUser}
            onOpenComments={(reel) => setActiveCommentsItem({ type: 'spark', item: reel })}
            onToggleFollow={handleToggleFollow}
            followedUserIds={followedUserIds}
            onGoBack={handleGoBack}
            onOpenSoundHub={handleOpenSoundHub}
          />
        )}

        {currentMode === 'tube' && (
          <CinemaView
            videos={cinemaVideos}
            currentUser={currentUser}
            onToggleSubscribe={handleToggleSubscribe}
            subscribedChannelIds={subscribedChannelIds}
            onGoBack={handleGoBack}
          />
        )}

        {currentMode === 'live' && (
          <LiveStreamView
            streams={liveStreams}
            initialChatMessages={liveChats}
            currentUser={currentUser}
            onGoBack={handleGoBack}
            onTipCreator={handleTipCreator}
          />
        )}

        {currentMode === 'explore' && (
          <ExploreView
            feedPosts={feedPosts}
            sparks={sparks}
            cinemaVideos={cinemaVideos}
            onSelectFeedPost={(post) => navigateWithHistory('feed')}
            onSelectSpark={(spark) => navigateWithHistory('sparks')}
            onSelectVideo={(video) => navigateWithHistory('tube')}
            onGoBack={handleGoBack}
          />
        )}

        {currentMode === 'messages' && (
          <DirectMessages
            chats={chats}
            currentUser={currentUser}
            onNavigateToFeedPost={(postId) => navigateWithHistory('feed')}
            onNavigateToSpark={(sparkId) => navigateWithHistory('sparks')}
            onNavigateToTube={(tubeId) => navigateWithHistory('tube')}
            onGoBack={handleGoBack}
          />
        )}

        {currentMode === 'profile' && (
          <ProfileView
            currentUser={currentUser}
            onUpdateUser={(updated) => setCurrentUser(prev => ({ ...prev, ...updated }))}
            userPosts={feedPosts.filter(p => p.author.id === currentUser.id || p.id === 'post_1')}
            userSparks={sparks.filter(s => s.author.id === currentUser.id || s.id === 'spark_1')}
            userVideos={cinemaVideos.filter(v => v.channel.id === currentUser.id || v.id === 'yt_4')}
            onSelectPost={(post) => navigateWithHistory('feed')}
            onSelectSpark={(spark) => navigateWithHistory('sparks')}
            onSelectVideo={(video) => navigateWithHistory('tube')}
            onNavigateToMessages={() => navigateWithHistory('messages')}
            onGoBack={handleGoBack}
          />
        )}
      </main>

      {/* Mobile Ergonomic Bottom Tab Bar */}
      <BottomNav
        currentMode={currentMode}
        onSelectMode={(mode) => navigateWithHistory(mode)}
        onOpenCreate={() => setIsCreateOpen(true)}
        currentUser={currentUser}
        unreadCount={unreadMessagesCount}
      />

      {/* Full-Screen Story Viewer Modal */}
      {activeStoryIndex !== null && (
        <StoryViewerModal
          stories={stories}
          initialUserIndex={activeStoryIndex}
          onClose={() => setActiveStoryIndex(null)}
          onStoryViewed={handleStoryViewed}
        />
      )}

      {/* Slide-over Comments Drawer (for feed posts and sparks reels) */}
      {activeCommentsItem && (
        <CommentsDrawer
          isOpen={true}
          onClose={() => setActiveCommentsItem(null)}
          comments={activeCommentsItem.item.comments}
          currentUser={currentUser}
          onAddComment={(text) => {
            if (activeCommentsItem.type === 'feed') {
              setFeedPosts(prev =>
                prev.map(p =>
                  p.id === activeCommentsItem.item.id
                    ? { ...p, commentsCount: p.commentsCount + 1 }
                    : p
                )
              );
            } else {
              setSparks(prev =>
                prev.map(s =>
                  s.id === activeCommentsItem.item.id
                    ? { ...s, commentsCount: s.commentsCount + 1 }
                    : s
                )
              );
            }
          }}
          title={activeCommentsItem.type === 'feed' ? 'Post Comments' : 'Sparks Discussion'}
        />
      )}

      {/* Multi-Platform Creator Studio Modal */}
      <CreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        currentUser={currentUser}
        onPublishFeedPost={handlePublishFeedPost}
        onPublishSpark={handlePublishSpark}
        onPublishCinemaVideo={handlePublishCinemaVideo}
        onPublishStory={handlePublishStory}
      />

      {/* Notifications Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onSelectNotification={handleSelectNotification}
        currentUser={currentUser}
      />

      {/* Virtual Currency & Glitch Sparks Wallet */}
      <WalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        currentUser={currentUser}
        onAddSparks={handleAddSparks}
        onPayout={handlePayout}
      />

      {/* Audio Hub Modal */}
      <SoundHubModal
        isOpen={activeSoundForHub !== null}
        onClose={() => setActiveSoundForHub(null)}
        sound={activeSoundForHub}
        sparks={sparks}
        onSelectSpark={(spark) => {
          setActiveSoundForHub(null);
          navigateWithHistory('sparks');
        }}
        onUseSoundInStudio={(sound) => {
          setActiveSoundForHub(null);
          setIsCreateOpen(true);
        }}
      />

    </div>
  );
}
