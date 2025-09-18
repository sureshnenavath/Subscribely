import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    if (mounted) checkAuthStatus();
    return () => { mounted = false; };
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await api.get('/auth/profile/');
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (identifier, password) => {
    try {
  // Send identifier (email or username) and password. Backend will resolve it.
  const payload = { identifier, password };
  const response = await api.post('/auth/login/', payload);
      setUser(response.data.user);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      const data = error.response?.data;
      let detail = 'Login failed';
      if (data) {
        if (typeof data === 'string') detail = data;
        else if (data.detail) detail = data.detail;
        else if (data.non_field_errors) detail = data.non_field_errors.join(' ');
        else if (typeof data === 'object') {
          const firstKey = Object.keys(data)[0];
          const val = data[firstKey];
          if (Array.isArray(val)) detail = val.join(' ');
          else detail = String(val);
        } else detail = JSON.stringify(data);
      }
      throw { detail };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await api.post('/auth/register/', userData);
      setUser(response.data.user);
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      const data = error.response?.data;
      let detail = 'Signup failed';
      if (data) {
        if (typeof data === 'string') detail = data;
        else if (data.detail) detail = data.detail;
        else if (data.non_field_errors) detail = data.non_field_errors.join(' ');
        else if (typeof data === 'object') {
          const firstKey = Object.keys(data)[0];
          const val = data[firstKey];
          if (Array.isArray(val)) detail = val.join(' ');
          else detail = String(val);
        } else detail = JSON.stringify(data);
      }
      throw { detail };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
