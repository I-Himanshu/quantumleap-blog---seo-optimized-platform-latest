import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Blog from '../models/Blog.js';
import connectDB from '../config/db.js';

dotenv.config();

const seedData = async () => {
    await connectDB();

    try {
        await User.deleteMany();
        await Blog.deleteMany();
        console.log('Old data cleared.');

        const createdUsers = await User.insertMany([
            { name: 'Jane Doe', email: 'user@example.com', password: 'Password123', role: 'User', avatarUrl: 'https://picsum.photos/seed/jane/100/100' },
            { name: 'Alex Smith', email: 'author@example.com', password: 'Password123', role: 'Author', avatarUrl: 'https://picsum.photos/seed/alex/100/100', bio: 'Alex is a seasoned writer exploring the depths of technology.' },
            { name: 'Maria Garcia', email: 'maria@example.com', password: 'Password123', role: 'Author', avatarUrl: 'https://picsum.photos/seed/maria/100/100', bio: 'Maria specializes in UI/UX design.' },
            { name: 'Sam Wilson', email: 'admin@example.com', password: 'Password123', role: 'Admin', avatarUrl: 'https://picsum.photos/seed/sam/100/100' },
        ]);
        console.log('Users seeded.');

        const author1 = createdUsers.find(u => u.email === 'author@example.com');
        const author2 = createdUsers.find(u => u.email === 'maria@example.com');
        const user1 = createdUsers.find(u => u.email === 'user@example.com');
        
        const blogs = [
            {
                title: 'The Future of React: A Deep Dive into Server Components',
                excerpt: 'React Server Components are changing the game. Discover how they work and what it means for your web applications.',
                content: `<p>React Server Components represent one of the most significant shifts in the React paradigm since the introduction of Hooks. They allow developers to write components that run exclusively on the server, reducing bundle sizes and improving initial page load times.</p>`,
                imageUrl: 'https://picsum.photos/seed/react/800/400',
                category: 'Technology',
                tags: ['React', 'Web Development', 'JavaScript'],
                author: author1._id,
                slug: 'the-future-of-react-a-deep-dive-into-server-components-' + Date.now(),
            },
            {
                title: 'Mastering Tailwind CSS for Rapid UI Development',
                excerpt: 'Learn how to leverage the full power of Tailwind CSS to build beautiful, custom designs without ever leaving your HTML.',
                content: '<p>Tailwind CSS has taken the web development world by storm. Its utility-first approach allows for incredible flexibility and speed. In this article, we explore advanced techniques like custom configurations, plugins, and production optimization.</p>',
                imageUrl: 'https://picsum.photos/seed/tailwind/800/400',
                category: 'Design',
                tags: ['CSS', 'TailwindCSS', 'Frontend'],
                author: author2._id,
                slug: 'mastering-tailwind-css-for-rapid-ui-development-' + Date.now(),
            },
            {
                title: 'The Rise of Generative AI and Its Creative Potential',
                excerpt: 'From art to code, generative AI is transforming creative industries. We look at the latest models and their implications.',
                content: '<p>Generative AI models like DALL-E and GPT-4 are no longer science fiction. They are powerful tools that artists, writers, and developers are using to push the boundaries of creativity. This post explores the ethical considerations and exciting possibilities.</p>',
                imageUrl: 'https://picsum.photos/seed/ai/800/400',
                category: 'AI',
                tags: ['Artificial Intelligence', 'Machine Learning', 'Creativity'],
                author: author1._id,
                slug: 'the-rise-of-generative-ai-and-its-creative-potential-' + Date.now(),
            },
        ];

        const createdBlogs = await Blog.insertMany(blogs);
        console.log('Blogs seeded.');
        
        // Add a favorite for the user
        const userToUpdate = await User.findById(user1._id);
        userToUpdate.favorites.push(createdBlogs[0]._id);
        await userToUpdate.save();
        console.log('Sample favorite added.');

        console.log('Database seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
