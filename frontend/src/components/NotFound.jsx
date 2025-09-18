import React from 'react';
import { Link } from 'react-router-dom';

export const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white">404</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mt-4">Page not found</p>
        <div className="mt-6">
          <Link to="/" className="text-blue-600 dark:text-blue-400">Go home</Link>
        </div>
      </div>
    </div>
  );
};
