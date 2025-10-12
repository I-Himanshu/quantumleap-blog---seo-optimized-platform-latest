import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBlog } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import BlogForm from '../components/BlogForm';

const CreateBlogPage: React.FC = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { addNotification } = useNotification();

    const handleCreate = async (blogData: any) => {
        setIsSubmitting(true);
        try {
            await createBlog(blogData);
            addNotification('Blog post created successfully!', 'success');
            navigate('/dashboard');
        } catch (error) {
            console.error('Failed to create blog post:', error);
            addNotification('Failed to create post. Please try again.', 'error');
            setIsSubmitting(false);
        }
    };

    return (
       <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-xl">
            <h1 className="text-3xl font-bold font-serif text-primary mb-6">Create New Post</h1>
            <BlogForm 
                onSubmit={handleCreate} 
                isSubmitting={isSubmitting} 
                submitButtonText="Publish Post"
            />
        </div>
    );
};

export default CreateBlogPage;
