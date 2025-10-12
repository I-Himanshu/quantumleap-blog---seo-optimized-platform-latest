import User from "../models/User.js";
import Blog from "../models/Blog.js";
import mongoose from "mongoose";

// GET all users (Admin only)
export const getUsers = async (req, res) => {
  const users = await User.find({}).select("-password -refreshToken");
  res.json(users);
};

// DELETE user (Admin only)
export const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    await user.deleteOne();
    // Also remove user's blogs? For now, we'll keep them but you could add that logic.
    res.json({ message: "User removed" });
  } else {
    res.status(404).json({ message: "User not found" });
  }
};

// GET user by ID
export const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select(
    "-password -refreshToken"
  );
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: "User not found" });
  }
};

// GET blogs by author ID
export const getBlogsByAuthor = async (req, res) => {
  const blogs = await Blog.find({ author: req.params.id }).populate(
    "author",
    "name avatarUrl bio"
  );
  res.json(blogs);
};

// POST toggle favorite blog
export const toggleFavorite = async (req, res) => {
  const { blogId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(blogId)) {
    return res.status(400).json({ message: "Invalid blog ID" });
  }

  const user = await User.findById(req.user._id);

  if (user) {
    const index = user.favorites.indexOf(blogId);
    if (index > -1) {
      user.favorites.splice(index, 1);
    } else {
      user.favorites.push(blogId);
    }
    await user.save();
    // Return the updated user object
    const updatedUser = await User.findById(req.user._id).select(
      "-password -refreshToken"
    );
    res.json(updatedUser);
  } else {
    res.status(404).json({ message: "User not found" });
  }
};

// GET Admin Analytics
export const getAdminAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPosts = await Blog.countDocuments();

    const totalViewsResult = await Blog.aggregate([
      { $group: { _id: null, total: { $sum: "$viewCount" } } },
    ]);
    const totalViews =
      totalViewsResult.length > 0 ? totalViewsResult[0].total : 0;

    const userRoleDistribution = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const postsLast30Days = await Blog.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { date: "$_id", count: 1, _id: 0 } },
    ]);

    res.json({
      totalUsers,
      totalPosts,
      totalViews,
      userRoleDistribution,
      postsLast30Days,
    });
  } catch (error) {
    console.error("Error fetching admin analytics:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
