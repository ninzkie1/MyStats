import { createContext, useContext, useState, useEffect } from 'react';
import { logout as apiLogout } from '../services/api';
import {
  getStoredUser,
  setStoredUser,
  clearStoredUser,
} from '../utils/authStorage';

const AuthContext = createContext(null);

const normalizeUser = (userData) => {
  if (!userData) return null;

  if (userData.data && typeof userData.data === 'object') {
    return {
      ...userData.data,
      success: userData.success,
    };
  }

  return userData;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(normalizeUser(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, rememberMe = true) => {
    const normalizedUser = normalizeUser(userData);
    setUser(normalizedUser);
    setStoredUser(userData, rememberMe);
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setUser(null);
      clearStoredUser();
    }
  };

  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
