import express from 'express';
import {
    getCommentsByBlog,
    createComment,
} from '../controllers/commentController.js';
import { protect, hasRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/blog/:blogId').get(getCommentsByBlog);

router.route('/')
    .post(protect, hasRole('User', 'Author', 'Admin'), createComment);

export default router;
