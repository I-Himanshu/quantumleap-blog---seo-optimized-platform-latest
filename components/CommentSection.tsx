import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Comment as CommentType, UserRole } from '../types';
import { getCommentsByBlogId, addComment } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../context/NotificationContext';
import Comment from './Comment';

interface CommentSectionProps {
  blogId: string;
}

const buildCommentTree = (comments: CommentType[]): CommentType[] => {
    const commentMap: { [key: string]: CommentType & { replies: CommentType[] } } = {};
    const rootComments: CommentType[] = [];

    comments.forEach(comment => {
        commentMap[comment._id] = { ...comment, replies: [] };
    });

    comments.forEach(comment => {
        if (comment.parentComment && commentMap[comment.parentComment]) {
            commentMap[comment.parentComment].replies.push(commentMap[comment._id]);
        } else {
            rootComments.push(commentMap[comment._id]);
        }
    });

    return rootComments;
};

const CommentSection: React.FC<CommentSectionProps> = ({ blogId }) => {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { addNotification } = useNotification();

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await getCommentsByBlogId(blogId);
      setComments(data);
    } catch (error) {
      console.error("Failed to fetch comments", error);
      addNotification('Could not load comments.', 'error');
    } finally {
      setLoading(false);
    }
  }, [blogId, addNotification]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleCommentSubmit = async (content: string, parentCommentId?: string) => {
    if (!content.trim() || !user) return;

    setIsSubmitting(true);
    try {
      await addComment({ content, blogId, parentCommentId });
      setNewComment('');
      addNotification('Comment posted successfully!', 'success');
      fetchComments(); // Refetch to show new comment
    } catch (error) {
      console.error("Failed to post comment", error);
      addNotification('Failed to post comment. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const commentTree = buildCommentTree(comments);
  const totalComments = comments.length;

  return (
    <section id="comments">
      <h2 className="text-2xl font-bold font-serif mb-6">Comments ({totalComments})</h2>
      <div className="space-y-4 divide-y divide-gray-100">
        {loading 
          ? <p>Loading comments...</p>
          : commentTree.length > 0 
            ? commentTree.map(comment => <Comment key={comment._id} comment={comment} onReplySubmit={(content, parentId) => handleCommentSubmit(content, parentId)} />)
            : <p className="text-accent py-4">No comments yet. Be the first to share your thoughts!</p>
        }
      </div>

      {isAuthenticated && (user?.role === UserRole.USER || user?.role === UserRole.AUTHOR || user?.role === UserRole.ADMIN) ? (
        <form onSubmit={(e) => { e.preventDefault(); handleCommentSubmit(newComment); }} className="mt-8">
          <h3 className="text-lg font-semibold mb-2">Leave a comment</h3>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-highlight focus:border-transparent"
            rows={4}
            placeholder="Join the discussion..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={isSubmitting}
          ></textarea>
          <button 
            type="submit" 
            className="mt-4 bg-highlight text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            disabled={isSubmitting || !newComment.trim()}
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      ) : (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-center">
          <p>You must be <Link to="/login" className="text-highlight font-semibold hover:underline">logged in</Link> to leave a comment.</p>
        </div>
      )}
    </section>
  );
};

export default CommentSection;
