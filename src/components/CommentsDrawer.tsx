import React, { useState } from 'react';
import { Comment, User } from '../types';
import { X, Heart, Send, MessageCircle } from 'lucide-react';

interface CommentsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  comments: Comment[];
  currentUser: User;
  onAddComment: (text: string) => void;
  title?: string;
}

export const CommentsDrawer: React.FC<CommentsDrawerProps> = ({
  isOpen,
  onClose,
  comments,
  currentUser,
  onAddComment,
  title = 'Comments'
}) => {
  const [commentInput, setCommentInput] = useState('');
  const [localComments, setLocalComments] = useState(comments);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const newComment: Comment = {
      id: `c_${Date.now()}`,
      user: currentUser,
      text: commentInput.trim(),
      timestamp: 'Just now',
      likesCount: 0,
      isLiked: false
    };

    setLocalComments([newComment, ...localComments]);
    onAddComment(commentInput.trim());
    setCommentInput('');
  };

  const toggleCommentLike = (id: string) => {
    setLocalComments(prev =>
      prev.map(c => {
        if (c.id === id) {
          const isLiked = !c.isLiked;
          return {
            ...c,
            isLiked,
            likesCount: isLiked ? c.likesCount + 1 : Math.max(0, c.likesCount - 1)
          };
        }
        return c;
      })
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      {/* Backdrop tap to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Slide-out drawer */}
      <div className="w-full max-w-md h-full bg-[#0d0f17] border-l border-slate-800 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-cyan-400" />
            <h3 className="font-semibold text-white text-base font-['Outfit']">
              {title}
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              ({localComments.length})
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Close comments"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments Scrollable List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {localComments.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-12">
              <MessageCircle className="w-10 h-10 mb-2 stroke-[1.5] text-slate-600" />
              <p className="text-sm font-medium text-slate-400">No comments yet</p>
              <p className="text-xs text-slate-500 mt-1">Be the first to share your thoughts!</p>
            </div>
          ) : (
            localComments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-3 group">
                <img
                  src={comment.user.avatar}
                  alt={comment.user.name}
                  className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-semibold text-white hover:text-cyan-400 cursor-pointer">
                      {comment.user.handle}
                    </span>
                    {comment.user.verified && (
                      <span className="w-3 h-3 rounded-full bg-cyan-400 text-black text-[8px] flex items-center justify-center font-bold">
                        ✓
                      </span>
                    )}
                    <span className="text-[11px] text-slate-500 font-mono">
                      {comment.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 mt-1 leading-relaxed break-words">
                    {comment.text}
                  </p>

                  {comment.creatorLiked && (
                    <div className="flex items-center gap-1 mt-1 text-[11px] text-fuchsia-400 font-medium">
                      <Heart className="w-3 h-3 fill-fuchsia-400" />
                      <span>Liked by creator</span>
                    </div>
                  )}
                </div>

                {/* Like Button */}
                <button
                  onClick={() => toggleCommentLike(comment.id)}
                  className={`flex flex-col items-center gap-0.5 shrink-0 transition-colors p-1 ${
                    comment.isLiked ? 'text-red-500' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  aria-label="Like comment"
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${comment.isLiked ? 'fill-red-500' : ''}`}
                  />
                  {comment.likesCount > 0 && (
                    <span className="text-[10px] font-mono tabular-nums">
                      {comment.likesCount}
                    </span>
                  )}
                </button>
              </div>
            ))
          )}
        </div>

        {/* Composer Input pinned at bottom */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-slate-800 bg-[#090a0f]">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 relative flex items-center">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Add a comment on Glitch..."
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-full pl-4 pr-10 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                disabled={!commentInput.trim()}
                className="absolute right-1.5 w-7 h-7 rounded-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 text-slate-950 flex items-center justify-center transition-colors"
                aria-label="Submit comment"
              >
                <Send className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
