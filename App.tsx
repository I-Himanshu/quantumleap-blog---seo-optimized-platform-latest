import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import BlogDetailPage from './pages/BlogDetailPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import AuthorProfilePage from './pages/AuthorProfilePage';
import CreateBlogPage from './pages/CreateBlogPage';
import EditBlogPage from './pages/EditBlogPage';
import ProtectedRoute from './components/ProtectedRoute';
import { UserRole } from './types';
import TagResultsPage from './pages/TagResultsPage';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/blog/:slug" element={<BlogDetailPage />} />
              <Route path="/author/:authorId" element={<AuthorProfilePage />} />
              <Route path="/tags/:tagName" element={<TagResultsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/create-post" element={<ProtectedRoute roles={[UserRole.AUTHOR, UserRole.ADMIN]}><CreateBlogPage /></ProtectedRoute>} />
              <Route path="/edit-post/:slug" element={<ProtectedRoute roles={[UserRole.AUTHOR, UserRole.ADMIN]}><EditBlogPage /></ProtectedRoute>} />

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;