import React, { useState, useEffect } from 'react';
import { useFirebaseAuth } from './auth/firebaseAuth';
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
  GlitchSound,
  Comment
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

// Core TikTok / Social Views
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { SparksView } from './components/SparksView';
import { FeedView } from './components/FeedView';
import { LiveStreamView } from './components/LiveStreamView';
import { ExploreView } from './components/ExploreView';
import { CinemaView } from './components/CinemaView';
import { DirectMessages } from './components/DirectMessages';
import { ProfileView } from './components/ProfileView';

// Interactive Drawers & Modals
import { CreateModal } from './components/CreateModal';
import { CommentsDrawer } from './components/CommentsDrawer';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { StoryViewerModal } from './components/StoryViewerModal';
import { SoundHubModal } from './components/SoundHubModal';
import { KelviqPricingModal } from './components/KelviqPricingModal';

function readStoredState<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function containsTemporaryMedia(value: unknown): boolean {
  if (typeof value === 'string') return value.startsWith('blob:');
  if (Array.isArray(value)) return value.some(containsTemporaryMedia);
  if (value && typeof value === 'object') return Object.values(value as Record<string, unknown>).some(containsTemporaryMedia);
  return false;
}

function sanitizeStoredState(value: unknown): unknown {
  if (Array.isArray(value)) {
    // Object URLs stop working after refresh, so don't persist locally uploaded media entries.
    return value.filter((item) => !containsTemporaryMedia(item)).map(sanitizeStoredState);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, item]) => !(typeof item === 'string' && item.startsWith('blob:')))
        .map(([key, item]) => [key, sanitizeStoredState(item)])
    );
  }
  return value;
}

function writeStoredState(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(sanitizeStoredState(value)));
  } catch (error) {
    console.warn(`Could not save ${key} locally:`, error);
  }
}

export default function App() {
  const auth = useFirebaseAuth();
  // Navigation State (defaults to TikTok 'sparks' video feed)
  const [currentMode, setCurrentMode] = useState<PlatformMode>('sparks');
  const [previousMode, setPreviousMode] = useState<PlatformMode>('sparks');

  // Application Data State
  const [currentUser, setCurrentUser] = useState<User>(() => readStoredState('glitch.currentUser', CURRENT_USER));
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>(() => readStoredState('glitch.feedPosts', INITIAL_FEED_POSTS));
  const [sparks, setSparks] = useState<SparkReel[]>(() => readStoredState('glitch.sparks', INITIAL_SPARKS));
  const [cinemaVideos, setCinemaVideos] = useState<CinemaVideo[]>(() => readStoredState('glitch.cinemaVideos', INITIAL_CINEMA_VIDEOS));
  const [stories, setStories] = useState<UserStory[]>(() => readStoredState('glitch.stories', INITIAL_STORIES));
  const [chats, setChats] = useState<ChatThread[]>(() => readStoredState('glitch.chats', INITIAL_CHATS));
  const [notifications, setNotifications] = useState<GlitchNotification[]>(() => readStoredState('glitch.notifications', INITIAL_NOTIFICATIONS));
  const [liveStreams] = useState<LiveStream[]>(INITIAL_LIVE_STREAMS);

  // Social Connections & Subscriptions
  const [followedUserIds, setFollowedUserIds] = useState<Set<string>>(() => new Set(readStoredState<string[]>('glitch.followedUserIds', ['user_kai', 'user_elena'])));
  const [subscribedChannelIds, setSubscribedChannelIds] = useState<Set<string>>(() => new Set(readStoredState<string[]>('glitch.subscribedChannelIds', ['user_elena'])));

  // Modals & Drawers State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [activeCommentsItem, setActiveCommentsItem] = useState<{ id: string; title: string; comments: Comment[] } | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [isSoundHubOpen, setIsSoundHubOpen] = useState(false);
  const [activeSound, setActiveSound] = useState<GlitchSound | null>(null);

  // Kelviq Billing & Git Sync State
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [billingToast, setBillingToast] = useState<string | null>(null);

  // Keep the prototype's content and social actions across refreshes on this device.
  // This is device-local persistence, not a substitute for an authenticated cloud database.
  useEffect(() => writeStoredState('glitch.currentUser', currentUser), [currentUser]);
  useEffect(() => writeStoredState('glitch.feedPosts', feedPosts), [feedPosts]);
  useEffect(() => writeStoredState('glitch.sparks', sparks), [sparks]);
  useEffect(() => writeStoredState('glitch.cinemaVideos', cinemaVideos), [cinemaVideos]);
  useEffect(() => writeStoredState('glitch.stories', stories), [stories]);
  useEffect(() => writeStoredState('glitch.chats', chats), [chats]);
  useEffect(() => writeStoredState('glitch.notifications', notifications), [notifications]);
  useEffect(() => writeStoredState('glitch.followedUserIds', Array.from(followedUserIds)), [followedUserIds]);
  useEffect(() => writeStoredState('glitch.subscribedChannelIds', Array.from(subscribedChannelIds)), [subscribedChannelIds]);

  // Fetch live Kelviq entitlements & check URL params
  useEffect(() => {
    if (!auth.session?.access_token) return;
    if (window.location.search.includes('billing=success')) {
      setBillingToast('Checkout returned successfully. Confirming your subscription status…');
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => setBillingToast(null), 5000);
    }

    fetch('https://glitch-bice.vercel.app/api/kelviq/entitlements', { headers: { Authorization: `Bearer ${auth.session.access_token}` } })
      .then(async (res) => {
        const contentType = res.headers.get('content-type') || '';
        const body = await res.text();
        if (!contentType.includes('application/json')) {
          throw new Error(`Entitlements API returned ${res.status} non-JSON content. The deployment may not be routing /api requests to the server.`);
        }
        let data: any;
        try {
          data = JSON.parse(body);
        } catch {
          throw new Error('Entitlements API returned invalid JSON.');
        }
        if (!res.ok) {
          throw new Error(data.error || `Entitlements request failed (${res.status}).`);
        }
        return data;
      })
      .then((data) => {
        setIsPro(Boolean(data.isPro));
      })
      .catch((err) => {
        console.warn('Could not fetch entitlements:', err);
        setBillingToast('Billing status is temporarily unavailable. Please retry later.');
        setTimeout(() => setBillingToast(null), 5000);
      });
  }, [auth.session?.access_token]);

  const handleSelectMode = (mode: PlatformMode) => {
    setPreviousMode(currentMode);
    setCurrentMode(mode);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Follow/Unfollow toggle
  const handleToggleFollow = (userId: string) => {
    setFollowedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  // Channel Subscribe toggle
  const handleToggleSubscribe = (channelId: string) => {
    setSubscribedChannelIds((prev) => {
      const next = new Set(prev);
      if (next.has(channelId)) {
        next.delete(channelId);
      } else {
        next.add(channelId);
      }
      return next;
    });
  };

  // Open comments for reel or feed post
  const handleOpenComments = (item: SparkReel | FeedPost) => {
    setActiveCommentsItem({
      id: item.id,
      title: 'caption' in item ? item.caption : 'Comments',
      comments: item.comments || [],
    });
    setIsCommentsOpen(true);
  };

  // Add new comment
  const handleAddComment = (text: string) => {
    if (!activeCommentsItem) return;
    const newComment: Comment = {
      id: `comm_${Date.now()}`,
      user: currentUser,
      text,
      timestamp: 'Just now',
      likesCount: 0,
      isLiked: false,
    };

    setActiveCommentsItem((prev) => (prev ? { ...prev, comments: [newComment, ...prev.comments] } : null));

    // Update inside sparks or feed
    setSparks((prev) =>
      prev.map((s) => (s.id === activeCommentsItem.id ? { ...s, comments: [newComment, ...s.comments], commentsCount: s.commentsCount + 1 } : s))
    );
    setFeedPosts((prev) =>
      prev.map((p) => (p.id === activeCommentsItem.id ? { ...p, comments: [newComment, ...p.comments], commentsCount: p.commentsCount + 1 } : p))
    );
  };

  // Open Sound Hub from Sparks Reel audio tag
  const handleOpenSoundHub = (title: string, artist: string, cover: string) => {
    const existing = INITIAL_SOUNDS.find((s) => s.title.toLowerCase() === title.toLowerCase());
    const soundObj: GlitchSound = existing || {
      id: `sound_${Date.now()}`,
      title,
      artist,
      coverUrl: cover,
      duration: '0:30',
      usageCount: '14.2K',
      category: 'Trending Beat',
    };
    setActiveSound(soundObj);
    setIsSoundHubOpen(true);
  };

  // Publishing new content
  const handlePublishSpark = (newSpark: SparkReel) => {
    setSparks((prev) => [newSpark, ...prev]);
    setCurrentMode('sparks');
  };

  const handlePublishFeedPost = (newPost: FeedPost) => {
    setFeedPosts((prev) => [newPost, ...prev]);
    setCurrentMode('feed');
  };

  const handlePublishCinemaVideo = (newVideo: CinemaVideo) => {
    setCinemaVideos((prev) => [newVideo, ...prev]);
    setCurrentMode('tube');
  };

  const handlePublishStory = (newStory: UserStory) => {
    setStories((prev) => [newStory, ...prev]);
  };

  // Tipping creator in LIVE stream (reports compute/meter usage if Pro)
  const handleTipCreator = (amount: number, _streamerId: string) => {
    setCurrentUser((prev) => ({
      ...prev,
      walletSparks: Math.max(0, (prev.walletSparks || 0) - amount),
    }));

    // Report usage to Kelviq if active
    fetch('https://glitch-bice.vercel.app/api/kelviq/report-usage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.session?.access_token || ''}`,
      },
      body: JSON.stringify({ credits: Math.ceil(amount / 10) }),
    }).catch(() => {});
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;
  const unreadMessagesCount = chats.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  return (
    <div className="min-h-screen bg-[#0b100c] text-[#f3f5ee] flex flex-col font-['Plus_Jakarta_Sans'] selection:bg-[#ffc3a5] selection:text-[#182017]">
      
      {/* Top Header */}
      <Header
        currentMode={currentMode}
        onSelectMode={handleSelectMode}
        currentUser={currentUser}
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenPricing={() => setIsPricingOpen(true)}
        isPro={isPro}
        unreadNotificationsCount={unreadNotificationsCount}
        unreadMessagesCount={unreadMessagesCount}
      />

      {/* Kelviq Billing Toast */}
      {billingToast && (
        <div className="bg-gradient-to-r from-[#477b43] to-[#f0b08f] text-white font-mono text-xs py-2 px-4 text-center font-bold sticky top-[57px] z-30 shadow-lg animate-fade-in flex items-center justify-center gap-2">
          <span>{billingToast}</span>
          <button
            onClick={() => setBillingToast(null)}
            className="ml-3 text-[#ffe0cf] hover:text-white underline text-[11px]"
          >
            Close
          </button>
        </div>
      )}

      {/* Main Viewport Content */}
      <main className="flex-1 flex flex-col pb-16 md:pb-0">
        
        {/* TikTok Vertical Video Sparks Feed */}
        {currentMode === 'sparks' && (
          <SparksView
            reels={sparks}
            currentUser={currentUser}
            onOpenComments={handleOpenComments}
            onToggleFollow={handleToggleFollow}
            followedUserIds={followedUserIds}
            onOpenSoundHub={handleOpenSoundHub}
            onUpdateSpark={(reelId, updates) => setSparks((prev) => prev.map((reel) => reel.id === reelId ? { ...reel, ...updates } : reel))}
          />
        )}

        {/* Instagram/TikTok Following Feed with Stories Bar */}
        {currentMode === 'feed' && (
          <FeedView
            posts={feedPosts}
            stories={stories}
            currentUser={currentUser}
            creators={CREATORS}
            onSelectStory={(index) => {
              setSelectedStoryIndex(index);
              setIsStoryViewerOpen(true);
            }}
            onAddStory={() => setIsCreateOpen(true)}
            onOpenComments={handleOpenComments}
            onNavigateToSparks={() => handleSelectMode('sparks')}
            onNavigateToTube={() => handleSelectMode('tube')}
            onNavigateToMessages={() => handleSelectMode('messages')}
            onToggleFollow={handleToggleFollow}
            followedUserIds={followedUserIds}
            onUpdatePost={(postId, updates) => setFeedPosts((prev) => prev.map((post) => post.id === postId ? { ...post, ...updates } : post))}
          />
        )}

        {/* TikTok LIVE Interactive Stream with Live Chat & Gifts */}
        {currentMode === 'live' && (
          <LiveStreamView
            streams={liveStreams}
            initialChatMessages={INITIAL_LIVE_CHATS}
            currentUser={currentUser}
            onGoBack={() => handleSelectMode(previousMode || 'sparks')}
            onTipCreator={handleTipCreator}
          />
        )}

        {/* TikTok Explore / Search / Trending Hub */}
        {currentMode === 'explore' && (
          <ExploreView
            feedPosts={feedPosts}
            sparks={sparks}
            cinemaVideos={cinemaVideos}
            onSelectFeedPost={(post) => {
              setFeedPosts([post, ...feedPosts.filter((p) => p.id !== post.id)]);
              handleSelectMode('feed');
            }}
            onSelectSpark={(spark) => {
              setSparks([spark, ...sparks.filter((s) => s.id !== spark.id)]);
              handleSelectMode('sparks');
            }}
            onSelectVideo={(video) => {
              setCinemaVideos([video, ...cinemaVideos.filter((v) => v.id !== video.id)]);
              handleSelectMode('tube');
            }}
            onGoBack={() => handleSelectMode(previousMode || 'sparks')}
          />
        )}

        {/* TikTok Long-Form Video / Cinema */}
        {currentMode === 'tube' && (
          <CinemaView
            videos={cinemaVideos}
            currentUser={currentUser}
            onToggleSubscribe={handleToggleSubscribe}
            subscribedChannelIds={subscribedChannelIds}
            onGoBack={() => handleSelectMode(previousMode || 'sparks')}
          />
        )}

        {/* Direct Messages & Chat Inbox */}
        {currentMode === 'messages' && (
          <DirectMessages
            chats={chats}
            currentUser={currentUser}
            onNavigateToFeedPost={() => handleSelectMode('feed')}
            onNavigateToSpark={() => handleSelectMode('sparks')}
            onNavigateToTube={() => handleSelectMode('tube')}
            onGoBack={() => handleSelectMode(previousMode || 'sparks')}
            onChatsChange={setChats}
          />
        )}

        {/* User Creator Profile */}
        {currentMode === 'profile' && (
          <ProfileView
            currentUser={currentUser}
            onUpdateUser={(updated) => setCurrentUser((prev) => ({ ...prev, ...updated }))}
            userPosts={feedPosts.filter((p) => p.author.id === currentUser.id || p.author.handle === currentUser.handle)}
            userSparks={sparks.filter((s) => s.author.id === currentUser.id || s.author.handle === currentUser.handle)}
            userVideos={cinemaVideos.filter((v) => v.channel.id === currentUser.id || v.channel.handle === currentUser.handle)}
            onSelectPost={() => handleSelectMode('feed')}
            onSelectSpark={() => handleSelectMode('sparks')}
            onSelectVideo={() => handleSelectMode('tube')}
            onNavigateToMessages={() => handleSelectMode('messages')}
            onGoBack={() => handleSelectMode(previousMode || 'sparks')}
          />
        )}

      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        currentMode={currentMode}
        onSelectMode={handleSelectMode}
        onOpenCreate={() => setIsCreateOpen(true)}
        currentUser={currentUser}
        unreadCount={unreadMessagesCount}
      />

      {/* Modals & Slide-Over Drawers */}

      {/* 1. TikTok Video Creation Studio */}
      <CreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        currentUser={currentUser}
        onPublishSpark={handlePublishSpark}
        onPublishFeedPost={handlePublishFeedPost}
        onPublishCinemaVideo={handlePublishCinemaVideo}
        onPublishStory={handlePublishStory}
      />

      {/* 2. TikTok Sliding Comments Drawer */}
      <CommentsDrawer
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        comments={activeCommentsItem?.comments || []}
        currentUser={currentUser}
        onAddComment={handleAddComment}
        title={activeCommentsItem?.title || 'Comments'}
      />

      {/* 3. Notifications Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllRead={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
        onSelectNotification={(notif) => {
          setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)));
          setIsNotificationsOpen(false);
          if (notif.targetType === 'spark') handleSelectMode('sparks');
          else if (notif.targetType === 'feed') handleSelectMode('feed');
          else if (notif.targetType === 'live') handleSelectMode('live');
        }}
        currentUser={currentUser}
      />

      {/* 4. Fullscreen TikTok Stories Viewer */}
      {isStoryViewerOpen && (
        <StoryViewerModal
          stories={stories}
          initialUserIndex={selectedStoryIndex}
          onClose={() => setIsStoryViewerOpen(false)}
          onStoryViewed={(userId) => {
            setStories((prev) => prev.map((s) => (s.userId === userId ? { ...s, hasUnseen: false } : s)));
          }}
        />
      )}

      {/* 5. Trending TikTok Sound Hub Modal */}
      {isSoundHubOpen && (
        <SoundHubModal
          isOpen={isSoundHubOpen}
          onClose={() => setIsSoundHubOpen(false)}
          sound={activeSound}
          sparks={sparks}
          onSelectSpark={(spark) => {
            setIsSoundHubOpen(false);
            setSparks([spark, ...sparks.filter((s) => s.id !== spark.id)]);
            handleSelectMode('sparks');
          }}
          onUseSoundInStudio={() => {
            setIsSoundHubOpen(false);
            setIsCreateOpen(true);
          }}
        />
      )}

      {/* 6. Kelviq Live Production Billing Modal */}
      <KelviqPricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        isPro={isPro}
      />

    </div>
  );
}
