import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { User, Blog } from '../types';
import { getUserById, getBlogsByAuthorId } from '../services/api';
import BlogCard from '../components/BlogCard';
import NotFoundPage from './NotFoundPage';
import Spinner from '../components/Spinner';

const AuthorProfilePage: React.FC = () => {
  const { authorId } = useParams<{ authorId: string }>();
  const [author, setAuthor] = useState<User | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!authorId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const authorPromise = getUserById(authorId);
        const blogsPromise = getBlogsByAuthorId(authorId);
        
        const [authorRes, blogsRes] = await Promise.all([authorPromise, blogsPromise]);

        setAuthor(authorRes.data || null);
        setBlogs(blogsRes.data || []);

      } catch (error) {
        console.error("Failed to fetch author data:", error);
        setAuthor(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [authorId]);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  if (!author) {
    return <NotFoundPage />;
  }

  return (
    <div>
      <header className="bg-white rounded-lg shadow-md p-8 mb-12 text-center">
        <img 
          src={author.avatarUrl} 
          alt={author.name} 
          className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-highlight"
        />
        <h1 className="text-4xl font-bold font-serif text-primary">{author.name}</h1>
        {author.bio && <p className="mt-2 max-w-2xl mx-auto text-accent">{author.bio}</p>}
      </header>

      <h2 className="text-3xl font-bold text-primary mb-8 font-serif">Articles by {author.name}</h2>
      {blogs.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map(blog => (
            <BlogCard key={blog._id} blog={blog} />
          ))}
        </div>
      ) : (
        <p className="text-accent text-center bg-white p-8 rounded-lg shadow-md">This author has not published any articles yet.</p>
      )}
    </div>
  );
};

export default AuthorProfilePage;
