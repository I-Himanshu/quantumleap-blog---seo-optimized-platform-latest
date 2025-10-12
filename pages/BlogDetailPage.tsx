import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Blog } from '../types';
import { getBlogBySlug, viewBlog } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../context/NotificationContext';
import NotFoundPage from './NotFoundPage';
import Spinner from '../components/Spinner';
import CommentSection from '../components/CommentSection';

const ShareButtons: React.FC<{ blog: Blog }> = ({ blog }) => {
    const { addNotification } = useNotification();
    const url = window.location.href;
    const text = `Check out this article: ${blog.title}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(url).then(() => {
            addNotification('Link copied to clipboard!', 'success');
        }, () => {
            addNotification('Failed to copy link.', 'error');
        });
    };

    const shareOptions = [
        { name: 'Twitter', url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}` },
        { name: 'Facebook', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
        { name: 'LinkedIn', url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(blog.title)}&summary=${encodeURIComponent(blog.excerpt)}` },
    ];

    return (
        <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold text-gray-700">Share:</span>
            {shareOptions.map(option => (
                <a key={option.name} href={option.url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-highlight transition-colors p-2 rounded-full hover:bg-gray-100">
                    {/* Basic icon placeholder */}
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" dangerouslySetInnerHTML={{__html: `<title>${option.name}</title><path d="M18 2.022a2 2 0 00-2 2v1.486c-2.836.83-5 3.33-5 6.492v1h-2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2h-2v-1c0-3.162-2.164-5.662-5-6.492V4a2 2 0 00-2-2h-2zm-6 10v-1c0-2.206 1.794-4 4-4s4 1.794 4 4v1h2v5H8v-5h4z"/>`}} />
                </a>
            ))}
            <button onClick={copyToClipboard} className="text-gray-500 hover:text-highlight transition-colors p-2 rounded-full hover:bg-gray-100" title="Copy link">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </button>
        </div>
    );
};


const BlogDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { isAuthenticated, user, toggleFavorite } = useAuth();
  const { addNotification } = useNotification();
  
  const isFavorited = user?.favorites.includes(blog?._id ?? '') ?? false;

  useEffect(() => {
    const fetchBlog = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        const { data } = await getBlogBySlug(slug);
        setBlog(data || null);
        if (data) {
           // Track view, but don't wait for it to render content
           viewBlog(data._id).catch(err => console.error("Failed to track view:", err));
        }
      } catch (error)
      {
        console.error("Failed to fetch blog:", error);
        setBlog(null);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [slug]);

  const handleFavoriteClick = async () => {
    if (!blog) return;
    try {
        await toggleFavorite(blog._id);
        addNotification(isFavorited ? 'Removed from favorites' : 'Added to favorites', 'success');
    } catch (error) {
        addNotification('Could not update favorites. Please try again.', 'error');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Spinner size="lg" /></div>;
  }

  if (!blog) {
    return <NotFoundPage />;
  }

  return (
    <article className="max-w-4xl mx-auto bg-white p-6 sm:p-8 lg:p-12 rounded-lg shadow-xl">
      <header className="mb-8">
        <div className="text-center">
          <p className="text-highlight font-semibold mb-2">{blog.category}</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary font-serif leading-tight">{blog.title}</h1>
          <div className="mt-6 flex items-center justify-center space-x-4 text-accent">
            <Link to={`/author/${blog.author._id}`} className="flex items-center space-x-2 hover:text-highlight">
              <img className="h-10 w-10 rounded-full" src={blog.author.avatarUrl} alt={blog.author.name} />
              <span>{blog.author.name}</span>
            </Link>
            <span>&middot;</span>
            <time dateTime={blog.createdAt}>
              {new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </time>
             <span>&middot;</span>
             <span>{blog.viewCount.toLocaleString()} views</span>
          </div>
        </div>
      </header>

      <img src={blog.imageUrl} alt={blog.title} className="w-full h-auto max-h-96 object-cover rounded-lg mb-8" />
      
      <div
        className="prose prose-lg max-w-none font-serif text-gray-800 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />
      
      <div className="mt-10 flex flex-wrap justify-between items-center gap-y-6">
         <div className="flex flex-wrap gap-2">
            {blog.tags.map(tag => (
            <Link key={tag} to={`/tags/${tag}`} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 hover:bg-gray-300 transition-colors">#{tag}</Link>
            ))}
        </div>
        <ShareButtons blog={blog} />
      </div>

       <div className="mt-10">
        {isAuthenticated && (
            <button
                onClick={handleFavoriteClick}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full font-semibold transition-colors duration-200 ${isFavorited ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-800 hover:bg-red-100'}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isFavorited ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 016.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                </svg>
                <span>{isFavorited ? 'Favorited' : 'Favorite'}</span>
            </button>
        )}
      </div>

      <hr className="my-12 border-gray-200" />
      
      <CommentSection blogId={blog._id} />

    </article>
  );
};

export default BlogDetailPage;