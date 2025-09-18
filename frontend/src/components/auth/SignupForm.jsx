import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../ui/Button.jsx';
import { Input } from '../ui/Input.jsx';
import { Card } from '../ui/Card.jsx';
import { User, Mail, Lock, AlertCircle } from 'lucide-react';

export const SignupForm = () => {
  const { signup, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [authLoading, isAuthenticated, navigate]);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    password: '',
    confirm_password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name) newErrors.first_name = 'First name is required';
    if (!formData.last_name) newErrors.last_name = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      const success = await signup(formData);
      if (success) {
        navigate('/dashboard');
      }
    } catch (error) {
      const msg = error?.detail || error?.message || 'An error occurred. Please try again.';
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create Account
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Join Subscribely and start your journey
          </p>
        </div>

        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <span className="text-red-600 dark:text-red-400">{errors.general}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                name="first_name"
                placeholder="First name"
                value={formData.first_name}
                onChange={handleChange}
                className="pl-10"
                error={errors.first_name}
                required
              />
            </div>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                name="last_name"
                placeholder="Last name"
                value={formData.last_name}
                onChange={handleChange}
                className="pl-10"
                error={errors.last_name}
                required
              />
            </div>
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="pl-10"
              error={errors.email}
              required
            />
          </div>

          <div className="relative">
            <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              name="username"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
              className="pl-10"
              error={errors.username}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              type="password"
              name="password"
              placeholder="Create password"
              value={formData.password}
              onChange={handleChange}
              className="pl-10"
              error={errors.password}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              type="password"
              name="confirm_password"
              placeholder="Confirm password"
              value={formData.confirm_password}
              onChange={handleChange}
              className="pl-10"
              error={errors.confirm_password}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            loading={loading}
          >
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};
