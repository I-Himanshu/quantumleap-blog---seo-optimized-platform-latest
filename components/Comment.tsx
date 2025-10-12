import React, { useState } from 'react';
import { Comment as CommentType } from '../types';
import { useAuth } from '../hooks/useAuth';

interface CommentProps {
  comment: CommentType;
  onReplySubmit: (content: string, parentId: string) => Promise<void>;
}

const Comment: React.FC<CommentProps> = ({ comment, onReplySubmit }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    setIsSubmitting(true);
    await onReplySubmit(replyContent, comment._id);
    setIsSubmitting(false);
    setReplyContent('');
    setShowReplyForm(false);
  };

  const authorName = comment.author ? comment.author.name : 'Deleted User';
  const authorAvatar = comment.author ? comment.author.avatarUrl : 'https://picsum.photos/seed/deleted/100/100';

  return (
    <div className="flex space-x-4 py-4">
      <img className="h-10 w-10 rounded-full flex-shrink-0" src={authorAvatar} alt={authorName} />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-primary">{authorName}</p>
          <p className="text-xs text-accent">
            {new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <p className="mt-1 text-gray-700">{comment.content}</p>
        {isAuthenticated && (
          <button onClick={() => setShowReplyForm(!showReplyForm)} className="mt-2 text-xs font-semibold text-highlight hover:underline">
            Reply
          </button>
        )}
        {showReplyForm && (
          <form onSubmit={handleReply} className="mt-3">
            <textarea
              className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-highlight focus:border-transparent"
              rows={2}
              placeholder={`Replying to ${authorName}...`}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              disabled={isSubmitting}
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button type="button" onClick={() => setShowReplyForm(false)} className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
              <button 
                type="submit" 
                className="px-3 py-1 text-xs font-medium text-white bg-highlight rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                disabled={isSubmitting || !replyContent.trim()}
              >
                {isSubmitting ? 'Replying...' : 'Reply'}
              </button>
            </div>
          </form>
        )}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 pl-6 border-l-2 border-gray-200">
            {comment.replies.map(reply => (
              <Comment key={reply._id} comment={reply} onReplySubmit={onReplySubmit} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Comment;
