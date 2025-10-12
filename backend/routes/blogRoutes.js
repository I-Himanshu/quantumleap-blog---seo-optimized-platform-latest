import express from 'express';
import path from 'path';
import multer from 'multer';
import {
  getBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogsByTag,
  getCategories,
  viewBlog,
  getAuthorAnalytics,
} from '../controllers/blogController.js';
import { protect, hasRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Multer config for image uploads
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `image-${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage });


router.route('/')
  .get(getBlogs)
  .post(protect, hasRole('Author', 'Admin'), createBlog);

router.route('/upload').post(protect, hasRole('Author', 'Admin'), upload.single('image'), (req, res) => {
    res.send({
        message: 'Image uploaded successfully',
        image: `/uploads/${req.file.filename}`
    });
});
  
router.route('/tags/:tagName').get(getBlogsByTag);
router.route('/categories').get(getCategories);
router.route('/analytics/author').get(protect, hasRole('Author', 'Admin'), getAuthorAnalytics);

router.route('/:slug')
  .get(getBlogBySlug);

router.route('/:id/view').post(viewBlog);

router.route('/:id')
    .put(protect, hasRole('Author', 'Admin'), updateBlog)
    .delete(protect, hasRole('Author', 'Admin'), deleteBlog);

export default router;