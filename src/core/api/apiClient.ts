import axios from 'axios';
import { storage } from '../storage/storage';

const API_BASE_URL = 'https://api.example.com'; // We will use a mock service for now

/**
 * Reusable Networking Layer
 * Centralizes all network configurations, timeouts, and error handling.
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach authentication tokens
apiClient.interceptors.request.use(
  async (config) => {
    const token = await storage.getItem<string>('AUTH_TOKEN');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for centralized error parsing and handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    // Network detection / timeout handling
    if (!error.response) {
      console.warn('Network Error or Timeout. Attempting retry...');
      config.__retryCount = config.__retryCount || 0;
      
      if (config.__retryCount < 3) {
        config.__retryCount += 1;
        // Exponential backoff
        const backoff = new Promise(resolve => setTimeout(resolve, config.__retryCount * 1000));
        await backoff;
        return apiClient(config);
      }
      console.error('Network Error: Max retries reached.');
    } else if (error.response?.status === 401) {
      // Global handling for 401 Unauthorized
      console.error('Unauthorized response. Consider clearing session.');
    }
    
    // Parse error for UI consumption safely without exposing sensitive backend details
    const sanitizedError = new Error(
      error.response?.data?.message || 'An unexpected error occurred. Please try again.'
    );
    return Promise.reject(sanitizedError);
  }
);
