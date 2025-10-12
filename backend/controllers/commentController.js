import Comment from '../models/Comment.js';
import Blog from '../models/Blog.js';
import mongoose from 'mongoose';

// GET comments for a blog post
export const getCommentsByBlog = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.blogId)) {
            // It might be a slug, let's find the blog first
             const blog = await Blog.findById(req.params.blogId);
             if (!blog) return res.status(404).json({ message: 'Blog not found' });
        }

        const comments = await Comment.find({ blog: req.params.blogId })
            .populate('author', 'name avatarUrl')
            .sort({ createdAt: 'asc' });
        
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// POST create a new comment
export const createComment = async (req, res) => {
    const { content, blogId, parentCommentId } = req.body;
    
    try {
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        const comment = new Comment({
            content,
            author: req.user._id,
            blog: blogId,
            parentComment: parentCommentId || null,
        });

        const createdComment = await comment.save();
        const populatedComment = await createdComment.populate('author', 'name avatarUrl');
        
        res.status(201).json(populatedComment);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Invalid comment data' });
    }
};
