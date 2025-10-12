
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary text-light mt-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
        <p>&copy; {new Date().getFullYear()} QuantumLeap Blog. All rights reserved.</p>
        <div className="flex justify-center space-x-6 mt-4">
          <a href="#" className="hover:text-highlight transition-colors">Twitter</a>
          <a href="#" className="hover:text-highlight transition-colors">GitHub</a>
          <a href="#" className="hover:text-highlight transition-colors">LinkedIn</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
