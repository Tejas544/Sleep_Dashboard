import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject the JWT before the request leaves the browser
api.interceptors.request.use(
  (config) => {
    let token = null;
    
    // We must parse the specific JSON structure Zustand creates in localStorage
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem('sleep-auth-storage');
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData);
          token = parsed?.state?.token;
        } catch (e) {
          console.error('[AXIOS] Failed to parse auth storage:', e);
        }
      }
    }
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Global Error Handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If the backend rejects the token (expired/tampered), force a logout
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/'; 
      }
    }
    return Promise.reject(error);
  }
);

/**
 * NEW: ML Pipeline Integration
 * Sends the CSV file to the Node.js -> Python backend for analysis.
 */
export const uploadCsvForAnalysis = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file); // 'file' MUST match the backend Multer configuration

  try {
    const response = await api.post('/upload', formData, {
      headers: {
        // Override the default application/json for this specific request
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data; // Returns { success, metrics, timeseries }
  } catch (error: any) {
    console.error('[AXIOS] ML Upload failed:', error);
    // Extract the exact error message thrown by the Python script via Node
    throw new Error(error.response?.data?.error || 'Failed to analyze CSV. Please try again.');
  }
};

export default api;
