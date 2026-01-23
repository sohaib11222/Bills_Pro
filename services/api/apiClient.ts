import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../../api.config';
import { getAuthToken, removeAuthToken } from '../storage/authStorage';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
    console.log('📤 API Request Data:', config.data ? JSON.stringify(config.data, null, 2) : 'No data');
    console.log('📤 API Request Headers:', JSON.stringify(config.headers, null, 2));
    return config;
  },
  (error: AxiosError) => {
    console.log('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    console.log('📥 API Response:', response.config.method?.toUpperCase(), response.config.url);
    console.log('📥 API Response Status:', response.status);
    console.log('📥 API Response Data:', JSON.stringify(response.data, null, 2));
    return response;
  },
  async (error: AxiosError) => {
    console.log('❌ API Response Error:');
    console.log('Error URL:', error.config?.url);
    console.log('Error Method:', error.config?.method);
    console.log('Error Status:', error.response?.status);
    console.log('Error Response Data:', error.response?.data ? JSON.stringify(error.response.data, null, 2) : 'No data');
    console.log('Error Message:', error.message);
    console.log('Full Error:', error);

    if (error.response) {
      const status = error.response.status;
      
      // Handle 401 Unauthorized - Clear token and redirect to login
      if (status === 401) {
        console.log('🔐 API Response - 401 Unauthorized, clearing token');
        await removeAuthToken();
        // You can add navigation logic here if needed
        // navigationRef.navigate('Auth');
      }
      
      // Handle other errors
      const errorMessage = 
        (error.response.data as any)?.message || 
        error.message || 
        'An error occurred';
      
      console.log('❌ API Response - Rejecting with error:', {
        status,
        message: errorMessage,
        data: error.response.data,
      });
      
      return Promise.reject({
        status,
        message: errorMessage,
        data: error.response.data,
        response: error.response,
      });
    }
    
    // Network error
    if (error.request) {
      console.log('❌ API Response - Network Error:', error.request);
      return Promise.reject({
        status: 0,
        message: 'Network error. Please check your connection.',
        data: null,
      });
    }
    
    console.log('❌ API Response - Unknown Error:', error);
    return Promise.reject(error);
  }
);

export default apiClient;
