import axios from "axios";

const api = axios.create({
  baseURL:
    (import.meta as any).env.VITE_API_BASE_URL || "http://localhost:5000/api",
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response.status === 401 &&
      !originalRequest._retry &&
      localStorage.getItem("accessToken") &&
      localStorage.getItem("user")
    ) {
      originalRequest._retry = true;
      try {
        const { data } = await api.post("/auth/refresh");
        localStorage.setItem("accessToken", data.accessToken);
        api.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        window.location.href = "/login"; // Fix: Removed hash from URL
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Blog Services
export const getAllBlogs = () => api.get("/blogs");
export const getBlogBySlug = (slug: string) => api.get(`/blogs/${slug}`);
export const getBlogsByTag = (tagName: string) =>
  api.get(`/blogs/tags/${tagName}`);
export const getAllCategories = () => api.get("/blogs/categories");
export const createBlog = (blogData: any) => api.post("/blogs", blogData);
export const updateBlog = (id: string, blogData: any) =>
  api.put(`/blogs/${id}`, blogData);
export const deleteBlog = (id: string) => api.delete(`/blogs/${id}`);
export const viewBlog = (id: string) => api.post(`/blogs/${id}/view`);
export const uploadImage = (formData: FormData) =>
  api.post("/blogs/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Comment Services
export const getCommentsByBlogId = (blogId: string) =>
  api.get(`/comments/blog/${blogId}`);
export const addComment = (commentData: {
  content: string;
  blogId: string;
  parentCommentId?: string;
}) => api.post(`/comments`, commentData);

// Auth Services
export const register = (credentials: any) =>
  api.post("/auth/register", credentials);
export const login = (credentials: any) => api.post("/auth/login", credentials);
export const logout = () => api.post("/auth/logout");
export const getMe = () => api.get("/auth/me");

// User Services
export const toggleFavorite = (blogId: string) =>
  api.post("/users/favorites", { blogId });
export const getAllUsers = () => api.get("/users");
export const getUserById = (id: string) => api.get(`/users/${id}`);
export const getBlogsByAuthorId = (id: string) => api.get(`/users/${id}/blogs`);
export const deleteUser = (id: string) => api.delete(`/users/${id}`);

// Analytics Services
export const getAuthorAnalytics = () => api.get("/blogs/analytics/author");
export const getAdminAnalytics = () => api.get("/users/analytics");

export default api;
