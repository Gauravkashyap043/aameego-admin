import axios from 'axios';
import { baseUrl } from '../utils/baseUrl';

const api = axios.create({
  baseURL: baseUrl,
});

// Request interceptor for authentication and file upload
api.interceptors.request.use(
  (config) => {
    // Attach token if present
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    // For file uploads, let the browser set the Content-Type (multipart/form-data with boundary)
    if (
      config.data instanceof FormData &&
      config.headers &&
      config.headers['Content-Type'] === 'application/json'
    ) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api; 