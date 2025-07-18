import axios from 'axios';
import type { User, AuthResponse, ApiResponse } from '../types/models';
import { config } from '../config/env';

// Use the API URL from environment configuration
const API_URL = config.api.url;
console.log('Environment:', process.env.NODE_ENV);
console.log('Using API URL:', API_URL);
console.log('Hostname:', window.location.hostname);

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Error handling helper
const handleApiError = (error: unknown): ApiError => {
  console.log('API Error:', error);
  
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { 
      response?: { 
        data?: { message?: string, error?: string },
        status?: number 
      },
      code?: string,
      message?: string
    };

    // Add specific handling for k8s service discovery errors
    if (axiosError.code === 'ERR_NETWORK' && IS_PRODUCTION) {
      console.error('Kubernetes service discovery error - check service endpoints');
      return {
        message: 'Service temporarily unavailable',
        status: 503,
        code: 'SERVICE_UNAVAILABLE'
      };
    }

    console.log('API Error Response:', {
      status: axiosError.response?.status,
      data: axiosError.response?.data,
      code: axiosError.code,
      message: axiosError.message
    });

    const errorMessage = 
      axiosError.response?.data?.error || 
      axiosError.response?.data?.message || 
      axiosError.message ||
      'An error occurred';

    return {
      message: errorMessage,
      status: axiosError.response?.status || 500,
      code: axiosError.code
    };
  }

  console.log('Unexpected API Error:', error);
  return {
    message: error instanceof Error ? error.message : 'An unexpected error occurred',
    status: 500
  };
};

// Add a request interceptor to include the auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add a response interceptor for global error handling
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', {
      url: response.config.url,
      status: response.status,
      headers: response.headers,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      headers: error.response?.headers
    });
    return Promise.reject(handleApiError(error));
  }
);

// Product API
export const getProducts = async (params?: { 
  category?: string; 
  categoryId?: string;
  search?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  minRating?: string;
  sort?: string;
  inStock?: string;
  hasDiscount?: string;
}) => {
  try {
    const response = await api.get('/products', { params });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getProductsOnSale = async () => {
  try {
    const response = await api.get('/products/sale');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getFeaturedProducts = async () => {
  try {
    const response = await api.get('/products/featured');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getProduct = async (id: string) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Category API
export const getCategories = async () => {
  try {
    const response = await api.get('/products/categories');
    // If response.data is an array, wrap it in a data property
    return Array.isArray(response.data) ? { data: response.data } : response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Auth API
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    console.log('Attempting login with:', { email });
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    console.log('Login response:', response.data);
    
    // Store the token immediately after successful login
    const { token, user } = response.data;
    if (token) {
      console.log('Storing token in localStorage');
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      console.warn('No token received in login response');
    }
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    const apiError = handleApiError(error);
    throw new Error(apiError.message);
  }
};

export const register = async (data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
}): Promise<void> => {
  try {
    await api.post('/auth/register', data);
  } catch (error) {
    throw handleApiError(error);
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

// Cart API
export const addToCart = async (productId: string, quantity: number) => {
  try {
    console.log('API: Adding to cart:', { productId, quantity });
    const response = await api.post('/products/cart', { productId, quantity });
    console.log('API: Add to cart response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API: Error adding to cart:', error);
    throw handleApiError(error);
  }
};

export const getCart = async () => {
  try {
    console.log('API: Fetching cart');
    const response = await api.get('/products/cart');
    console.log('API: Cart response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API: Error fetching cart:', error);
    throw handleApiError(error);
  }
};

export const updateCartItem = async (itemId: string, quantity: number) => {
  try {
    console.log('API: Updating cart item:', { itemId, quantity });
    const response = await api.put(`/products/cart/${itemId}`, { quantity });
    console.log('API: Update cart response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API: Error updating cart:', error);
    throw handleApiError(error);
  }
};

export const removeFromCart = async (itemId: string) => {
  try {
    console.log('API: Removing from cart:', itemId);
    const response = await api.delete(`/products/cart/${itemId}`);
    console.log('API: Remove from cart response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API: Error removing from cart:', error);
    throw handleApiError(error);
  }
};

export const clearCart = async () => {
  try {
    console.log('API: Clearing cart');
    const response = await api.delete('/products/cart');
    console.log('API: Clear cart response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API: Error clearing cart:', error);
    throw handleApiError(error);
  }
};

// Order API
export const createOrder = async (orderData: {
  deliveryType?: string;
  notes?: string;
  customerDetails?: any;
}) => {
  try {
    console.log('API: Creating order:', orderData);
    const response = await api.post('/orders', orderData);
    console.log('API: Create order response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API: Error creating order:', error);
    throw handleApiError(error);
  }
};

export const getUserOrders = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    console.log('API: Fetching user orders with params:', params);
    const response = await api.get(`/orders?${queryParams}`);
    console.log('API: User orders response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API: Error fetching user orders:', error);
    throw handleApiError(error);
  }
};

export const getOrderById = async (orderId: string) => {
  try {
    console.log('API: Fetching order by ID:', orderId);
    const response = await api.get(`/orders/${orderId}`);
    console.log('API: Order details response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API: Error fetching order details:', error);
    throw handleApiError(error);
  }
};

export const cancelOrder = async (orderId: string, reason?: string) => {
  try {
    console.log('API: Cancelling order:', orderId, 'Reason:', reason);
    const response = await api.put(`/orders/${orderId}/cancel`, { reason });
    console.log('API: Cancel order response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API: Error cancelling order:', error);
    throw handleApiError(error);
  }
};

export const getUserOrderStats = async () => {
  try {
    console.log('API: Fetching user order stats');
    const response = await api.get('/orders/stats');
    console.log('API: Order stats response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API: Error fetching order stats:', error);
    throw handleApiError(error);
  }
};

export const googleLogin = async (credential: string): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/google', { credential });
    const { token } = response.data;
    localStorage.setItem('token', token);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Chatbot API interfaces
interface ChatResponse {
  success: boolean;
  intent?: string;
  response?: string;
  data?: any;
  suggestions?: string[];
  message?: string;
}

interface ChatSuggestion {
  text: string;
  type: string;
}

interface SuggestionsResponse {
  success: boolean;
  suggestions?: ChatSuggestion[];
  message?: string;
}

export const sendChatMessage = async (message: string): Promise<ChatResponse> => {
  try {
    console.log('API: Sending chat message:', message);
    const response = await api.post<ChatResponse>('/chatbot/chat', { message });
    console.log('API: Chat response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API: Error sending chat message:', error);
    throw handleApiError(error);
  }
};

export const getChatSuggestions = async (): Promise<SuggestionsResponse> => {
  try {
    console.log('API: Fetching chat suggestions');
    const response = await api.get<SuggestionsResponse>('/chatbot/suggestions');
    console.log('API: Chat suggestions response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API: Error fetching chat suggestions:', error);
    throw handleApiError(error);
  }
};

export default api; 