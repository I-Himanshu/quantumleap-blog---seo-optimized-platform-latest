
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="text-center py-20">
      <h1 className="text-6xl font-bold text-highlight font-serif">404</h1>
      <p className="text-2xl font-semibold mt-4 text-primary">Page Not Found</p>
      <p className="text-accent mt-2">Sorry, the page you are looking for does not exist.</p>
      <Link
        to="/"
        className="mt-8 inline-block bg-highlight text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors"
      >
        Go Back Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
