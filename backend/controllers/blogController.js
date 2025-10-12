import Blog from "../models/Blog.js";
import Comment from "../models/Comment.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import slugify from "slugify";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GET all blogs
export const getBlogs = async (req, res) => {
  const blogs = await Blog.find({})
    .populate("author", "name avatarUrl bio")
    .sort({ createdAt: -1 });
  res.json(blogs);
};

// GET blog by slug
export const getBlogBySlug = async (req, res) => {
  const blog = await Blog.findOne({ slug: req.params.slug }).populate(
    "author",
    "name avatarUrl bio"
  );

  if (blog) {
    res.json(blog);
  } else {
    res.status(404).json({ message: "Blog not found" });
  }
};

// POST increment view count for a blog
export const viewBlog = async (req, res) => {
  try {
    await Blog.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });
    res.status(200).json({ message: "View count incremented" });
  } catch (error) {
    res.status(404).json({ message: "Blog not found" });
  }
};

// POST create a new blog
export const createBlog = async (req, res) => {
  const { title, excerpt, content, imageUrl, category, tags } = req.body;
  const blog = new Blog({
    title,
    excerpt,
    content,
    imageUrl,
    category,
    tags,
    author: req.user._id,
  });
  const createdBlog = await blog.save();
  res.status(201).json(createdBlog);
};

// PUT update a blog
export const updateBlog = async (req, res) => {
  const { title, excerpt, content, imageUrl, category, tags } = req.body;
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return res.status(404).json({ message: "Blog not found" });
  }

  // Check if user is the author or an admin
  if (
    blog.author.toString() !== req.user._id.toString() &&
    req.user.role !== "Admin"
  ) {
    return res
      .status(403)
      .json({ message: "User not authorized to update this blog" });
  }

  // Clean up old image if a new one is provided and the old one was a local upload
  if (
    imageUrl &&
    blog.imageUrl !== imageUrl &&
    blog.imageUrl.startsWith("/uploads/")
  ) {
    const oldImagePath = path.join(__dirname, "..", blog.imageUrl);
    fs.unlink(oldImagePath, (err) => {
      if (err) console.error("Error deleting old image:", err);
    });
  }

  blog.title = title || blog.title;
  blog.excerpt = excerpt || blog.excerpt;
  blog.content = content || blog.content;
  blog.imageUrl = imageUrl || blog.imageUrl;
  blog.category = category || blog.category;
  blog.tags = tags || blog.tags;

  if (title && blog.isModified("title")) {
    blog.slug =
      slugify(title, { lower: true, strict: true, trim: true }) +
      "-" +
      Date.now();
  }

  const updatedBlog = await blog.save();
  res.json(updatedBlog);
};

// DELETE a blog
export const deleteBlog = async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return res.status(404).json({ message: "Blog not found" });
  }

  // Check if user is the author or an admin
  if (
    blog.author.toString() !== req.user._id.toString() &&
    req.user.role !== "Admin"
  ) {
    return res
      .status(403)
      .json({ message: "User not authorized to delete this blog" });
  }

  // If the image is a local upload, delete it from the server
  if (blog.imageUrl.startsWith("/uploads/")) {
    const imagePath = path.join(__dirname, "..", blog.imageUrl);
    fs.unlink(imagePath, (err) => {
      if (err) console.error("Could not delete image file:", err);
    });
  }

  await blog.deleteOne();
  await Comment.deleteMany({ blog: req.params.id });
  res.json({ message: "Blog removed" });
};

// GET blogs by tag
export const getBlogsByTag = async (req, res) => {
  try {
    const blogs = await Blog.find({ tags: req.params.tagName })
      .populate("author", "name avatarUrl bio")
      .sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching blogs by tag" });
  }
};

// GET all unique categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Blog.distinct("category");
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories" });
  }
};

// GET Author Analytics
export const getAuthorAnalytics = async (req, res) => {
  try {
    const authorId = req.user._id;
    const blogs = await Blog.find({ author: authorId });

    const totalPosts = blogs.length;
    const totalViews = blogs.reduce((sum, blog) => sum + blog.viewCount, 0);
    const totalComments = await Comment.countDocuments({
      blog: { $in: blogs.map((b) => b._id) },
    });

    const topPosts = await Blog.find({ author: authorId })
      .sort({ viewCount: -1 })
      .limit(5)
      .select("title viewCount");

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const viewsLast30Days = await Blog.aggregate([
      { $match: { author: authorId, createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: "$viewCount" },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { date: "$_id", count: 1, _id: 0 } },
    ]);

    res.json({
      totalPosts,
      totalViews,
      totalComments,
      topPosts,
      viewsLast30Days,
    });
  } catch (error) {
    console.error("Error fetching author analytics:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
