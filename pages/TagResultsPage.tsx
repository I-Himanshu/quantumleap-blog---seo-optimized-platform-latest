import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Blog } from '../types';
import { getBlogsByTag } from '../services/api';
import BlogCard from '../components/BlogCard';
import { BlogCardSkeleton } from '../components/Skeleton';
import NotFoundPage from './NotFoundPage';

const TagResultsPage: React.FC = () => {
    const { tagName } = useParams<{ tagName: string }>();
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlogs = async () => {
            if (!tagName) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const { data } = await getBlogsByTag(tagName);
                setBlogs(data);
            } catch (error) {
                console.error(`Failed to fetch blogs for tag ${tagName}:`, error);
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, [tagName]);

    if (!tagName) {
        return <NotFoundPage />;
    }

    const renderSkeletons = () => (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => <BlogCardSkeleton key={index} />)}
        </div>
    );

    return (
        <div>
            <header className="bg-white rounded-lg shadow-md p-8 mb-12">
                <h1 className="text-4xl font-bold font-serif text-primary">
                    Posts tagged with <span className="text-highlight">#{tagName}</span>
                </h1>
            </header>

            {loading ? renderSkeletons() : blogs.length > 0 ? (
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {blogs.map(blog => (
                        <BlogCard key={blog._id} blog={blog} />
                    ))}
                </div>
            ) : (
                <p className="text-accent text-center bg-white p-8 rounded-lg shadow-md">No articles found with this tag.</p>
            )}
        </div>
    );
};

export default TagResultsPage;
