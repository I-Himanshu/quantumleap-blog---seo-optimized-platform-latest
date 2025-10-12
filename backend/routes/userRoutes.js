import express from 'express';
import {
  getUsers,
  deleteUser,
  getUserById,
  getBlogsByAuthor,
  toggleFavorite,
  getAdminAnalytics,
} from '../controllers/userController.js';
import { protect, hasRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/analytics').get(protect, hasRole('Admin'), getAdminAnalytics);

router.route('/')
  .get(protect, hasRole('Admin'), getUsers);
  
router.route('/favorites')
    .post(protect, toggleFavorite);

router.route('/:id')
  .get(getUserById)
  .delete(protect, hasRole('Admin'), deleteUser);
  
router.route('/:id/blogs')
    .get(getBlogsByAuthor);

export default router;