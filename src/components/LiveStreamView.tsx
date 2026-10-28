import React, { useState, useEffect, useRef } from 'react';
import { LiveStream, LiveChatMessage, User } from '../types';
import { 
  ArrowLeft, 
  Radio, 
  Users, 
  Sparkles, 
  Zap, 
  Send, 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  Share2, 
  Heart, 
  Sliders, 
  Maximize2, 
  Activity, 
  ShieldAlert, 
  Flame, 
  Award,
  Layers,
  Crown
} from 'lucide-react';

interface LiveStreamViewProps {
  streams: LiveStream[];
  initialChatMessages: LiveChatMessage[];
  currentUser: User;
  onGoBack: () => void;
  onTipCreator: (amount: number, streamerId: string) => void;
}

export const LiveStreamView: React.FC<LiveStreamViewProps> = ({
  streams,
  initialChatMessages,
  currentUser,
  onGoBack,
  onTipCreator
}) => {
  const [activeStreamIndex, setActiveStreamIndex] = useState(0);
  const [isBroadcasterMode, setIsBroadcasterMode] = useState(false);
  const [chatMessages, setChatMessages] = useState<LiveChatMessage[]>(initialChatMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(14820);
  const [showTippingTray, setShowTippingTray] = useState(false);
  const [isCoHostSplit, setIsCoHostSplit] = useState(false);
  const [pinnedSuperSpark, setPinnedSuperSpark] = useState<LiveChatMessage | null>({
    id: 'pinned_1',
    user: {
      id: 'user_elena',
      name: 'Elena Rostova',
      handle: 'elenadance',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
      followersCount: 1200000,
      followingCount: 420,
      subscribersCount: '2.1M',
      likesCount: '34.5M',
      bio: 'Freestyle choreography'
    },
    message: 'Dropped 500 Super-Sparks! Keep cooking!',
    timestamp: 'Just now',
    isSuperSpark: true,
    superSparkAmount: 500,
    superSparkTier: 'matrix'
  });

  // Creator studio controls
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [cameraActive, setCameraActive] = useState(true);
  const [micActive, setMicActive] = useState(true);
  const [streamBitrate, setStreamBitrate] = useState(6420);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const activeStream = streams[activeStreamIndex] || streams[0];
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat when messages arrive
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Simulate health fluctuation
  useEffect(() => {
    const timer = setInterval(() => {
      setStreamBitrate(prev => 6300 + Math.floor(Math.random() * 240));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg: LiveChatMessage = {
      id: `live_msg_${Date.now()}`,
      user: currentUser,
      message: inputMessage.trim(),
      timestamp: 'Just now'
    };

    setChatMessages(prev => [...prev, newMsg]);
    setInputMessage('');
  };

  const handleSendTip = (amount: number, tier: 'bolt' | 'matrix' | 'crown' | 'hyper', label: string) => {
    if ((currentUser.walletSparks ?? 2850) < amount) {
      showToast(`Insufficient Sparks! You need ${amount} Sparks.`);
      return;
    }

    onTipCreator(amount, activeStream.streamer.id);

    const superSparkMsg: LiveChatMessage = {
      id: `tip_${Date.now()}`,
      user: currentUser,
      message: `Tipped ${amount.toLocaleString()} Super-Sparks! (${label}) ⚡`,
      timestamp: 'Just now',
      isSuperSpark: true,
      superSparkAmount: amount,
      superSparkTier: tier
    };

    setChatMessages(prev => [...prev, superSparkMsg]);
    setPinnedSuperSpark(superSparkMsg);
    setShowTippingTray(false);
  };

  return (
    <div className="w-full min-h-[calc(100vh-65px)] bg-[#07080c] flex flex-col select-none relative">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 border border-cyan-500/50 text-cyan-300 text-xs px-4 py-2 rounded-full shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}
      
      {/* Sub-Header Navigation Rail */}
      <div className="bg-[#0b0d14] border-b border-slate-800/80 px-4 md:px-8 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onGoBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/60 shadow-sm transition-all duration-150 active:scale-95 group"
            title="Return to previous screen"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-xs font-semibold">Back</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs font-bold uppercase tracking-wider animate-pulse">
              <Radio className="w-3.5 h-3.5" />
              <span>Glitch Live</span>
            </div>
            <span className="hidden sm:inline text-xs text-slate-400">
              Interactive Ultra-Low Latency Broadcasts
            </span>
          </div>
        </div>

        {/* Mode Switcher: Viewer vs Creator Studio */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBroadcasterMode(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              !isBroadcasterMode
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Watch Stream
          </button>
          <button
            onClick={() => setIsBroadcasterMode(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              isBroadcasterMode
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-rose-400" />
            <span>Broadcast Studio</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-3 md:p-6 gap-5">
        
        {/* Left Column: Stream Video Player or Broadcast Studio */}
        <div className="flex-1 flex flex-col gap-4">
          
          {!isBroadcasterMode ? (
            /* VIEWER PLAYER */
            <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center group">
              
              {/* Co-Host Dual Screen or Single Screen */}
              {isCoHostSplit && activeStream.coHost ? (
                <div className="w-full h-full grid grid-cols-2 gap-1 bg-slate-950 p-1">
                  <div className="relative w-full h-full rounded-xl overflow-hidden bg-slate-900">
                    <img
                      src={activeStream.thumbnailUrl}
                      alt={activeStream.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 rounded-md text-[10px] text-white font-medium flex items-center gap-1">
                      <span>@{activeStream.streamer.handle}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                    </div>
                  </div>

                  <div className="relative w-full h-full rounded-xl overflow-hidden bg-slate-900">
                    <img
                      src={activeStream.coHost.avatar}
                      alt={activeStream.coHost.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 rounded-md text-[10px] text-white font-medium flex items-center gap-1">
                      <span>@{activeStream.coHost.handle} (Guest)</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-full">
                  <video
                    src={activeStream.streamUrl}
                    poster={activeStream.thumbnailUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Live Overlay HUD */}
              <div className="absolute top-4 left-4 flex items-center gap-2 z-20">
                <div className="px-2.5 py-1 rounded-md bg-rose-600 text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  LIVE
                </div>
                <div className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-white text-xs font-medium flex items-center gap-1.5 border border-white/10">
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{activeStream.viewerCount.toLocaleString()}</span>
                </div>
                <div className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-cyan-300 text-xs font-medium border border-cyan-500/20">
                  {activeStream.category}
                </div>
              </div>

              {/* Co-Host toggle button */}
              {activeStream.coHost && (
                <button
                  onClick={() => setIsCoHostSplit(!isCoHostSplit)}
                  className="absolute top-4 right-4 z-20 px-3 py-1 rounded-lg bg-black/70 hover:bg-black/90 backdrop-blur-md text-xs font-semibold text-slate-200 border border-white/10 flex items-center gap-1.5"
                >
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isCoHostSplit ? 'Single View' : 'Split-Screen Co-Host'}</span>
                </button>
              )}

              {/* Watermark */}
              <div className="absolute bottom-4 left-4 z-20 pointer-events-none opacity-80">
                <span className="text-xs font-bold tracking-widest text-cyan-400 uppercase drop-shadow font-mono">
                  GLITCH LIVE ULTRA-HD
                </span>
              </div>
            </div>
          ) : (
            /* BROADCASTER STUDIO */
            <div className="w-full bg-[#0d0f17] rounded-2xl border border-rose-500/40 p-5 shadow-2xl flex flex-col gap-5">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
                    <Video className="w-5 h-5 text-rose-500" />
                    Creator Broadcast Ingest Station
                  </h3>
                  <p className="text-xs text-slate-400">WebRTC low-latency streaming pipeline</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsLiveActive(!isLiveActive)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg ${
                      isLiveActive
                        ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                        : 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:brightness-110 text-white'
                    }`}
                  >
                    <Radio className="w-4 h-4" />
                    <span>{isLiveActive ? 'END BROADCAST' : 'START STREAM NOW'}</span>
                  </button>
                </div>
              </div>

              {/* Preview Monitor & Health Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Camera Preview Monitor */}
                <div className="md:col-span-2 relative aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                  {cameraActive ? (
                    <img
                      src={currentUser.avatar}
                      alt="Stream Preview"
                      className="w-full h-full object-cover filter brightness-95"
                    />
                  ) : (
                    <div className="text-center text-slate-500 text-xs">
                      <VideoOff className="w-8 h-8 mx-auto mb-1 opacity-40" />
                      Camera Feed Muted
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCameraActive(!cameraActive)}
                        className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                          cameraActive ? 'bg-slate-800/90 text-white' : 'bg-rose-900/80 text-rose-300'
                        }`}
                      >
                        {cameraActive ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => setMicActive(!micActive)}
                        className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                          micActive ? 'bg-slate-800/90 text-white' : 'bg-rose-900/80 text-rose-300'
                        }`}
                      >
                        {micActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="px-2.5 py-1 rounded bg-black/80 backdrop-blur-md text-[10px] font-mono text-cyan-400">
                      1080p @ 60 FPS
                    </div>
                  </div>
                </div>

                {/* Health Metrics Dashboard */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                      <Activity className="w-4 h-4 text-emerald-400" />
                      Stream Health
                    </h4>
                    
                    <div className="space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Bitrate:</span>
                        <span className="font-mono text-emerald-400 font-bold">{streamBitrate} kbps</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Frame Rate:</span>
                        <span className="font-mono text-cyan-400 font-bold">60.0 FPS</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Dropped Frames:</span>
                        <span className="font-mono text-emerald-400 font-bold">0 (0.0%)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Audio Sync:</span>
                        <span className="font-mono text-slate-300">12ms (Optimal)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Codec:</span>
                        <span className="font-mono text-slate-300">AV1 NVENC</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                    RTMP: <code className="text-cyan-300 text-[10px]">rtmp://live.glitch.network/app</code>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* Streamer Profile & Actions Bar */}
          <div className="bg-[#0d0f17] border border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={activeStream.streamer.avatar}
                alt={activeStream.streamer.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-rose-500/80"
                referrerPolicy="no-referrer"
              />
              <div>
                <h2 className="text-base font-bold text-white leading-tight">
                  {activeStream.title}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-cyan-400 font-semibold">
                    @{activeStream.streamer.handle}
                  </span>
                  <span className="text-slate-500 text-xs">•</span>
                  <span className="text-xs text-slate-400">Started {activeStream.startedAt}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions: Tip Super-Sparks, Like, Share */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTippingTray(!showTippingTray)}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-cyan-500 text-slate-950 hover:brightness-110 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>Super-Sparks Tip</span>
              </button>

              <button
                onClick={() => {
                  setIsLiked(!isLiked);
                  setLikesCount(prev => (isLiked ? prev - 1 : prev + 1));
                }}
                className={`p-2.5 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-semibold ${
                  isLiked
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                    : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:text-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{likesCount.toLocaleString()}</span>
              </button>

              <button
                onClick={() => showToast('Stream link copied to clipboard!')}
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
                title="Share stream"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Super-Sparks Tipping Tray Drawer */}
          {showTippingTray && (
            <div className="bg-[#0f121d] border border-amber-500/40 rounded-2xl p-4 animate-in fade-in zoom-in-95 shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <h3 className="text-sm font-bold text-white font-['Outfit']">
                    Send Super-Sparks to @{activeStream.streamer.handle}
                  </h3>
                </div>
                <span className="text-xs text-slate-400">
                  Wallet: <span className="text-cyan-400 font-bold">{(currentUser.walletSparks ?? 2850).toLocaleString()} ⚡</span>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => handleSendTip(100, 'bolt', 'Neon Bolt')}
                  className="p-3 rounded-xl bg-slate-900/80 border border-amber-500/30 hover:border-amber-400 hover:bg-amber-950/20 transition-all flex flex-col items-center gap-1 group active:scale-95"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">⚡</span>
                  <span className="text-xs font-bold text-white">Neon Bolt</span>
                  <span className="text-[11px] font-mono text-amber-400 font-semibold">100 Sparks</span>
                </button>

                <button
                  onClick={() => handleSendTip(500, 'matrix', 'Matrix Grid')}
                  className="p-3 rounded-xl bg-slate-900/80 border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-950/20 transition-all flex flex-col items-center gap-1 group active:scale-95"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">🌌</span>
                  <span className="text-xs font-bold text-white">Matrix Grid</span>
                  <span className="text-[11px] font-mono text-cyan-400 font-semibold">500 Sparks</span>
                </button>

                <button
                  onClick={() => handleSendTip(1000, 'crown', 'Cyber Crown')}
                  className="p-3 rounded-xl bg-slate-900/80 border border-fuchsia-500/30 hover:border-fuchsia-400 hover:bg-fuchsia-950/20 transition-all flex flex-col items-center gap-1 group active:scale-95"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">👑</span>
                  <span className="text-xs font-bold text-white">Cyber Crown</span>
                  <span className="text-[11px] font-mono text-fuchsia-400 font-semibold">1,000 Sparks</span>
                </button>

                <button
                  onClick={() => handleSendTip(5000, 'hyper', 'Hyper Nova')}
                  className="p-3 rounded-xl bg-slate-900/80 border border-rose-500/30 hover:border-rose-400 hover:bg-rose-950/20 transition-all flex flex-col items-center gap-1 group active:scale-95"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">💥</span>
                  <span className="text-xs font-bold text-white">Hyper Nova</span>
                  <span className="text-[11px] font-mono text-rose-400 font-semibold">5,000 Sparks</span>
                </button>
              </div>
            </div>
          )}

          {/* Other Live Channels Carousels */}
          <div className="mt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-rose-400" />
              <span>Other Live Channels Now</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {streams.map((stream, idx) => (
                <div
                  key={stream.id}
                  onClick={() => setActiveStreamIndex(idx)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    activeStreamIndex === idx
                      ? 'bg-slate-800/80 border-cyan-400 shadow-md'
                      : 'bg-[#0d0f17] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="relative aspect-video rounded-lg overflow-hidden mb-2">
                    <img
                      src={stream.thumbnailUrl}
                      alt={stream.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-rose-600 text-[9px] font-bold text-white flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      LIVE
                    </div>
                    <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/70 text-[10px] text-white">
                      {stream.viewerCount.toLocaleString()}
                    </div>
                  </div>
                  <p className="text-xs font-bold text-white truncate">{stream.title}</p>
                  <p className="text-[11px] text-slate-400 truncate">@{stream.streamer.handle}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Floating Real-Time Chat & Super-Sparks Overlay */}
        <div className="w-full lg:w-80 lg:h-[680px] bg-[#0d0f17] border border-slate-800/90 rounded-2xl flex flex-col shadow-2xl overflow-hidden shrink-0">
          
          {/* Chat Header */}
          <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-white font-['Outfit'] uppercase tracking-wider">
                Live Broadcast Chat
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Slow Mode: OFF</span>
          </div>

          {/* Pinned Super-Sparks Banner */}
          {pinnedSuperSpark && (
            <div className="p-2.5 bg-gradient-to-r from-amber-950/60 via-slate-900 to-cyan-950/60 border-b border-amber-500/40 flex items-center gap-2.5 animate-in fade-in">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Crown className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-300 truncate">
                    {pinnedSuperSpark.user.name}
                  </span>
                  <span className="text-[10px] font-mono text-cyan-300 font-bold">
                    +{pinnedSuperSpark.superSparkAmount} ⚡
                  </span>
                </div>
                <p className="text-[11px] text-slate-200 truncate">{pinnedSuperSpark.message}</p>
              </div>
            </div>
          )}

          {/* Chat Stream Messages */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 font-sans">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`text-xs rounded-xl p-2 transition-all ${
                  msg.isSuperSpark
                    ? 'bg-gradient-to-r from-amber-950/40 to-cyan-950/40 border border-amber-500/30 shadow-md'
                    : 'hover:bg-slate-800/30'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1.5">
                    <img
                      src={msg.user.avatar}
                      alt={msg.user.name}
                      className="w-4 h-4 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span className="font-semibold text-slate-300 text-[11px]">
                      {msg.user.handle}
                    </span>
                  </div>

                  {msg.isSuperSpark && (
                    <span className="text-[10px] font-mono font-bold text-amber-400 px-1.5 py-0.2 rounded bg-amber-500/10">
                      {msg.superSparkAmount} ⚡
                    </span>
                  )}
                </div>

                <p className="text-slate-200 text-xs pl-5 leading-relaxed break-words">
                  {msg.message}
                </p>
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input Form */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-900/60 flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Send a chat message..."
              className="flex-1 bg-[#090a0f] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
};
