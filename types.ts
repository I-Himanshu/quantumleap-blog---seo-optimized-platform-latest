export enum UserRole {
  GUEST = 'Guest',
  USER = 'User',
  AUTHOR = 'Author',
  ADMIN = 'Admin',
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  bio?: string;
  favorites: string[]; // Array of blog post IDs
}

export interface Comment {
  _id: string;
  content: string;
  createdAt: string;
  author: {
    _id: string;
    name: string;
    avatarUrl?: string;
  };
  blog: string; // Blog post ID
  parentComment?: string; // Parent comment ID
  replies: Comment[];
}

export interface Blog {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  category: string;
  tags: string[];
  createdAt: string;
  viewCount: number;
  author: {
    _id: string;
    name: string;
    avatarUrl?: string;
    bio?: string;
  };
}

export interface AuthorAnalytics {
    totalPosts: number;
    totalViews: number;
    totalComments: number;
    topPosts: { _id: string; title: string; viewCount: number; }[];
    viewsLast30Days: { date: string; count: number }[];
}

export interface AdminAnalytics {
    totalUsers: number;
    totalPosts: number;
    totalViews: number;
    userRoleDistribution: { _id: UserRole; count: number }[];
    postsLast30Days: { date: string; count: number }[];
}