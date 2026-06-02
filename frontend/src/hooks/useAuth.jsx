import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize Auth state from local storage token
  const initializeAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Fetch current user details from profile endpoint
        const profile = await authService.getProfile();
        setUser({
          id: profile.id,
          name: profile.name,
          email: profile.email,
        });
      } catch (err) {
        console.error('Failed to validate session token:', err);
        // Clear invalid token
        authService.logout();
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    initializeAuth();

    // Listen for global auth expiration events from axios interceptor
    const handleAuthExpired = () => {
      setUser(null);
      authService.logout();
    };

    window.addEventListener('auth-expired', handleAuthExpired);
    return () => {
      window.removeEventListener('auth-expired', handleAuthExpired);
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      // Immediately fetch profile after setting token to populate user state
      const profile = await authService.getProfile();
      const userData = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return data;
    } catch (err) {
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const data = await authService.register(name, email, password);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser: initializeAuth, // Expose a manual refresh capability
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
