import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject the Bearer token into every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration globally
api.interceptors.response.use(      
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear stored auth data if the token is invalid/expired
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_account');
      
      // Force redirect to the landing/login page
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);  

export default api;