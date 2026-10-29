import React, { useState } from 'react';
import { User, FeedPost, SparkReel, CinemaVideo, UserStory } from '../types';
import { X, Flame, Image as ImageIcon, PlaySquare, Sparkles, Music, MapPin, Tag, Film, Check } from 'lucide-react';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onPublishFeedPost: (post: FeedPost) => void;
  onPublishSpark: (spark: SparkReel) => void;
  onPublishCinemaVideo: (video: CinemaVideo) => void;
  onPublishStory: (story: UserStory) => void;
}

export const CreateModal: React.FC<CreateModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onPublishFeedPost,
  onPublishSpark,
  onPublishCinemaVideo,
  onPublishStory
}) => {
  const [contentType, setContentType] = useState<'feed' | 'spark' | 'tube' | 'story'>('spark');
  const [caption, setCaption] = useState('');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('Tech & Hardware');
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [filterStyle, setFilterStyle] = useState<'none' | 'cyber' | 'noir' | 'warm'>('none');
  const [selectedSound, setSelectedSound] = useState('Glitch Beats Vol. 4');

  if (!isOpen) return null;

  // Curated media presets for instant rich publishing
  const mediaPresets = [
    {
      title: 'Neon Tokyo Expressway',
      url: '/src/assets/images/glitch_synthwave_thumb_1793019149342.jpg',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
    },
    {
      title: 'Cyberpunk Battlestation',
      url: '/src/assets/images/glitch_tech_desk_1793019176039.jpg',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    },
    {
      title: 'Street Freestyle Dance',
      url: '/src/assets/images/glitch_reel_dance_1793019162678.jpg',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
    },
    {
      title: 'Cyber Creator Portrait',
      url: '/src/assets/images/glitch_creator_avatar_1793019134231.jpg',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
    }
  ];

  const selectedMedia = mediaPresets[selectedPresetIndex];

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();

    if (contentType === 'spark') {
      const newSpark: SparkReel = {
        id: `spark_${Date.now()}`,
        author: currentUser,
        videoUrl: selectedMedia.videoUrl,
        posterUrl: selectedMedia.url,
        caption: caption || 'Fresh drop on Glitch Sparks! #cybervibes',
        tags: ['glitch', 'sparks', 'newrelease'],
        soundTitle: selectedSound,
        soundArtist: currentUser.name,
        soundCover: selectedMedia.url,
        likesCount: 1,
        isLiked: true,
        isSaved: false,
        commentsCount: 0,
        sharesCount: 0,
        comments: [],
        timestamp: 'Just now'
      };
      onPublishSpark(newSpark);
    } else if (contentType === 'feed') {
      const newPost: FeedPost = {
        id: `post_${Date.now()}`,
        author: currentUser,
        images: [selectedMedia.url],
        caption: caption || 'New visual from the studio. Thoughts on this aesthetic?',
        location: location || 'Tokyo, Japan',
        soundTitle: selectedSound,
        soundArtist: currentUser.name,
        likesCount: 1,
        isLiked: true,
        isSaved: false,
        commentsCount: 0,
        timestamp: 'Just now',
        tags: ['glitch', 'creator', 'visualart'],
        comments: []
      };
      onPublishFeedPost(newPost);
    } else if (contentType === 'tube') {
      const newVideo: CinemaVideo = {
        id: `cinema_${Date.now()}`,
        title: title || 'Deep Dive: Future of Creative Web Architecture',
        description: caption || 'Detailed breakdown of our latest production build and audio synthesis.',
        videoUrl: selectedMedia.videoUrl,
        thumbnailUrl: selectedMedia.url,
        duration: '14:30',
        viewsCount: '1',
        uploadedAt: 'Just now',
        channel: currentUser,
        isSubscribed: false,
        likesCount: 1,
        isLiked: true,
        isDisliked: false,
        category: category,
        tags: ['glitch', 'creator', 'masterclass'],
        commentsCount: 0,
        comments: []
      };
      onPublishCinemaVideo(newVideo);
    } else if (contentType === 'story') {
      const newStory: UserStory = {
        userId: currentUser.id,
        user: currentUser,
        hasUnseen: true,
        items: [
          {
            id: `story_me_${Date.now()}`,
            mediaUrl: selectedMedia.url,
            type: 'image',
            durationSeconds: 5,
            timestamp: 'Just now',
            caption: caption || 'Live in the Glitch studio!'
          }
        ]
      };
      onPublishStory(newStory);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-[#0d0f17] border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white font-['Outfit']">
              Glitch Creator Studio
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Type Selector */}
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Select Publishing Channel
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              
              <button
                type="button"
                onClick={() => setContentType('spark')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-xs font-medium ${
                  contentType === 'spark'
                    ? 'bg-fuchsia-950/40 border-fuchsia-500 text-white shadow-md shadow-fuchsia-500/10'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <Flame className={`w-6 h-6 mb-1 ${contentType === 'spark' ? 'text-fuchsia-400' : ''}`} />
                <span>Sparks</span>
                <span className="text-[10px] text-slate-500">9:16 Vertical</span>
              </button>

              <button
                type="button"
                onClick={() => setContentType('feed')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-xs font-medium ${
                  contentType === 'feed'
                    ? 'bg-indigo-950/40 border-cyan-400 text-white shadow-md shadow-cyan-500/10'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <ImageIcon className={`w-6 h-6 mb-1 ${contentType === 'feed' ? 'text-cyan-400' : ''}`} />
                <span>Photo Feed</span>
                <span className="text-[10px] text-slate-500">Photo / Carousel</span>
              </button>

              <button
                type="button"
                onClick={() => setContentType('tube')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-xs font-medium ${
                  contentType === 'tube'
                    ? 'bg-red-950/40 border-red-500 text-white shadow-md shadow-red-500/10'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <PlaySquare className={`w-6 h-6 mb-1 ${contentType === 'tube' ? 'text-red-400' : ''}`} />
                <span>Cinema Video</span>
                <span className="text-[10px] text-slate-500">16:9 Long-form</span>
              </button>

              <button
                type="button"
                onClick={() => setContentType('story')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-xs font-medium ${
                  contentType === 'story'
                    ? 'bg-amber-950/40 border-amber-400 text-white shadow-md shadow-amber-500/10'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <Film className={`w-6 h-6 mb-1 ${contentType === 'story' ? 'text-amber-400' : ''}`} />
                <span>Story Reel</span>
                <span className="text-[10px] text-slate-500">24-Hour Ephemeral</span>
              </button>

            </div>
          </div>

          {/* Form */}
          <form onSubmit={handlePublish} className="space-y-5 text-xs">
            
            {/* Title (Only for Cinema) */}
            {contentType === 'tube' && (
              <div>
                <label className="block text-slate-300 mb-1.5 font-medium">Video Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Tokyo 2099: Cyberpunk City Documentary in 4K"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>
            )}

            {/* Media Asset Picker */}
            <div>
              <label className="block text-slate-300 mb-2 font-medium">
                Choose High-Definition Asset
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {mediaPresets.map((preset, idx) => (
                  <div
                    key={preset.title}
                    onClick={() => setSelectedPresetIndex(idx)}
                    className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all aspect-video group ${
                      selectedPresetIndex === idx
                        ? 'border-cyan-400 ring-2 ring-cyan-400/30'
                        : 'border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                      <span className="text-[10px] font-medium text-white truncate">
                        {preset.title}
                      </span>
                    </div>
                    {selectedPresetIndex === idx && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center font-bold text-[10px]">
                        ✓
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Caption / Description */}
            <div>
              <label className="block text-slate-300 mb-1.5 font-medium">
                {contentType === 'tube' ? 'Video Description & Timestamps' : 'Caption & Hashtags'}
              </label>
              <textarea
                rows={3}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder={
                  contentType === 'tube'
                    ? 'Breakdown of our latest production build...\n0:00 - Introduction\n2:15 - Deep Dive'
                    : 'Describe your drop... #glitch #cyberpunk #viral'
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
              />
            </div>

            {/* Audio Track Selector (Sparks and Feeds) */}
            {(contentType === 'spark' || contentType === 'feed') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1.5 font-medium flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-cyan-400" />
                    Sound Attribution
                  </label>
                  <select
                    value={selectedSound}
                    onChange={(e) => setSelectedSound(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Glitch Beats Vol. 4">Glitch Beats Vol. 4 (Trending)</option>
                    <option value="Midnight Expressway (Original Audio)">Midnight Expressway</option>
                    <option value="Hyperdrive Bassline">Hyperdrive Bassline</option>
                    <option value="Keyboard ASMR 120WPM">Keyboard ASMR 120WPM</option>
                  </select>
                </div>

                {contentType === 'feed' && (
                  <div>
                    <label className="block text-slate-300 mb-1.5 font-medium flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      Location Tag
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Shinjuku, Tokyo"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Category (for Cinema) */}
            {contentType === 'tube' && (
              <div>
                <label className="block text-slate-300 mb-1.5 font-medium">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                >
                  <option value="Tech & Hardware">Tech & Hardware</option>
                  <option value="Cinematic & Travel">Cinematic & Travel</option>
                  <option value="Dance & Culture">Dance & Culture</option>
                  <option value="Design & Code">Design & Code</option>
                </select>
              </div>
            )}

            {/* Submit Action */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-400 hover:text-white rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-fuchsia-600 via-indigo-600 to-cyan-500 hover:opacity-90 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Publish to Glitch</span>
              </button>
            </div>

          </form>

        </div>

      </div>
    </div>
  );
};
