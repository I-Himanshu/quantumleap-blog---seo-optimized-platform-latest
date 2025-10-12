import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getBlogBySlug, updateBlog } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import Spinner from '../components/Spinner';
import BlogForm from '../components/BlogForm';
import { Blog } from '../types';

const EditBlogPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [initialBlog, setInitialBlog] = useState<Blog | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { addNotification } = useNotification();

    useEffect(() => {
        const fetchBlog = async () => {
            if (!slug) return;
            try {
                const { data } = await getBlogBySlug(slug);
                setInitialBlog(data);
            } catch (error) {
                addNotification('Could not fetch blog post.', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchBlog();
    }, [slug, addNotification]);

    const handleUpdate = async (blogData: any) => {
        if (!initialBlog) return;
        setIsSubmitting(true);
        try {
            await updateBlog(initialBlog._id, blogData);
            addNotification('Blog post updated successfully!', 'success');
            navigate('/dashboard');
        } catch (error) {
            addNotification('Failed to update post.', 'error');
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64"><Spinner /></div>;
    if (!initialBlog) return <div className="text-center">Blog post not found.</div>;

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-xl">
            <h1 className="text-3xl font-bold font-serif text-primary mb-6">Edit Post</h1>
            <BlogForm
                onSubmit={handleUpdate}
                isSubmitting={isSubmitting}
                initialData={initialBlog}
                submitButtonText="Save Changes"
            />
        </div>
    );
};

export default EditBlogPage;
