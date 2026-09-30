import axios from 'axios';

let rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
rawBaseUrl = rawBaseUrl.trim().replace(/\/+$/, '');
if (!rawBaseUrl.endsWith('/api')) {
  rawBaseUrl += '/api';
}

const api = axios.create({
  baseURL: rawBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;
