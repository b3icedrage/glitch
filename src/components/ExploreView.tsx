import React, { useState } from 'react';
import { FeedPost, SparkReel, CinemaVideo } from '../types';
import { Search, Flame, PlaySquare, Image as ImageIcon, Heart, Play, X, ExternalLink, ArrowLeft } from 'lucide-react';

interface ExploreViewProps {
  feedPosts: FeedPost[];
  sparks: SparkReel[];
  cinemaVideos: CinemaVideo[];
  onSelectFeedPost: (post: FeedPost) => void;
  onSelectSpark: (spark: SparkReel) => void;
  onSelectVideo: (video: CinemaVideo) => void;
  onGoBack?: () => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  feedPosts,
  sparks,
  cinemaVideos,
  onSelectFeedPost,
  onSelectSpark,
  onSelectVideo,
  onGoBack
}) => {
  const [filterType, setFilterType] = useState<'all' | 'sparks' | 'feed' | 'tube'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewItem, setPreviewItem] = useState<{
    type: 'feed' | 'spark' | 'tube';
    data: any;
  } | null>(null);

  // Trending tags list
  const trendingTags = ['Cyberpunk', 'DanceBattle', 'DeskSetup', 'TokyoNights', 'AnalogSynth', 'Anamorphic'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {onGoBack && (
        <button
          onClick={onGoBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors w-fit shadow-sm"
          title="Back to previous page"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" />
          <span>Back to previous page</span>
        </button>
      )}

      {/* Search Bar & Tag Chips */}
      <div className="max-w-2xl mx-auto space-y-3">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search creators, sounds, hashtags or videos..."
            className="w-full bg-[#0d0f17] border border-slate-700/80 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 shadow-md"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center justify-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              filterType === 'all' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Trending
          </button>
          <button
            onClick={() => setFilterType('sparks')}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              filterType === 'sparks' ? 'bg-fuchsia-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Sparks
          </button>
          <button
            onClick={() => setFilterType('feed')}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              filterType === 'feed' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Feeds
          </button>
          <button
            onClick={() => setFilterType('tube')}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              filterType === 'tube' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <PlaySquare className="w-3.5 h-3.5" />
            Cinema
          </button>
        </div>

        {/* Trending Hashtag Pills */}
        <div className="flex items-center justify-center gap-2 flex-wrap text-xs">
          <span className="text-slate-500 font-mono">Trending:</span>
          {trendingTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSearchQuery(tag)}
              className="text-slate-400 hover:text-cyan-400 transition-colors"
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Media Masonry Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 auto-rows-[220px]">
        
        {/* Sparks Items */}
        {(filterType === 'all' || filterType === 'sparks') &&
          sparks.map((spark, idx) => (
            <div
              key={spark.id}
              onClick={() => onSelectSpark(spark)}
              className="relative row-span-2 rounded-2xl overflow-hidden bg-slate-900 group cursor-pointer border border-slate-800 hover:border-fuchsia-500/60 transition-all duration-200"
            >
              <img
                src={spark.posterUrl}
                alt={spark.caption}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-md flex items-center gap-1 text-[11px] text-fuchsia-400 font-semibold">
                <Flame className="w-3 h-3 fill-fuchsia-400" />
                <span>Spark</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                <div className="flex items-center gap-1.5 text-white text-xs font-semibold mb-1">
                  <span>@{spark.author.handle}</span>
                </div>
                <p className="text-xs text-slate-200 line-clamp-2">{spark.caption}</p>
                <div className="flex items-center gap-3 text-xs text-slate-300 mt-2 font-mono">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                    {(spark.likesCount / 1000).toFixed(1)}k
                  </span>
                </div>
              </div>
            </div>
          ))}

        {/* Feed Posts */}
        {(filterType === 'all' || filterType === 'feed') &&
          feedPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => onSelectFeedPost(post)}
              className="relative rounded-2xl overflow-hidden bg-slate-900 group cursor-pointer border border-slate-800 hover:border-cyan-500/60 transition-all duration-200"
            >
              <img
                src={post.images[0]}
                alt={post.caption}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-md flex items-center gap-1 text-[11px] text-cyan-400 font-semibold">
                <ImageIcon className="w-3 h-3" />
                <span>Post</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                <p className="text-xs text-white line-clamp-2">{post.caption}</p>
                <div className="flex items-center gap-3 text-xs text-slate-300 mt-2 font-mono">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3 fill-red-500 text-red-500" />
                    {(post.likesCount / 1000).toFixed(1)}k
                  </span>
                </div>
              </div>
            </div>
          ))}

        {/* Cinema Videos */}
        {(filterType === 'all' || filterType === 'tube') &&
          cinemaVideos.map((video) => (
            <div
              key={video.id}
              onClick={() => onSelectVideo(video)}
              className="relative col-span-2 rounded-2xl overflow-hidden bg-slate-900 group cursor-pointer border border-slate-800 hover:border-red-500/60 transition-all duration-200"
            >
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-md flex items-center gap-1 text-[11px] text-red-400 font-semibold">
                <PlaySquare className="w-3 h-3 fill-red-400" />
                <span>Watch · {video.duration}</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 flex flex-col justify-end">
                <h4 className="text-sm font-bold text-white line-clamp-1 group-hover:text-red-400 transition-colors">
                  {video.title}
                </h4>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-mono">
                  <span>{video.channel.name}</span>
                  <span aria-hidden="true">·</span>
                  <span>{video.viewsCount} views</span>
                </div>
              </div>
            </div>
          ))}

      </div>

    </div>
  );
};
