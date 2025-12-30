// API configuration utility
export const API_BASE_URL = (typeof window !== 'undefined' && import.meta?.env?.VITE_API_URL) 
  ? import.meta.env.VITE_API_URL 
  : process.env.VITE_API_URL || 'https://akhizwe-backend.onrender.com';

// Helper function to build API URLs
export const buildApiUrl = (endpoint) => {
  return `${API_BASE_URL}/api/${endpoint}`;
};

// Helper function for authenticated requests
export const authenticatedFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildApiUrl(endpoint), {
    ...options,
    headers,
  });

  return response;
};