import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { login as apiLogin, logout as apiLogout, getMe, toggleFavorite as apiToggleFavorite, register as apiRegister } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  loading: boolean;
  toggleFavorite: (blogId: string) => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const { data: userData } = await getMe();
          const userWithId = { ...userData, id: userData._id };
          setUser(userWithId);
        } catch (error) {
          console.error("Session expired or invalid, logging out.", error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const { data } = await apiLogin({ email, password });
      localStorage.setItem('accessToken', data.accessToken);
      const userWithId = { ...data, id: data._id };
      setUser(userWithId);
      localStorage.setItem('user', JSON.stringify(userWithId));
      return userWithId;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await apiRegister({ name, email, password });
      return response;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };


  const logout = async () => {
    try {
        await apiLogout();
    } catch (error) {
        console.error("Logout API call failed, proceeding with client-side logout.", error);
    }
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  };

  const toggleFavorite = async (blogId: string) => {
    if (!user) return;
    try {
      const { data: updatedUser } = await apiToggleFavorite(blogId);
      const userWithId = { ...updatedUser, id: updatedUser._id };
      setUser(userWithId);
      localStorage.setItem('user', JSON.stringify(userWithId));
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      throw error; // re-throw to be caught in component
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    loading,
    toggleFavorite,
    setUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
