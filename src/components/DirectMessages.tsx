import React, { useState, useRef, useEffect } from 'react';
import { ChatThread, DirectMessage, User, UserNote } from '../types';
import { CREATORS, INITIAL_NOTES } from '../data/mockData';
import { 
  Search, 
  Send, 
  Image as ImageIcon, 
  Mic, 
  Phone, 
  Video, 
  Info, 
  Heart, 
  CheckCheck, 
  ArrowLeft, 
  SquarePen, 
  Play, 
  Pause, 
  Trash2, 
  X, 
  Bell, 
  BellOff, 
  Share2, 
  Check, 
  ExternalLink,
  MicOff,
  VideoOff,
  PhoneOff,
  Sparkles,
  Music,
  Plus,
  Smile
} from 'lucide-react';

interface DirectMessagesProps {
  chats: ChatThread[];
  currentUser: User;
  onNavigateToFeedPost?: (postId: string) => void;
  onNavigateToSpark?: (sparkId: string) => void;
  onNavigateToTube?: (tubeId: string) => void;
  onGoBack?: () => void;
  onChatsChange?: (chats: ChatThread[]) => void;
}

export const DirectMessages: React.FC<DirectMessagesProps> = ({
  chats,
  currentUser,
  onNavigateToFeedPost,
  onNavigateToSpark,
  onNavigateToTube,
  onGoBack,
  onChatsChange
}) => {
  const [threads, setThreads] = useState<ChatThread[]>(chats);
  const [activeChatId, setActiveChatId] = useState<string>(chats[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'primary' | 'general' | 'requests'>('primary');
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showInfoDrawer, setShowInfoDrawer] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [activeCall, setActiveCall] = useState<{
    type: 'audio' | 'video';
    participant: User;
    status: 'ringing' | 'connected';
    durationSeconds: number;
    isMuted: boolean;
    isVideoOff: boolean;
  } | null>(null);

  // Voice recording state
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceSeconds, setVoiceSeconds] = useState(0);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  // Mobile navigation state: show thread list or active conversation
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Notes Feature State
  const [notes, setNotes] = useState<UserNote[]>(INITIAL_NOTES);
  const [showCreateNoteModal, setShowCreateNoteModal] = useState(false);
  const [noteDraftText, setNoteDraftText] = useState('');
  const [noteDraftMusic, setNoteDraftMusic] = useState('');
  const [activeReplyNote, setActiveReplyNote] = useState<UserNote | null>(null);
  const [noteReplyText, setNoteReplyText] = useState('');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const activeThread = threads.find(t => t.id === activeChatId) || threads[0];

  // Let the app own a persisted snapshot of conversation changes.
  useEffect(() => {
    onChatsChange?.(threads);
  }, [threads, onChatsChange]);

  // Auto scroll to bottom of active conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThread?.messages, isTyping]);

  // Call timer effect
  useEffect(() => {
    if (!activeCall) return;
    const ringTimeout = setTimeout(() => {
      setActiveCall(prev => prev ? { ...prev, status: 'connected' } : null);
    }, 2000);

    const callTimer = setInterval(() => {
      setActiveCall(prev => {
        if (!prev || prev.status !== 'connected') return prev;
        return { ...prev, durationSeconds: prev.durationSeconds + 1 };
      });
    }, 1000);

    return () => {
      clearTimeout(ringTimeout);
      clearInterval(callTimer);
    };
  }, [activeCall?.status]);

  // Voice recording timer
  useEffect(() => {
    let interval: any;
    if (isRecordingVoice) {
      interval = setInterval(() => {
        setVoiceSeconds(s => s + 1);
      }, 1000);
    } else {
      setVoiceSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecordingVoice]);

  const handleSelectThread = (threadId: string) => {
    setActiveChatId(threadId);
    setMobileView('chat');
    // Clear unread badge
    setThreads(prev =>
      prev.map(t => (t.id === threadId ? { ...t, unreadCount: 0 } : t))
    );
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeThread) return;

    const newMsg: DirectMessage = {
      id: `m_${Date.now()}`,
      senderId: currentUser.id,
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    updateThreadMessages(activeThread.id, newMsg);
    setInputText('');
    triggerAutoReply(activeThread.participant);
  };

  const updateThreadMessages = (threadId: string, newMsg: DirectMessage) => {
    setThreads(prev =>
      prev.map(t => {
        if (t.id === threadId) {
          return {
            ...t,
            lastMessage: newMsg.text || 'Media attachment',
            lastTimestamp: 'Just now',
            messages: [...t.messages, newMsg]
          };
        }
        return t;
      })
    );
  };

  const triggerAutoReply = (participant: User) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const responses = [
        "That looks insane! Let's feature this in the next Glitch collab.",
        "Just saw your message! Jumping into the studio now.",
        "🔥 100% on board. Sending over the project stems shortly.",
        "Can't wait to test this on the 4K timeline! ✨"
      ];
      const randomReply = responses[Math.floor(Math.random() * responses.length)];

      const replyMsg: DirectMessage = {
        id: `m_${Date.now() + 1}`,
        senderId: participant.id,
        text: randomReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setThreads(prev =>
        prev.map(t => {
          if (t.participant.id === participant.id) {
            return {
              ...t,
              lastMessage: replyMsg.text,
              lastTimestamp: 'Just now',
              messages: [...t.messages, replyMsg]
            };
          }
          return t;
        })
      );
    }, 1600);
  };

  const handleSendVoiceMemo = () => {
    if (!activeThread) return;
    const durStr = `0:${voiceSeconds < 10 ? '0' : ''}${Math.max(1, voiceSeconds)}`;
    const voiceMsg: DirectMessage = {
      id: `m_${Date.now()}`,
      senderId: currentUser.id,
      text: 'Voice note',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'voice',
      audioDuration: durStr
    };

    updateThreadMessages(activeThread.id, voiceMsg);
    setIsRecordingVoice(false);
    triggerAutoReply(activeThread.participant);
    showToast('Voice memo sent!');
  };

  const handleSendImage = (imgUrl: string, captionText?: string) => {
    if (!activeThread) return;
    const imgMsg: DirectMessage = {
      id: `m_${Date.now()}`,
      senderId: currentUser.id,
      text: captionText || 'Shared an image',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'image',
      mediaUrl: imgUrl
    };

    updateThreadMessages(activeThread.id, imgMsg);
    setShowMediaPicker(false);
    triggerAutoReply(activeThread.participant);
    showToast('Image sent to chat!');
  };

  const handleStartCall = (type: 'audio' | 'video') => {
    if (!activeThread) return;
    setActiveCall({
      type,
      participant: activeThread.participant,
      status: 'ringing',
      durationSeconds: 0,
      isMuted: false,
      isVideoOff: false
    });
  };

  const handleAcceptRequest = (threadId: string) => {
    setThreads(prev =>
      prev.map(t => (t.id === threadId ? { ...t, category: 'primary' } : t))
    );
    showToast('Message request accepted!');
  };

  const handleDeclineRequest = (threadId: string) => {
    setThreads(prev => prev.filter(t => t.id !== threadId));
    showToast('Message request declined');
  };

  const handleReaction = (msgId: string, emoji: string) => {
    setThreads(prev =>
      prev.map(t => {
        if (t.id === activeThread.id) {
          const updated = t.messages.map(m => {
            if (m.id === msgId) {
              const reactions = m.reactions ? [...m.reactions] : [];
              if (reactions.includes(emoji)) {
                return { ...m, reactions: reactions.filter(r => r !== emoji) };
              } else {
                return { ...m, reactions: [...reactions, emoji] };
              }
            }
            return m;
          });
          return { ...t, messages: updated };
        }
        return t;
      })
    );
  };

  // Notes Feature Handlers
  const myNote = notes.find(n => n.userId === currentUser.id);
  const friendNotes = notes.filter(n => n.userId !== currentUser.id);

  const handleOpenCreateNote = () => {
    setNoteDraftText(myNote?.text || '');
    setNoteDraftMusic(myNote?.musicTrack || '');
    setShowCreateNoteModal(true);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteDraftText.trim()) return;

    const trimmedText = noteDraftText.trim().slice(0, 60);
    const existingIndex = notes.findIndex(n => n.userId === currentUser.id);

    if (existingIndex >= 0) {
      const updated = [...notes];
      updated[existingIndex] = {
        ...updated[existingIndex],
        text: trimmedText,
        musicTrack: noteDraftMusic.trim() || undefined,
        timestamp: 'Just now'
      };
      setNotes(updated);
    } else {
      const newNote: UserNote = {
        id: `note_${Date.now()}`,
        userId: currentUser.id,
        user: currentUser,
        text: trimmedText,
        musicTrack: noteDraftMusic.trim() || undefined,
        timestamp: 'Just now'
      };
      setNotes([newNote, ...notes]);
    }

    setShowCreateNoteModal(false);
    showToast('Note updated! Visible to connections for 24h. 💭');
  };

  const handleDeleteMyNote = () => {
    setNotes(prev => prev.filter(n => n.userId !== currentUser.id));
    setShowCreateNoteModal(false);
    showToast('Note removed');
  };

  const handleSendNoteReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReplyNote || !noteReplyText.trim()) return;

    const replyContent = `💭 Replying to note: "${activeReplyNote.text}"\n\n${noteReplyText.trim()}`;
    const newMsg: DirectMessage = {
      id: `m_${Date.now()}`,
      senderId: currentUser.id,
      text: replyContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const existingThread = threads.find(t => t.participant.id === activeReplyNote.userId);

    if (existingThread) {
      updateThreadMessages(existingThread.id, newMsg);
      setActiveChatId(existingThread.id);
      triggerAutoReply(existingThread.participant);
    } else {
      const newThread: ChatThread = {
        id: `c_${Date.now()}`,
        participant: activeReplyNote.user,
        lastMessage: replyContent,
        lastTimestamp: 'Just now',
        unreadCount: 0,
        online: true,
        category: 'primary',
        messages: [newMsg]
      };
      setThreads([newThread, ...threads]);
      setActiveChatId(newThread.id);
      triggerAutoReply(activeReplyNote.user);
    }

    setActiveReplyNote(null);
    setNoteReplyText('');
    setMobileView('chat');
    showToast(`Replied to @${activeReplyNote.user.handle}'s note! 💬`);
  };

  const startNewChat = (creator: User) => {
    const existing = threads.find(t => t.participant.id === creator.id);
    if (existing) {
      setActiveChatId(existing.id);
    } else {
      const newThread: ChatThread = {
        id: `chat_${creator.id}_${Date.now()}`,
        participant: creator,
        lastMessage: 'Started new conversation',
        lastTimestamp: 'Just now',
        unreadCount: 0,
        online: true,
        category: 'primary',
        messages: [
          {
            id: `m_init_${Date.now()}`,
            senderId: creator.id,
            text: `Hey Maya! Excited to connect on Glitch Direct. 🚀`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      };
      setThreads([newThread, ...threads]);
      setActiveChatId(newThread.id);
    }
    setShowNewChatModal(false);
    setMobileView('chat');
    showToast(`Opened chat with @${creator.handle}`);
  };

  // Filter threads by current tab and search query
  const filteredThreads = threads.filter(t => {
    const matchesTab = (t.category || 'primary') === activeTab;
    const matchesSearch = searchQuery === '' ||
      t.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.participant.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const formatCallDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 md:py-6">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-cyan-500/40 text-cyan-300 text-xs px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-md">
          {toastMessage}
        </div>
      )}

      {/* Main Container */}
      <div className="dm-viewport min-h-0 bg-[#0d0f17] border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12 relative">
        
        {/* ================= LEFT COLUMN: INBOX & THREADS ================= */}
        <div className={`md:col-span-5 lg:col-span-4 border-r border-slate-800/80 flex flex-col h-full min-h-0 bg-[#0a0c12] ${
          mobileView === 'chat' ? 'hidden md:flex' : 'flex'
        }`}>
          
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {onGoBack && (
                <button
                  onClick={onGoBack}
                  className="p-1 -ml-1 text-slate-400 hover:text-white rounded-lg transition-colors"
                  aria-label="Back to previous page"
                  title="Back to previous page"
                >
                  <ArrowLeft className="w-5 h-5 text-cyan-400" />
                </button>
              )}
              <span className="text-base font-bold text-white font-['Outfit']">
                Direct
              </span>
              <span className="text-xs text-slate-400 font-mono">
                @{currentUser.handle}
              </span>
            </div>

            <button
              onClick={() => setShowNewChatModal(true)}
              className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white flex items-center justify-center transition-colors shadow-sm"
              title="New Message"
            >
              <SquarePen className="w-4 h-4 text-cyan-400" />
            </button>
          </div>

          {/* ================= NOTES BAR ================= */}
          <div className="p-3 border-b border-slate-800/80 bg-slate-950/40">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>Notes</span>
                <span className="text-[10px] font-mono font-normal text-slate-500">24h</span>
              </span>
              <button
                onClick={handleOpenCreateNote}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>{myNote ? 'Edit note' : 'Share thought'}</span>
              </button>
            </div>

            <div className="flex items-start gap-3 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800">
              
              {/* Current User Note */}
              <div
                onClick={handleOpenCreateNote}
                className="flex flex-col items-center shrink-0 cursor-pointer group w-20"
                title={myNote ? 'Tap to edit your note' : 'Tap to share a thought'}
              >
                {/* Note Bubble Above Avatar */}
                <div className="relative mb-2 flex justify-center w-full min-h-[44px] items-end">
                  {myNote ? (
                    <div className="bg-slate-800/95 border border-cyan-500/50 text-slate-100 text-[10px] leading-tight px-2 py-1.5 rounded-2xl shadow-lg max-w-[80px] text-center line-clamp-2 backdrop-blur-sm group-hover:border-cyan-400 transition-all">
                      <span className="line-clamp-2">{myNote.text}</span>
                      {myNote.musicTrack && (
                        <div className="flex items-center justify-center gap-0.5 text-[9px] text-cyan-300 mt-0.5 font-mono">
                          <Music className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate max-w-[58px]">{myNote.musicTrack}</span>
                        </div>
                      )}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-slate-800 rotate-45 border-r border-b border-cyan-500/50" />
                    </div>
                  ) : (
                    <div className="bg-slate-900/90 border border-dashed border-slate-700 text-slate-400 text-[9px] leading-tight px-2 py-1 rounded-xl max-w-[76px] text-center group-hover:border-cyan-400 group-hover:text-slate-200 transition-colors">
                      Share thought...
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-slate-900 rotate-45 border-r border-b border-dashed border-slate-700" />
                    </div>
                  )}
                </div>

                {/* Avatar */}
                <div className="relative w-12 h-12">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-cyan-500/50 group-hover:ring-cyan-400 transition-all"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center font-bold shadow-md ring-2 ring-[#0a0c12]">
                    <Plus className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                </div>

                <span className="text-[10px] text-slate-300 font-medium mt-1 truncate max-w-[74px] text-center">
                  Your note
                </span>
              </div>

              {/* Friends' Notes */}
              {friendNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => {
                    setActiveReplyNote(note);
                    setNoteReplyText('');
                  }}
                  className="flex flex-col items-center shrink-0 cursor-pointer group w-20"
                  title={`Tap to reply to ${note.user.name}'s note`}
                >
                  {/* Friend Note Bubble */}
                  <div className="relative mb-2 flex justify-center w-full min-h-[44px] items-end">
                    <div className="bg-slate-800/95 border border-slate-700 group-hover:border-cyan-400 text-slate-100 text-[10px] leading-tight px-2 py-1.5 rounded-2xl shadow-lg max-w-[80px] text-center line-clamp-2 backdrop-blur-sm group-hover:scale-105 transition-all">
                      <span className="line-clamp-2">{note.text}</span>
                      {note.musicTrack && (
                        <div className="flex items-center justify-center gap-0.5 text-[9px] text-fuchsia-300 mt-0.5 font-mono">
                          <Music className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate max-w-[58px]">{note.musicTrack}</span>
                        </div>
                      )}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-slate-800 rotate-45 border-r border-b border-slate-700 group-hover:border-cyan-400" />
                    </div>
                  </div>

                  {/* Avatar with Online Badge */}
                  <div className="relative w-12 h-12">
                    <img
                      src={note.user.avatar}
                      alt={note.user.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-700 group-hover:ring-cyan-400 group-hover:scale-105 transition-all"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#0a0c12]" />
                  </div>

                  <span className="text-[10px] text-slate-400 group-hover:text-white font-medium mt-1 truncate max-w-[74px] text-center">
                    {note.user.name.split(' ')[0]}
                  </span>
                </div>
              ))}

            </div>
          </div>

          {/* Category Tabs: Primary / General / Requests */}
          <div className="flex items-center border-b border-slate-800/80 px-2 pt-1 text-xs">
            <button
              onClick={() => setActiveTab('primary')}
              className={`flex-1 py-2.5 font-semibold text-center transition-colors relative ${
                activeTab === 'primary' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Primary
              {activeTab === 'primary' && (
                <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-cyan-400 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('general')}
              className={`flex-1 py-2.5 font-semibold text-center transition-colors relative ${
                activeTab === 'general' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              General
              {activeTab === 'general' && (
                <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-cyan-400 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 py-2.5 font-semibold text-center transition-colors relative flex items-center justify-center gap-1 ${
                activeTab === 'requests' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Requests</span>
              {threads.filter(t => t.category === 'requests').length > 0 && (
                <span className="w-4 h-4 rounded-full bg-cyan-500 text-slate-950 text-[9px] font-bold flex items-center justify-center">
                  {threads.filter(t => t.category === 'requests').length}
                </span>
              )}
              {activeTab === 'requests' && (
                <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-cyan-400 rounded-full" />
              )}
            </button>
          </div>

          {/* Search Conversations */}
          <div className="p-3 border-b border-slate-800/60">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages & creators..."
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Thread List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
            {filteredThreads.length === 0 ? (
              <div className="text-center p-8 text-slate-500 text-xs space-y-2">
                <p>No conversations in {activeTab}</p>
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="text-cyan-400 hover:underline font-semibold"
                >
                  Start a new conversation
                </button>
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const isSelected = thread.id === activeThread?.id;

                return (
                  <div
                    key={thread.id}
                    onClick={() => handleSelectThread(thread.id)}
                    className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                      isSelected ? 'bg-slate-800/70 border-l-2 border-cyan-400' : 'hover:bg-slate-900/50'
                    }`}
                  >
                    {/* Avatar with online dot */}
                    <div className="relative shrink-0">
                      <img
                        src={thread.participant.avatar}
                        alt={thread.participant.name}
                        className="w-12 h-12 rounded-full object-cover ring-1 ring-slate-700"
                        referrerPolicy="no-referrer"
                      />
                      {thread.online && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#0a0c12]" />
                      )}
                    </div>

                    {/* Meta */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white truncate flex items-center gap-1">
                          {thread.participant.name}
                          {thread.participant.verified && (
                            <span className="w-3 h-3 rounded-full bg-cyan-400 text-slate-950 text-[8px] flex items-center justify-center font-bold">
                              ✓
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {thread.lastTimestamp}
                        </span>
                      </div>

                      <p className={`text-xs mt-0.5 truncate ${
                        thread.unreadCount > 0 ? 'text-white font-semibold' : 'text-slate-400'
                      }`}>
                        {thread.lastMessage}
                      </p>
                    </div>

                    {/* Unread indicator */}
                    {thread.unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-slate-950 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {thread.unreadCount}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* ================= RIGHT COLUMN: ACTIVE CONVERSATION ================= */}
        {activeThread ? (
          <div className={`md:col-span-7 lg:col-span-8 flex flex-col h-full min-h-0 bg-[#0d0f17] ${
            mobileView === 'list' ? 'hidden md:flex' : 'flex'
          }`}>
            
            {/* Chat Top Bar */}
            <div className="p-3.5 md:p-4 border-b border-slate-800 flex items-center justify-between bg-[#0d0f17]/95 backdrop-blur-md">
              <div className="flex items-center gap-3 min-w-0">
                
                {/* Mobile Back Button to Thread List */}
                <button
                  onClick={() => setMobileView('list')}
                  className="md:hidden p-1.5 -ml-1 text-slate-400 hover:text-white rounded-lg transition-colors"
                  aria-label="Back to chats"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                {/* Participant Avatar */}
                <div className="relative shrink-0">
                  <img
                    src={activeThread.participant.avatar}
                    alt={activeThread.participant.name}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-700"
                    referrerPolicy="no-referrer"
                  />
                  {activeThread.online && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0d0f17]" />
                  )}
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-1.5 truncate">
                    {activeThread.participant.name}
                    {activeThread.participant.verified && (
                      <span className="w-3.5 h-3.5 rounded-full bg-cyan-400 text-slate-950 text-[9px] flex items-center justify-center font-bold">
                        ✓
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400 truncate">
                    {activeThread.online ? (
                      <span className="text-emerald-400 font-medium">Online</span>
                    ) : (
                      `@${activeThread.participant.handle}`
                    )}
                  </p>
                </div>
              </div>

              {/* Action Buttons: Audio Call, Video Call, Chat Info */}
              <div className="flex items-center gap-1.5 text-slate-300">
                <button
                  onClick={() => handleStartCall('audio')}
                  className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-300 hover:text-cyan-400"
                  title="Voice call"
                  aria-label="Start voice call"
                >
                  <Phone className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleStartCall('video')}
                  className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-300 hover:text-fuchsia-400"
                  title="Video call"
                  aria-label="Start video call"
                >
                  <Video className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setShowInfoDrawer(!showInfoDrawer)}
                  className={`p-2 hover:bg-slate-800 rounded-xl transition-colors ${
                    showInfoDrawer ? 'text-cyan-400 bg-slate-800' : 'text-slate-300 hover:text-white'
                  }`}
                  title="Conversation info"
                  aria-label="Conversation info"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Request Acceptance Bar (if in requests tab) */}
            {activeThread.category === 'requests' && (
              <div className="p-3 bg-amber-950/40 border-b border-amber-600/30 flex items-center justify-between gap-4 text-xs">
                <div>
                  <p className="font-semibold text-amber-200">
                    Message request from @{activeThread.participant.handle}
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    Do you want to let @{activeThread.participant.handle} message you?
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeclineRequest(activeThread.id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => handleAcceptRequest(activeThread.id)}
                    className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
                  >
                    Accept
                  </button>
                </div>
              </div>
            )}

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {/* Creator Intro Banner */}
              <div className="text-center py-6 border-b border-slate-800/60 max-w-sm mx-auto space-y-2">
                <img
                  src={activeThread.participant.avatar}
                  alt={activeThread.participant.name}
                  className="w-16 h-16 rounded-full mx-auto object-cover ring-2 ring-cyan-500/40"
                  referrerPolicy="no-referrer"
                />
                <h4 className="text-sm font-bold text-white">
                  {activeThread.participant.name}
                </h4>
                <p className="text-xs text-slate-400">
                  @{activeThread.participant.handle} · {activeThread.participant.followersCount.toLocaleString()} followers
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {activeThread.participant.bio}
                </p>
              </div>

              {/* Message Bubbles */}
              {activeThread.messages.map((msg) => {
                const isMe = msg.senderId === currentUser.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="relative flex items-center gap-2 max-w-[85%] md:max-w-[70%]">
                      
                      {/* Emoji reaction picker on hover */}
                      <div className={`hidden group-hover:flex items-center gap-1 bg-slate-800/95 border border-slate-700 rounded-full px-2 py-0.5 shadow-lg z-10 ${
                        isMe ? 'order-first' : 'order-last'
                      }`}>
                        {['❤️', '🔥', '👍', '😂', '😮'].map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleReaction(msg.id, emoji)}
                            className="text-xs hover:scale-125 transition-transform"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>

                      {/* Content variations */}
                      {msg.type === 'image' && msg.mediaUrl ? (
                        <div className="rounded-2xl overflow-hidden border border-slate-700/80 bg-black shadow-md">
                          <img
                            src={msg.mediaUrl}
                            alt="Shared"
                            className="w-64 max-w-full h-auto object-cover"
                            referrerPolicy="no-referrer"
                          />
                          {msg.text && (
                            <p className="p-2.5 text-xs text-white bg-slate-900/90">
                              {msg.text}
                            </p>
                          )}
                        </div>
                      ) : msg.type === 'voice' ? (
                        /* Voice Note Player Bubble */
                        <div className={`flex items-center gap-3 p-3 rounded-2xl shadow-sm ${
                          isMe
                            ? 'bg-gradient-to-r from-fuchsia-600 to-cyan-600 text-white'
                            : 'bg-slate-800 text-slate-200 border border-slate-700/60'
                        }`}>
                          <button
                            onClick={() => setPlayingVoiceId(playingVoiceId === msg.id ? null : msg.id)}
                            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                          >
                            {playingVoiceId === msg.id ? (
                              <Pause className="w-4 h-4 fill-white" />
                            ) : (
                              <Play className="w-4 h-4 ml-0.5 fill-white" />
                            )}
                          </button>
                          
                          {/* Animated Voice Waveform bars */}
                          <div className="flex items-center gap-1 h-6">
                            {[40, 75, 55, 90, 60, 85, 45, 95, 70, 50, 80, 65].map((h, idx) => (
                              <span
                                key={idx}
                                className={`w-1 rounded-full bg-white/80 transition-all ${
                                  playingVoiceId === msg.id ? 'animate-pulse' : ''
                                }`}
                                style={{ height: `${h}%` }}
                              />
                            ))}
                          </div>

                          <span className="text-[11px] font-mono tabular-nums opacity-90">
                            {msg.audioDuration || '0:14'}
                          </span>
                        </div>
                      ) : msg.type === 'shared_media' && msg.sharedMedia ? (
                        /* Shared Post Card */
                        <div
                          onClick={() => {
                            if (msg.sharedMedia?.mediaType === 'spark') {
                              onNavigateToSpark?.(msg.sharedMedia.id);
                            } else if (msg.sharedMedia?.mediaType === 'tube') {
                              onNavigateToTube?.(msg.sharedMedia.id);
                            } else {
                              onNavigateToFeedPost?.(msg.sharedMedia?.id || '');
                            }
                          }}
                          className="rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-900 cursor-pointer hover:border-cyan-400/60 transition-colors shadow-md max-w-xs"
                        >
                          <div className="relative aspect-video bg-black overflow-hidden">
                            <img
                              src={msg.sharedMedia.thumbnail}
                              alt={msg.sharedMedia.title}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 backdrop-blur-sm rounded text-[10px] text-cyan-400 font-semibold uppercase">
                              {msg.sharedMedia.mediaType}
                            </span>
                          </div>
                          <div className="p-3">
                            <p className="text-xs font-semibold text-white line-clamp-2">
                              {msg.sharedMedia.title}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-1">
                              by @{msg.sharedMedia.authorHandle}
                            </p>
                          </div>
                        </div>
                      ) : (
                        /* Standard Text Bubble */
                        <div
                          className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed break-words shadow-sm ${
                            isMe
                              ? 'bg-gradient-to-r from-fuchsia-600 to-cyan-600 text-white rounded-br-xs'
                              : 'bg-slate-800 text-slate-100 rounded-bl-xs border border-slate-700/60'
                          }`}
                        >
                          {msg.text}
                        </div>
                      )}
                    </div>

                    {/* Reactions Pill Display */}
                    {msg.reactions && msg.reactions.length > 0 && (
                      <div className="flex items-center gap-1 mt-1 bg-slate-900/90 border border-slate-700 rounded-full px-2 py-0.5 text-[10px] shadow-sm">
                        {msg.reactions.map((r, i) => (
                          <span key={i}>{r}</span>
                        ))}
                      </div>
                    )}

                    {/* Timestamp & Read Receipt */}
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono mt-1 px-1">
                      <span>{msg.timestamp}</span>
                      {isMe && <CheckCheck className="w-3 h-3 text-cyan-400" />}
                    </div>
                  </div>
                );
              })}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-center gap-2 text-slate-400 text-xs pl-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce delay-100" />
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce delay-200" />
                  </div>
                  <span>{activeThread.participant.name} is typing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar or Voice Recording Overlay */}
            <div className="p-3 border-t border-slate-800 bg-[#090a0f]">
              {isRecordingVoice ? (
                /* Active Voice Recording UI */
                <div className="flex items-center justify-between bg-slate-900/90 border border-cyan-500/40 rounded-full px-4 py-2 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                    <span className="font-mono text-white tabular-nums">
                      0:{voiceSeconds < 10 ? '0' : ''}{voiceSeconds}
                    </span>
                    <span className="text-slate-400">Recording voice memo...</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsRecordingVoice(false)}
                      className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                      title="Cancel recording"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleSendVoiceMemo}
                      className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-full transition-colors flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Regular Text Input UI */
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowMediaPicker(true)}
                    className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
                    title="Send image"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsRecordingVoice(true)}
                    className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
                    title="Record voice note"
                  >
                    <Mic className="w-5 h-5" />
                  </button>

                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`Message @${activeThread.participant.handle}...`}
                    className="flex-1 bg-slate-900 border border-slate-700/80 rounded-full px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                  />

                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="w-9 h-9 rounded-full bg-gradient-to-r from-fuchsia-600 to-cyan-500 hover:opacity-90 disabled:opacity-40 text-white flex items-center justify-center transition-opacity shrink-0"
                    aria-label="Send message"
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </form>
              )}
            </div>

          </div>
        ) : (
          <div className="md:col-span-7 flex flex-col items-center justify-center text-center p-8 text-slate-500">
            <p>Select a conversation to start chatting</p>
          </div>
        )}

        {/* ================= RIGHT SLIDE DRAWER: CHAT INFO ================= */}
        {showInfoDrawer && activeThread && (
          <div className="absolute top-0 right-0 bottom-0 w-80 bg-[#0a0c12] border-l border-slate-800 z-30 p-5 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h4 className="text-sm font-bold text-white font-['Outfit']">
                  Chat Details
                </h4>
                <button
                  onClick={() => setShowInfoDrawer(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Creator Card */}
              <div className="text-center space-y-2">
                <img
                  src={activeThread.participant.avatar}
                  alt={activeThread.participant.name}
                  className="w-20 h-20 rounded-full mx-auto object-cover ring-2 ring-cyan-500"
                  referrerPolicy="no-referrer"
                />
                <h5 className="text-sm font-semibold text-white">
                  {activeThread.participant.name}
                </h5>
                <p className="text-xs text-cyan-400 font-mono">
                  @{activeThread.participant.handle}
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeThread.participant.bio}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
                  <span className="text-slate-300">Mute Notifications</span>
                  <button className="text-slate-400 hover:text-white">
                    <BellOff className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
                  <span className="text-slate-300">Shared Photos & Clips</span>
                  <span className="font-mono text-cyan-400">14 files</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
                  <span className="text-slate-300">Encryption Status</span>
                  <span className="text-emerald-400">End-to-End</span>
                </div>
              </div>

            </div>

            <button
              onClick={() => {
                showToast('User blocked on Glitch');
                setShowInfoDrawer(false);
              }}
              className="w-full py-2 rounded-xl text-xs font-semibold text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-colors"
            >
              Block @{activeThread.participant.handle}
            </button>
          </div>
        )}

      </div>

      {/* ================= MODAL: START NEW CHAT ================= */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d0f17] border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-150 space-y-4">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white font-['Outfit']">
                New Direct Message
              </h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Select a creator from your network or discover new voices:
            </p>

            {/* Creators list */}
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {Object.values(CREATORS).map((creator) => (
                <div
                  key={creator.id}
                  onClick={() => startNewChat(creator)}
                  className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-800/80 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={creator.avatar}
                      alt={creator.name}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-700"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <p className="text-xs font-semibold text-white flex items-center gap-1">
                        {creator.name}
                        {creator.verified && (
                          <span className="w-3 h-3 rounded-full bg-cyan-400 text-slate-950 text-[8px] flex items-center justify-center font-bold">
                            ✓
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        @{creator.handle}
                      </p>
                    </div>
                  </div>

                  <button className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/30">
                    Chat
                  </button>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* ================= MODAL: MEDIA ATTACHMENT PICKER ================= */}
      {showMediaPicker && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d0f17] border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-150 space-y-4">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white font-['Outfit']">
                Send Media in Direct
              </h3>
              <button
                onClick={() => setShowMediaPicker(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Pick a high-definition photo or studio capture to share:
            </p>

            <div className="grid grid-cols-2 gap-3">
              {[
                { title: 'Tokyo Nightway', url: '/src/assets/images/glitch_synthwave_thumb_1793019149342.jpg' },
                { title: 'Battlestation Setup', url: '/src/assets/images/glitch_tech_desk_1793019176039.jpg' },
                { title: 'Freestyle Dance Move', url: '/src/assets/images/glitch_reel_dance_1793019162678.jpg' },
                { title: 'Cyber Creator Portrait', url: '/src/assets/images/glitch_creator_avatar_1793019134231.jpg' }
              ].map((media, i) => (
                <div
                  key={i}
                  onClick={() => handleSendImage(media.url, `Check this out: ${media.title}`)}
                  className="group relative aspect-video bg-black rounded-xl overflow-hidden cursor-pointer border border-slate-800 hover:border-cyan-400 transition-all"
                >
                  <img
                    src={media.url}
                    alt={media.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                    <span className="text-[11px] font-semibold text-white truncate">
                      {media.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* ================= MODAL: GLITCH CALL SIMULATOR ================= */}
      {activeCall && (
        <div className="fixed inset-0 z-50 bg-[#07080c]/95 backdrop-blur-xl flex flex-col items-center justify-between p-8 select-none animate-in fade-in zoom-in-95 duration-200">
          
          {/* Top Call Info */}
          <div className="text-center space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
              Glitch Encrypted {activeCall.type === 'video' ? 'Video' : 'Voice'} Call
            </span>
            <p className="text-xs text-slate-400 font-mono">
              {activeCall.status === 'ringing'
                ? 'Connecting to satellite relay...'
                : `Connected · ${formatCallDuration(activeCall.durationSeconds)}`}
            </p>
          </div>

          {/* Central Visualizer */}
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              {/* Pulsing ring aura */}
              <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping" />
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-gradient-to-tr from-cyan-400 via-indigo-500 to-fuchsia-500 shadow-2xl shadow-cyan-500/20">
                <img
                  src={activeCall.participant.avatar}
                  alt={activeCall.participant.name}
                  className="w-full h-full rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-white font-['Outfit']">
                {activeCall.participant.name}
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                @{activeCall.participant.handle}
              </p>
            </div>

            {/* Audio frequency wave visualizer */}
            {activeCall.status === 'connected' && (
              <div className="flex items-center gap-1.5 h-8">
                {[30, 60, 90, 45, 100, 75, 40, 85, 95, 60, 80, 50, 70, 40].map((h, i) => (
                  <span
                    key={i}
                    className="w-1 bg-gradient-to-t from-cyan-400 to-fuchsia-500 rounded-full animate-pulse"
                    style={{
                      height: `${h}%`,
                      animationDelay: `${i * 100}ms`
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Bottom Call Controls */}
          <div className="flex items-center gap-6">
            {/* Mute Mic */}
            <button
              onClick={() => setActiveCall({ ...activeCall, isMuted: !activeCall.isMuted })}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors shadow-lg ${
                activeCall.isMuted
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
              title={activeCall.isMuted ? 'Unmute' : 'Mute'}
            >
              {activeCall.isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            {/* End Call */}
            <button
              onClick={() => {
                setActiveCall(null);
                showToast('Call ended');
              }}
              className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition-transform active:scale-95 shadow-xl shadow-red-600/30"
              title="End Call"
            >
              <PhoneOff className="w-7 h-7" />
            </button>

            {/* Camera Toggle */}
            <button
              onClick={() => setActiveCall({ ...activeCall, isVideoOff: !activeCall.isVideoOff })}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors shadow-lg ${
                activeCall.isVideoOff
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
              title={activeCall.isVideoOff ? 'Enable Camera' : 'Disable Camera'}
            >
              {activeCall.isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
            </button>
          </div>

        </div>
      )}

      {/* ================= MODAL: SHARE / EDIT NOTE ================= */}
      {showCreateNoteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#0d0f17] border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative space-y-5 animate-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white font-['Outfit']">
                  {myNote ? 'Edit Your Note' : 'Share a Note'}
                </span>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-mono px-2 py-0.5 rounded-full">
                  24 Hours
                </span>
              </div>
              <button
                onClick={() => setShowCreateNoteModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Interactive Note Bubble Live Preview */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 flex flex-col items-center justify-center min-h-[140px]">
              <div className="relative mb-2 flex justify-center w-full">
                <div className="bg-slate-800/95 border border-cyan-400/80 text-white text-xs leading-relaxed px-3.5 py-2 rounded-2xl shadow-xl max-w-[220px] text-center backdrop-blur-md">
                  <p className="font-medium break-words">
                    {noteDraftText.trim() || "Share what's on your mind..."}
                  </p>
                  {noteDraftMusic && (
                    <div className="flex items-center justify-center gap-1 text-[11px] text-cyan-300 mt-1 font-mono">
                      <Music className="w-3 h-3 shrink-0 animate-pulse" />
                      <span className="truncate">{noteDraftMusic}</span>
                    </div>
                  )}
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-800 rotate-45 border-r border-b border-cyan-400/80" />
                </div>
              </div>

              <div className="relative w-14 h-14 mt-1">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-cyan-400 shadow-lg"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-xs font-semibold text-slate-300 mt-1.5">
                {currentUser.name}
              </span>
            </div>

            {/* Text Input Form */}
            <form onSubmit={handleSaveNote} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5 text-xs">
                  <label className="text-slate-300 font-medium">Your thought</label>
                  <span className={`font-mono ${60 - noteDraftText.length < 10 ? 'text-amber-400' : 'text-slate-400'}`}>
                    {60 - noteDraftText.length} left
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={60}
                  value={noteDraftText}
                  onChange={(e) => setNoteDraftText(e.target.value)}
                  placeholder="Share a status, quote, or plan..."
                  className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                  autoFocus
                />
              </div>

              {/* Music Attachment Picker */}
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1.5">
                  Attach audio or track (optional)
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {[
                    'Nightcall (Glitch Remix)',
                    'Midnight Expressway',
                    'Hyperdrive Bassline',
                    'Analog Dreams Vol. 2'
                  ].map((track) => (
                    <button
                      key={track}
                      type="button"
                      onClick={() => setNoteDraftMusic(noteDraftMusic === track ? '' : track)}
                      className={`text-[10px] px-2.5 py-1 rounded-lg border font-mono transition-colors flex items-center gap-1 ${
                        noteDraftMusic === track
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <Music className="w-2.5 h-2.5" />
                      {track}
                    </button>
                  ))}
                </div>
                {noteDraftMusic && (
                  <div className="flex items-center justify-between bg-slate-900 border border-cyan-500/30 px-3 py-1.5 rounded-lg text-xs text-cyan-300">
                    <span className="truncate text-[11px] font-mono">🎵 {noteDraftMusic}</span>
                    <button
                      type="button"
                      onClick={() => setNoteDraftMusic('')}
                      className="text-slate-400 hover:text-white text-xs ml-2"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                {myNote ? (
                  <button
                    type="button"
                    onClick={handleDeleteMyNote}
                    className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 px-3 py-2 rounded-xl hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete note</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateNoteModal(false)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!noteDraftText.trim()}
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 disabled:hover:from-cyan-500 text-slate-950 font-bold transition-all shadow-lg shadow-cyan-500/20"
                  >
                    Share Note
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ================= MODAL: REPLY TO FRIEND NOTE ================= */}
      {activeReplyNote && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#0d0f17] border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative space-y-4 animate-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-base font-bold text-white font-['Outfit']">
                Reply to Note
              </span>
              <button
                onClick={() => setActiveReplyNote(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Friend's Note Bubble Showcase */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
              <div className="relative shrink-0">
                <img
                  src={activeReplyNote.user.avatar}
                  alt={activeReplyNote.user.name}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-cyan-500/40"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-[#0a0c12]" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs font-bold text-white truncate">
                    {activeReplyNote.user.name}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono truncate">
                    @{activeReplyNote.user.handle}
                  </span>
                </div>

                <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-2.5 shadow-sm text-xs text-slate-100">
                  <p className="font-medium">{activeReplyNote.text}</p>
                  {activeReplyNote.musicTrack && (
                    <div className="flex items-center gap-1 text-[10px] text-fuchsia-300 mt-1 font-mono">
                      <Music className="w-3 h-3 shrink-0" />
                      <span className="truncate">{activeReplyNote.musicTrack}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Emoji Reactions */}
            <div className="flex items-center justify-center gap-2 pt-1">
              {['🔥', '👏', '❤️', '😂', '✨', '⚡'].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setNoteReplyText(prev => `${prev} ${emoji}`.trim())}
                  className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 hover:border-cyan-400 hover:scale-110 flex items-center justify-center text-base transition-all"
                  title={`Add ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Reply Form */}
            <form onSubmit={handleSendNoteReply} className="space-y-3 pt-1">
              <div className="relative">
                <input
                  type="text"
                  value={noteReplyText}
                  onChange={(e) => setNoteReplyText(e.target.value)}
                  placeholder={`Send message to ${activeReplyNote.user.name}...`}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl pl-4 pr-11 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none transition-colors"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!noteReplyText.trim()}
                  className="absolute right-2 top-2 p-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 disabled:hover:bg-cyan-500 text-slate-950 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveReplyNote(null)}
                  className="px-4 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!noteReplyText.trim()}
                  className="px-4 py-1.5 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 rounded-xl transition-colors"
                >
                  Send Reply
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

