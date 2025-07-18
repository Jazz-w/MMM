import { create } from 'zustand';
import * as apiService from '../services/api';
import type { CartItem, User, AuthResponse } from '../types/models';

interface WishlistItem {
  productId: string;
}

interface CartResponse {
  success: boolean;
  items: CartItem[];
  totalAmount: number;
}

interface Store {
  user: User | null;
  isAuthenticated: boolean;
  cart: CartItem[];
  totalAmount: number;
  wishlist: WishlistItem[];
  loading: boolean;
  error: string | null;
  isCartLoading: boolean;
  fetchCart: () => Promise<void>;
  register: (data: { firstName: string; lastName: string; email: string; password: string; phoneNumber: string; }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  addToCart: (productId: string, quantity: number) => Promise<CartResponse>;
  updateCartItemQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  setAuthState: (isAuthenticated: boolean, user: User | null) => void;
}

// Initialize user from localStorage if available
const getInitialUserState = () => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  let user = null;
  
  try {
    if (userStr) {
      user = JSON.parse(userStr);
    }
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
  
  return {
    token,
    user,
    isAuthenticated: !!token && !!user
  };
};

const useStore = create<Store>((set, get) => ({
  user: getInitialUserState().user,
  isAuthenticated: getInitialUserState().isAuthenticated,
  cart: [],
  totalAmount: 0,
  wishlist: [],
  loading: false,
  error: null,
  isCartLoading: false,

  setAuthState: (isAuthenticated: boolean, user: User | null) => {
    set({ isAuthenticated, user });
    if (!isAuthenticated) {
      set({ cart: [], totalAmount: 0 });
    }
  },

  fetchCart: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, skipping cart fetch');
        set({ 
          cart: [],
          totalAmount: 0,
          isCartLoading: false
        });
        return;
      }

      set({ isCartLoading: true, error: null });
      const response = await apiService.getCart() as CartResponse;
      
      if (response.success && Array.isArray(response.items)) {
        console.log('Cart fetched successfully:', response.items.length, 'items');
        set({ 
          cart: response.items.filter((item: CartItem) => item.product != null),
          totalAmount: response.totalAmount,
          isCartLoading: false,
          error: null
        });
      } else {
        console.error('Invalid cart response:', response);
        set({ 
          cart: [],
          totalAmount: 0,
          isCartLoading: false,
          error: 'Failed to fetch cart data'
        });
      }
    } catch (error: any) {
      console.error('Error fetching cart data:', error);
      if (error?.status === 401) {
        console.log('Auth error, clearing state');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ 
          isAuthenticated: false,
          user: null,
          cart: [],
          totalAmount: 0,
          isCartLoading: false,
          error: 'Please login to view your cart'
        });
      } else {
        set({ 
          isCartLoading: false,
          error: error.message || 'Failed to fetch cart',
          cart: [],
          totalAmount: 0
        });
      }
    }
  },

  register: async (data) => {
    try {
      set({ loading: true, error: null });
      await apiService.register(data);
      const response = await apiService.login(data.email, data.password);
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        set({ 
          user: response.user, 
          isAuthenticated: true, 
          loading: false,
          error: null
        });
        await get().fetchCart();
      }
    } catch (error: any) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const errorMessage = error.message || 'Registration failed';
      set({ 
        error: errorMessage, 
        loading: false,
        isAuthenticated: false,
        user: null 
      });
      throw error;
    }
  },

  login: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      const response = await apiService.login(email, password);
      
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        
        const user = {
          ...response.user,
          _id: response.user.id
        };
        localStorage.setItem('user', JSON.stringify(user));
        
        set({ 
          user, 
          isAuthenticated: true, 
          loading: false,
          error: null
        });
        
        // Fetch cart data after successful login
        await get().fetchCart();
      } else {
        throw new Error('Invalid login response from server');
      }
    } catch (error: any) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      const errorMessage = error.message || 'Failed to login';
      set({ 
        error: errorMessage, 
        loading: false,
        isAuthenticated: false,
        user: null 
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ 
      user: null, 
      isAuthenticated: false, 
      cart: [], 
      wishlist: [],
      error: null,
      isCartLoading: false
    });
    window.location.href = '/login';
  },

  addToCart: async (productId: string, quantity: number) => {
    try {
      console.log('Adding to cart:', { productId, quantity });
      const response = await apiService.addToCart(productId, quantity) as CartResponse;
      console.log('Add to cart response:', response);

      if (response.success && Array.isArray(response.items)) {
        console.log('Setting cart state after add:', {
          itemCount: response.items.length,
          totalAmount: response.totalAmount
        });
        set({ 
          cart: response.items,
          totalAmount: response.totalAmount,
          error: null
        });
        return response;
      } else {
        console.error('Invalid add to cart response:', response);
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      set({ error: error.message || 'Failed to add item to cart' });
      throw error;
    }
  },

  updateCartItemQuantity: async (itemId: string, quantity: number) => {
    try {
      console.log('Updating cart item:', { itemId, quantity });
      const response = await apiService.updateCartItem(itemId, quantity) as CartResponse;
      console.log('Update cart response:', response);

      if (response.success && Array.isArray(response.items)) {
        console.log('Setting cart state after update:', {
          itemCount: response.items.length,
          totalAmount: response.totalAmount
        });
        set({ 
          cart: response.items,
          totalAmount: response.totalAmount,
          error: null
        });
      } else {
        console.error('Invalid update cart response:', response);
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Error updating cart:', error);
      set({ error: error.message || 'Failed to update cart item' });
      throw error;
    }
  },

  removeFromCart: async (itemId: string) => {
    try {
      console.log('Removing from cart:', itemId);
      const response = await apiService.removeFromCart(itemId) as CartResponse;
      console.log('Remove from cart response:', response);

      if (response.success && Array.isArray(response.items)) {
        console.log('Setting cart state after remove:', {
          itemCount: response.items.length,
          totalAmount: response.totalAmount
        });
        set({ 
          cart: response.items,
          totalAmount: response.totalAmount,
          error: null
        });
      } else {
        console.error('Invalid remove from cart response:', response);
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Error removing from cart:', error);
      set({ error: error.message || 'Failed to remove item from cart' });
      throw error;
    }
  },

  clearCart: async () => {
    try {
      console.log('Clearing cart');
      const response = await apiService.clearCart() as CartResponse;
      console.log('Clear cart response:', response);

      if (response.success) {
        set({ 
          cart: [],
          totalAmount: 0,
          error: null
        });
      } else {
        console.error('Invalid clear cart response:', response);
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Error clearing cart:', error);
      set({ error: error.message || 'Failed to clear cart' });
      throw error;
    }
  },

  addToWishlist: async (productId: string) => {
    set(state => ({
      wishlist: [...state.wishlist, { productId }]
    }));
  },

  removeFromWishlist: (productId: string) => {
    set(state => ({
      wishlist: state.wishlist.filter(item => item.productId !== productId)
    }));
  },

  isInWishlist: (productId: string) => {
    return get().wishlist.some(item => item.productId === productId);
  }
}));

export default useStore; 