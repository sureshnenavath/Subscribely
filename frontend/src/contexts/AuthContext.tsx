import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_superuser: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: SignupData) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

interface SignupData {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  password: string;
  confirm_password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Run the initial auth check once on mount
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

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post('/auth/login/', { email, password });
      setUser(response.data.user);
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      // Normalize the backend error to an object with `detail` string
      const data = error.response?.data;
      let detail = 'Login failed';
      if (data) {
        if (typeof data === 'string') detail = data;
        else if (data.detail) detail = data.detail;
        else if (data.non_field_errors) detail = data.non_field_errors.join(' ');
        else detail = JSON.stringify(data);
      }
      throw { detail };
    }
  };

  const signup = async (userData: SignupData): Promise<boolean> => {
    try {
      // Use /auth/register/ to match assessment naming
      const response = await api.post('/auth/register/', userData);
      setUser(response.data.user);
      return true;
    } catch (error: any) {
      console.error('Signup error:', error);
      const data = error.response?.data;
      let detail = 'Signup failed';
      if (data) {
        if (typeof data === 'string') detail = data;
        else if (data.detail) detail = data.detail;
        else if (data.non_field_errors) detail = data.non_field_errors.join(' ');
        else if (typeof data === 'object') {
          // Choose first field error message if present
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