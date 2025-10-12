import React from 'react';

interface NotificationToastProps {
  message: string;
  type: 'success' | 'error';
  onDismiss: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ message, type, onDismiss }) => {
  const baseClasses = "flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow-lg";
  const typeClasses = {
    success: 'text-green-500 bg-green-100',
    error: 'text-red-500 bg-red-100',
  };

  const Icon = () => {
    if (type === 'success') {
      return (
        <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 ${typeClasses.success} rounded-lg`}>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
        </div>
      );
    }
    return (
      <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 ${typeClasses.error} rounded-lg`}>
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.697a1 1 0 010-1.404z" clipRule="evenodd"></path></svg>
      </div>
    );
  };
  
  return (
    <div className={baseClasses} role="alert">
      <Icon />
      <div className="ml-3 text-sm font-normal text-primary">{message}</div>
      <button type="button" onClick={onDismiss} className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8" aria-label="Close">
        <span className="sr-only">Close</span>
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.697a1 1 0 010-1.404z" clipRule="evenodd"></path></svg>
      </button>
    </div>
  );
};


export default NotificationToast;
