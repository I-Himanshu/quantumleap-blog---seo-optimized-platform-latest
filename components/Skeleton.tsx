import React from 'react';

const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return <div className={`bg-gray-200 rounded animate-pulse ${className}`}></div>;
};

export const BlogCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
    <Skeleton className="h-48 w-full" />
    <div className="p-6 flex flex-col flex-grow">
      <Skeleton className="h-4 w-24 mb-4" />
      <Skeleton className="h-6 w-full mb-2" />
      <Skeleton className="h-6 w-5/6 mb-4" />
      <Skeleton className="h-10 w-full mb-6" />
      <div className="mt-auto flex items-center">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="ml-3 flex-grow">
          <Skeleton className="h-4 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  </div>
);

export default Skeleton;
