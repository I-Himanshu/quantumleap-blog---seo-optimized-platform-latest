import React from 'react';

const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  };
  return (
    <div className={`animate-spin rounded-full border-4 border-highlight border-t-transparent ${sizeClasses[size]}`}></div>
  );
};

export default Spinner;
