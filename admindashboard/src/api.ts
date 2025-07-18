import axios from 'axios';
import { User } from './types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies
  timeout: 10000, // 10 second timeout
});

// Add token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  console.error('Request interceptor error:', error);
  return Promise.reject(error);
});

// Add response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    });
    
    if (error.response?.status === 401) {
      // Only clear storage and redirect for token expiration
      // not for login failures
      if (error.config?.url !== '/auth/login') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    // Preserve the original error structure for proper error handling
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await axiosInstance.post('/auth/login', { email, password });
    return response.data;
  },
  
  googleLogin: async (credential: string) => {
    const response = await axiosInstance.post('/auth/google', { credential });
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getAll: async (): Promise<User[]> => {
    const response = await axiosInstance.get('/admin/users');
    return response.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await axiosInstance.get(`/admin/users/${id}`);
    return response.data;
  },

  create: async (data: Partial<User> & { password: string }): Promise<User> => {
    const response = await axiosInstance.post('/admin/users', data);
    return response.data;
  },

  update: async (id: string, data: Partial<User>): Promise<User> => {
    const response = await axiosInstance.put(`/admin/users/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/admin/users/${id}`);
  },
};

// Products API
export const productsAPI = {
  getAll: async () => {
    const response = await axiosInstance.get('/admin/products');
    return response.data;
  },
  create: async (productData: {
    name: string;
    description: string;
    price: number;
    stock: number;
    image: string;
    categoryId: string;
    isActive: boolean;
  }) => {
    const response = await axiosInstance.post('/admin/products', productData);
    return response.data;
  },
  update: async (id: string, productData: {
    name?: string;
    description?: string;
    price?: number;
    stock?: number;
    image?: string;
    categoryId?: string;
    isActive?: boolean;
  }) => {
    const response = await axiosInstance.put(`/admin/products/${id}`, productData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await axiosInstance.delete(`/admin/products/${id}`);
    return response.data;
  },
};

// Categories API
export const categoriesAPI = {
  getAll: async () => {
    const response = await axiosInstance.get('/admin/categories');
    return response.data;
  },
  create: async (categoryData: {
    name: string;
    description?: string;
    image?: string;
    isActive: boolean;
  }) => {
    const response = await axiosInstance.post('/admin/categories', categoryData);
    return response.data;
  },
  update: async (id: string, categoryData: {
    name?: string;
    description?: string;
    image?: string;
    isActive?: boolean;
  }) => {
    const response = await axiosInstance.put(`/admin/categories/${id}`, categoryData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await axiosInstance.delete(`/admin/categories/${id}`);
    return response.data;
  },
};

// Orders API
export const ordersAPI = {
  getAll: async () => {
    const response = await axiosInstance.get('/admin/orders');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await axiosInstance.get(`/admin/orders/${id}`);
    return response.data;
  },
  updateStatus: async (id: string, status: string) => {
    const response = await axiosInstance.put(`/admin/orders/${id}/status`, { status });
    return response.data;
  },
};

// Dashboard Stats API
export const statsAPI = {
  getDashboardStats: async () => {
    try {
      const response = await axiosInstance.get('/admin/stats');
      console.log('Stats API Response:', response.data); // Debug log
      
      // Ensure the response has the expected shape
      const stats = response.data;
      if (!stats.ordersByStatus) {
        stats.ordersByStatus = [];
      }
      if (!stats.recentOrders) {
        stats.recentOrders = [];
      }
      if (!stats.topProducts) {
        stats.topProducts = [];
      }
      
      return stats;
    } catch (error) {
      console.error('Stats API Error:', error);
      throw error;
    }
  },
};

export default axiosInstance; 