import React, { forwardRef } from 'react';

export const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`
          w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
          placeholder-gray-500 dark:placeholder-gray-400
          transition-colors duration-200
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
});
