import React, { useState, useEffect, useRef } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole, Blog, User, AdminAnalytics, AuthorAnalytics } from '../types';
import { getAllBlogs, getAllUsers, deleteBlog as apiDeleteBlog, deleteUser as apiDeleteUser, getBlogsByAuthorId, getAdminAnalytics, getAuthorAnalytics } from '../services/api';
import Spinner from '../components/Spinner';
import { useNotification } from '../context/NotificationContext';

declare const Chart: any; // Using Chart.js from CDN

const DashboardPage: React.FC = () => {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  
  if (authLoading) {
    return <div className="flex justify-center items-center h-64"><Spinner /></div>;
  }
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const renderDashboardContent = () => {
    switch (user.role) {
      case UserRole.AUTHOR:
        return <AuthorDashboard author={user} />;
      case UserRole.ADMIN:
        return <AdminDashboard admin={user} />;
      case UserRole.USER:
        return <UserDashboard user={user} />;
      default:
        return <p>Welcome to your dashboard.</p>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md min-h-[60vh]">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-primary font-serif">Dashboard</h1>
                    <p className="text-accent mt-2">Welcome back, {user.name}!</p>
                </div>
                {(user.role === UserRole.AUTHOR || user.role === UserRole.ADMIN) && (
                    <Link to="/create-post" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-highlight hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-highlight">
                        Create New Post
                    </Link>
                )}
            </div>
            <div className="mt-8">
                {renderDashboardContent()}
            </div>
        </div>
      </div>
    </div>
  );
};

// ... UserDashboard, AuthorDashboard, AdminDashboard follow

const UserDashboard: React.FC<{ user: User }> = ({ user }) => {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const { user: currentUser } = useAuth();

    useEffect(() => {
        if (!currentUser) return;
        const fetchFavoriteBlogs = async () => {
            try {
                const { data: allBlogs } = await getAllBlogs();
                const favoriteBlogs = allBlogs.filter((blog: Blog) => currentUser.favorites.includes(blog._id));
                setBlogs(favoriteBlogs);
            } catch (error) {
                console.error("Failed to fetch favorites", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFavoriteBlogs();
    }, [currentUser]);

    if (loading) return <div className="flex justify-center py-10"><Spinner /></div>;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4 font-serif">Your Favorite Articles</h2>
            {blogs.length > 0 ? (
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {blogs.map(blog => (
                         <div key={blog._id} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                            <h3 className="font-semibold text-primary truncate">{blog.title}</h3>
                            <p className="text-sm text-accent">by {blog.author.name}</p>
                            <Link to={`/blog/${blog.slug}`} className="text-sm font-medium text-highlight hover:underline mt-2 inline-block">Read More &rarr;</Link>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-accent">You haven't favorited any articles yet. Explore the homepage to find articles you love!</p>
            )}
        </div>
    );
};

const AuthorDashboard: React.FC<{ author: User }> = ({ author }) => {
    const [activeTab, setActiveTab] = useState<'content' | 'analytics'>('content');

    return (
        <div>
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('content')} className={`${activeTab === 'content' ? 'border-highlight text-highlight' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>My Content</button>
                    <button onClick={() => setActiveTab('analytics')} className={`${activeTab === 'analytics' ? 'border-highlight text-highlight' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Analytics</button>
                </nav>
            </div>
            <div className="mt-6">
                {activeTab === 'content' && <AuthorContentManagement author={author} />}
                {activeTab === 'analytics' && <AuthorAnalyticsView />}
            </div>
        </div>
    );
};


const AdminDashboard: React.FC<{ admin: User }> = ({ admin }) => {
    const [activeTab, setActiveTab] = useState<'blogs' | 'users' | 'analytics'>('blogs');

    return (
        <div>
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('blogs')} className={`${activeTab === 'blogs' ? 'border-highlight text-highlight' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Manage Blogs</button>
                    <button onClick={() => setActiveTab('users')} className={`${activeTab === 'users' ? 'border-highlight text-highlight' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Manage Users</button>
                    <button onClick={() => setActiveTab('analytics')} className={`${activeTab === 'analytics' ? 'border-highlight text-highlight' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Analytics</button>
                </nav>
            </div>
            <div className="mt-6">
                {activeTab === 'blogs' && <BlogManagementTable />}
                {activeTab === 'users' && <UserManagementTable admin={admin} />}
                {activeTab === 'analytics' && <AdminAnalyticsView />}
            </div>
        </div>
    );
};

// ... Management Tables ...
const AuthorContentManagement: React.FC<{ author: User }> = ({ author }) => {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const { addNotification } = useNotification();
    const navigate = useNavigate();

    useEffect(() => {
        getBlogsByAuthorId(author._id)
            .then(({ data }) => setBlogs(data))
            .catch(err => console.error("Failed to fetch author blogs", err))
            .finally(() => setLoading(false));
    }, [author._id]);

    const handleDeletePost = async (blogId: string) => {
        if (window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
            try {
                await apiDeleteBlog(blogId);
                setBlogs(blogs.filter(b => b._id !== blogId));
                addNotification('Post deleted successfully.', 'success');
            } catch (error) {
                addNotification('Could not delete the post. Please try again.', 'error');
            }
        }
    };
    if (loading) return <div className="flex justify-center py-10"><Spinner /></div>;
    return (
        <div>
            {blogs.length > 0 ? (
                <div className="space-y-4">
                    {blogs.map(blog => (
                        <div key={blog._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg shadow-sm flex-wrap gap-4">
                            <div>
                                <h3 className="font-semibold text-primary">{blog.title}</h3>
                                <p className="text-sm text-accent">Published: {new Date(blog.createdAt).toLocaleDateString()} &middot; {blog.viewCount} views</p>
                            </div>
                            <div className="space-x-2 flex-shrink-0">
                                <button onClick={() => navigate(`/edit-post/${blog.slug}`)} className="px-3 py-1 text-sm font-medium text-white bg-highlight rounded-md hover:bg-blue-700">Edit</button>
                                <button onClick={() => handleDeletePost(blog._id)} className="px-3 py-1 text-sm font-medium text-white bg-danger rounded-md hover:bg-red-700">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : <p className="text-accent">You haven't published any articles yet.</p>}
        </div>
    );
};

// Fix: Implemented the BlogManagementTable component to return JSX, resolving the type error.
const BlogManagementTable: React.FC = () => {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const { addNotification } = useNotification();
    const navigate = useNavigate();

    useEffect(() => {
        getAllBlogs()
            .then(({ data }) => setBlogs(data))
            .catch(err => console.error("Failed to fetch blogs", err))
            .finally(() => setLoading(false));
    }, []);

    const handleDeleteBlog = async (blogId: string) => {
        if (window.confirm("Are you sure you want to delete this blog? This action is permanent.")) {
            try {
                await apiDeleteBlog(blogId);
                setBlogs(blogs.filter(b => b._id !== blogId));
                addNotification('Blog deleted successfully.', 'success');
            } catch (error) {
                addNotification('Could not delete the blog. Please try again.', 'error');
            }
        }
    };

    if (loading) return <div className="flex justify-center py-10"><Spinner /></div>;

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {blogs.map(blog => (
                        <tr key={blog._id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{blog.title}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{blog.author.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{blog.viewCount}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(blog.createdAt).toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                <button onClick={() => navigate(`/edit-post/${blog.slug}`)} className="text-highlight hover:text-blue-700">Edit</button>
                                <button onClick={() => handleDeleteBlog(blog._id)} className="text-danger hover:text-red-700">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
// Fix: Implemented the UserManagementTable component to return JSX, resolving the type error.
const UserManagementTable: React.FC<{ admin: User }> = ({ admin }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const { addNotification } = useNotification();

    useEffect(() => {
        getAllUsers()
            .then(({ data }) => setUsers(data))
            .catch(err => console.error("Failed to fetch users", err))
            .finally(() => setLoading(false));
    }, []);

    const handleDeleteUser = async (userId: string) => {
        if (userId === admin._id) {
            addNotification("You cannot delete your own account.", "error");
            return;
        }
        if (window.confirm("Are you sure you want to delete this user? This will also delete their content.")) {
            try {
                await apiDeleteUser(userId);
                setUsers(users.filter(u => u._id !== userId));
                addNotification('User deleted successfully.', 'success');
            } catch (error) {
                addNotification('Could not delete the user. Please try again.', 'error');
            }
        }
    };

    if (loading) return <div className="flex justify-center py-10"><Spinner /></div>;

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {users.map(user => (
                        <tr key={user._id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                {user._id !== admin._id && (
                                    <button onClick={() => handleDeleteUser(user._id)} className="text-danger hover:text-red-700">Delete</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


// Analytics Components
const StatCard: React.FC<{ title: string; value: string | number }> = ({ title, value }) => (
    <div className="bg-gray-100 p-6 rounded-lg shadow-sm text-center">
        <p className="text-sm font-medium text-accent uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-bold text-primary mt-2">{value}</p>
    </div>
);

const AuthorAnalyticsView: React.FC = () => {
    const [data, setData] = useState<AuthorAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const chartRef = useRef<any>(null); // To hold the chart instance
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        getAuthorAnalytics()
            .then(({ data }) => setData(data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (canvasRef.current && data) {
            if (chartRef.current) {
                chartRef.current.destroy(); // Destroy previous instance
            }
            const ctx = canvasRef.current.getContext('2d');
            if (!ctx) return;
            
            const labels = data.viewsLast30Days.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            const chartData = data.viewsLast30Days.map(d => d.count);
            
            chartRef.current = new Chart(ctx, {
                type: 'line',
                data: {
                    labels,
                    datasets: [{
                        label: 'Views per Day',
                        data: chartData,
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }
        return () => chartRef.current?.destroy();
    }, [data]);

    if (loading) return <div className="flex justify-center py-10"><Spinner /></div>;
    if (!data) return <p className="text-accent">Could not load analytics data.</p>;

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Posts" value={data.totalPosts} />
                <StatCard title="Total Views" value={data.totalViews.toLocaleString()} />
                <StatCard title="Total Comments" value={data.totalComments} />
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Views (Last 30 Days)</h3>
                <div className="relative h-72"><canvas ref={canvasRef}></canvas></div>
            </div>
            <div>
                 <h3 className="text-lg font-semibold mb-4">Top Performing Posts</h3>
                 <div className="space-y-3">
                     {data.topPosts.map(post => (
                         <div key={post._id} className="p-4 bg-gray-50 rounded-md flex justify-between items-center">
                             <p className="font-medium text-primary">{post.title}</p>
                             <p className="font-semibold text-highlight">{post.viewCount.toLocaleString()} views</p>
                         </div>
                     ))}
                 </div>
            </div>
        </div>
    );
};

const AdminAnalyticsView: React.FC = () => {
    const [data, setData] = useState<AdminAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const lineChartRef = useRef<any>(null);
    const pieChartRef = useRef<any>(null);
    const lineCanvasRef = useRef<HTMLCanvasElement>(null);
    const pieCanvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        getAdminAnalytics()
            .then(({ data }) => setData(data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!data) return;
        
        // Line Chart
        if (lineCanvasRef.current) {
            if (lineChartRef.current) lineChartRef.current.destroy();
            const ctx = lineCanvasRef.current.getContext('2d');
            if(ctx) {
                const labels = data.postsLast30Days.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
                lineChartRef.current = new Chart(ctx, {
                    type: 'line',
                    data: { labels, datasets: [{ label: 'Posts Created', data: data.postsLast30Days.map(d => d.count), borderColor: '#3B82F6', fill: true, tension: 0.3 }] },
                    options: { responsive: true, maintainAspectRatio: false }
                });
            }
        }

        // Pie Chart
        if (pieCanvasRef.current) {
            if (pieChartRef.current) pieChartRef.current.destroy();
            const ctx = pieCanvasRef.current.getContext('2d');
            if(ctx) {
                pieChartRef.current = new Chart(ctx, {
                    type: 'pie',
                    data: {
                        labels: data.userRoleDistribution.map(d => d._id),
                        datasets: [{
                            data: data.userRoleDistribution.map(d => d.count),
                            backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#6B7280'],
                        }]
                    },
                    options: { responsive: true, maintainAspectRatio: false }
                });
            }
        }

        return () => {
            lineChartRef.current?.destroy();
            pieChartRef.current?.destroy();
        };
    }, [data]);
    
    if (loading) return <div className="flex justify-center py-10"><Spinner /></div>;
    if (!data) return <p className="text-accent">Could not load analytics data.</p>;

    return (
         <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Users" value={data.totalUsers} />
                <StatCard title="Total Posts" value={data.totalPosts} />
                <StatCard title="Total Views" value={data.totalViews.toLocaleString()} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 bg-gray-50 p-6 rounded-lg">
                     <h3 className="text-lg font-semibold mb-4">Posts Created (Last 30 Days)</h3>
                     <div className="relative h-72"><canvas ref={lineCanvasRef}></canvas></div>
                </div>
                 <div className="lg:col-span-2 bg-gray-50 p-6 rounded-lg">
                     <h3 className="text-lg font-semibold mb-4">User Roles</h3>
                     <div className="relative h-72"><canvas ref={pieCanvasRef}></canvas></div>
                </div>
            </div>
        </div>
    );
};
export default DashboardPage;