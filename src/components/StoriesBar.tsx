import React from 'react';
import { UserStory, User } from '../types';
import { Plus } from 'lucide-react';

interface StoriesBarProps {
  stories: UserStory[];
  currentUser: User;
  onSelectStory: (index: number) => void;
  onAddStory: () => void;
}

export const StoriesBar: React.FC<StoriesBarProps> = ({
  stories,
  currentUser,
  onSelectStory,
  onAddStory
}) => {
  return (
    <div className="w-full bg-[#0d0f17] border border-slate-800/80 rounded-2xl p-4 overflow-x-auto no-scrollbar shadow-sm">
      <div className="flex items-center gap-4 min-w-max">
        
        {/* User's Own Story Button */}
        <div className="flex flex-col items-center gap-1.5 cursor-pointer group" onClick={onAddStory}>
          <div className="relative">
            <div className="w-16 h-16 rounded-full p-[2px] border-2 border-dashed border-slate-600 group-hover:border-cyan-400 transition-colors">
              <img
                src={currentUser.avatar}
                alt="Your Story"
                className="w-full h-full rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center border-2 border-[#0d0f17]">
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </div>
          <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors truncate max-w-[68px]">
            Your story
          </span>
        </div>

        {/* Other Creators' Stories */}
        {stories.map((story, idx) => {
          // If it's the current user's story in the list, skip or render as their story
          if (story.userId === currentUser.id) return null;

          return (
            <div
              key={story.userId}
              onClick={() => onSelectStory(idx)}
              className="flex flex-col items-center gap-1.5 cursor-pointer group"
            >
              <div
                className={`w-16 h-16 rounded-full p-[2.5px] transition-transform duration-200 group-hover:scale-105 ${
                  story.hasUnseen
                    ? 'bg-gradient-to-tr from-amber-500 via-fuchsia-500 to-cyan-400 animate-pulse'
                    : 'border-2 border-slate-700'
                }`}
              >
                <div className="w-full h-full rounded-full p-[2px] bg-[#0d0f17]">
                  <img
                    src={story.user.avatar}
                    alt={story.user.name}
                    className="w-full h-full rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
              <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors truncate max-w-[68px]">
                {story.user.handle}
              </span>
            </div>
          );
        })}

      </div>
    </div>
  );
};
