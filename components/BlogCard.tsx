import React from 'react';
import { Link } from 'react-router-dom';
import { Blog } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../context/NotificationContext';

interface BlogCardProps {
  blog: Blog;
}

const BlogCard: React.FC<BlogCardProps> = ({ blog }) => {
  const { user, isAuthenticated, toggleFavorite } = useAuth();
  const { addNotification } = useNotification();
  const isFavorited = user?.favorites.includes(blog._id) ?? false;

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggleFavorite(blog._id);
      addNotification(isFavorited ? 'Removed from favorites' : 'Added to favorites', 'success');
    } catch (error) {
      addNotification('Please log in to add favorites.', 'error');
    }
  }

  return (
    <article className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 ease-in-out flex flex-col group">
      <div className="relative">
        <Link to={`/blog/${blog.slug}`}>
          <img className="h-48 w-full object-cover" src={blog.imageUrl} alt={blog.title} loading="lazy" />
        </Link>
        {isAuthenticated && (
          <button 
            onClick={handleFavoriteClick}
            className={`absolute top-2 right-2 p-2 rounded-full transition-colors duration-200 ${isFavorited ? 'bg-red-500 text-white' : 'bg-white/70 text-gray-700 backdrop-blur-sm hover:bg-red-500 hover:text-white'}`}
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isFavorited ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 016.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
            </svg>
          </button>
        )}
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <div className="mb-4">
          <span className="inline-block bg-blue-100 text-highlight text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">{blog.category}</span>
        </div>
        <h3 className="text-xl font-bold font-serif mb-2 text-primary">
          <Link to={`/blog/${blog.slug}`} className="hover:text-highlight transition-colors">{blog.title}</Link>
        </h3>
        <p className="text-accent text-base flex-grow">{blog.excerpt}</p>
        <div className="mt-6 flex items-center">
          <Link to={`/author/${blog.author._id}`} className="flex-shrink-0">
            <img className="h-10 w-10 rounded-full" src={blog.author.avatarUrl} alt={blog.author.name} />
          </Link>
          <div className="ml-3">
            <p className="text-sm font-medium text-primary">
              <Link to={`/author/${blog.author._id}`} className="hover:underline">{blog.author.name}</Link>
            </p>
            <div className="flex space-x-1 text-sm text-accent">
              <time dateTime={blog.createdAt}>{new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;
