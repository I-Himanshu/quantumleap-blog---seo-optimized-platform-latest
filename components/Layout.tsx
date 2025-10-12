import React, { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useNotification } from '../context/NotificationContext';
import NotificationToast from './Notification';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <Footer />
      
      {/* Notification Container */}
      <div className="fixed top-5 right-5 z-[100]">
        {notifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            message={notification.message}
            type={notification.type}
            onDismiss={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Layout;
