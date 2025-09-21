import axios from 'axios';

// Use the Vite dev server proxy in development; proxy config forwards /api to http://localhost:8000
// In production the API base can be set at build time using Vite env var VITE_API_BASE_URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';
    if (status === 401) {
      if (!requestUrl.includes('/auth/profile')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
