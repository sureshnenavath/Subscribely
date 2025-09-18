import React from 'react';
import { useNavigate } from 'react-router-dom';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-10 max-w-md text-center">
        <h1 className="text-4xl font-extrabold mb-4 text-gray-800 dark:text-gray-100">404</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">Page not found. The URL you entered does not exist.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default NotFound;
