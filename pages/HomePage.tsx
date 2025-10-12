import React, { useState, useEffect, useMemo } from 'react';
import { Blog } from '../types';
import { getAllBlogs } from '../services/api';
import BlogCard from '../components/BlogCard';
import { BlogCardSkeleton } from '../components/Skeleton';

const Hero: React.FC<{ onSearch: (term: string) => void }> = ({ onSearch }) => (
  <div className="text-center py-16 md:py-24 bg-white rounded-lg shadow-md mb-12">
    <h1 className="text-4xl md:text-6xl font-extrabold text-primary font-serif tracking-tight">Welcome to <span className="text-highlight">QuantumLeap</span></h1>
    <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-accent">
      Exploring the frontiers of technology, design, and artificial intelligence.
    </p>
    <div className="mt-8 max-w-md mx-auto">
       <form className="relative" onSubmit={(e) => e.preventDefault()}>
          <input 
            type="search" 
            placeholder="Search for articles..." 
            className="w-full p-4 pr-12 text-sm border-gray-200 rounded-lg shadow-sm focus:ring-highlight focus:border-highlight"
            onChange={(e) => onSearch(e.target.value)}
          />
          <button type="submit" className="absolute p-2 text-white -translate-y-1/2 bg-highlight rounded-full top-1/2 right-4 hover:bg-blue-700 transition">
             <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
             </svg>
           </button>
       </form>
    </div>
  </div>
);

const HomePage: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const { data } = await getAllBlogs();
        setBlogs(data);
      } catch (error) {
        console.error("Failed to fetch blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const filteredBlogs = useMemo(() => {
    if (!searchTerm) {
      return blogs;
    }
    return blogs.filter(blog =>
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [blogs, searchTerm]);
  
  const renderSkeletons = () => (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => <BlogCardSkeleton key={index} />)}
    </div>
  );

  return (
    <div>
      <Hero onSearch={setSearchTerm} />
      <h2 className="text-3xl font-bold text-primary mb-8 font-serif">Latest Articles</h2>
      {loading ? renderSkeletons() : filteredBlogs.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredBlogs.map(blog => (
            <BlogCard key={blog._id} blog={blog} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-white rounded-lg shadow-md">
            <p className="text-accent">No articles found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default HomePage;
