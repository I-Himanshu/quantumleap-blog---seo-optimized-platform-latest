import React, { useState, useEffect } from 'react';
import TagInput from './TagInput';
import { Blog } from '../types';
import { getAllCategories, uploadImage } from '../services/api';
import Spinner from './Spinner';
import { useNotification } from '../context/NotificationContext';

interface BlogFormProps {
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  initialData?: Blog;
  submitButtonText?: string;
}

const BlogForm: React.FC<BlogFormProps> = ({ onSubmit, isSubmitting, initialData, submitButtonText = 'Submit' }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
  const [content, setContent] = useState(initialData?.content ? initialData.content.replace(/<p>|<\/p>|<br>/g, '\n').replace(/^\n|\n$/g, '') : '');
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [categories, setCategories] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const { addNotification } = useNotification();
  
  useEffect(() => {
    const fetchCategories = async () => {
        try {
            const { data } = await getAllCategories();
            if (initialData?.category && !data.includes(initialData.category)) {
                setCategories([initialData.category, ...data]);
            } else {
                setCategories(data);
            }
             if (!initialData?.category && data.length > 0) {
                setCategory(data[0]);
             }
        } catch (error) {
            console.error("Failed to fetch categories", error);
        }
    }
    fetchCategories();
  }, [initialData]);

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    try {
        const { data } = await uploadImage(formData);
        setImageUrl(data.image); // The backend returns a path like /uploads/image-123.jpg
        addNotification('Image uploaded successfully!', 'success');
    } catch (error) {
        addNotification('Image upload failed. Please try again.', 'error');
        console.error(error);
    } finally {
        setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
        addNotification('Please add a cover image.', 'error');
        return;
    }
    const blogData = {
      title,
      excerpt,
      content: `<p>${content.replace(/\n\s*\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`,
      imageUrl,
      category,
      tags,
    };
    onSubmit(blogData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
        <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-highlight focus:border-highlight" />
      </div>
      <div>
        <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">Excerpt</label>
        <textarea id="excerpt" value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={3} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-highlight focus:border-highlight"></textarea>
      </div>
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</label>
        <textarea id="content" value={content} onChange={e => setContent(e.target.value)} rows={10} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-highlight focus:border-highlight"></textarea>
      </div>
      
       <div>
        <label className="block text-sm font-medium text-gray-700">Cover Image</label>
        <div className="mt-2 p-4 border-2 border-dashed border-gray-300 rounded-lg">
            {imageUrl && <img src={imageUrl} alt="Preview" className="w-full max-w-sm rounded-md mb-4 mx-auto" />}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div>
                     <label htmlFor="imageUrl" className="text-sm font-medium text-gray-700">Image URL</label>
                     <input type="url" id="imageUrl" placeholder="https://example.com/image.png" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-highlight focus:border-highlight" />
                </div>
                <div className="text-center">
                    <p className="text-sm text-gray-500 my-2">OR</p>
                    <label htmlFor="image-upload" className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        {uploading ? <Spinner size="sm" /> : <span>Upload a file</span>}
                    </label>
                    <input id="image-upload" name="image-upload" type="file" className="sr-only" onChange={handleUploadFile} disabled={uploading} />
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
          <select id="category" value={category} onChange={e => setCategory(e.target.value)} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-highlight focus:border-highlight sm:text-sm rounded-md">
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Tags</label>
          <TagInput tags={tags} setTags={setTags} />
        </div>
      </div>
      <div className="flex justify-end">
        <button type="submit" disabled={isSubmitting || uploading} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-highlight hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-highlight disabled:bg-gray-400">
          {isSubmitting ? 'Submitting...' : submitButtonText}
        </button>
      </div>
    </form>
  );
};

export default BlogForm;