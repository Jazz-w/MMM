// User Types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: 'admin' | 'customer';
  isAdmin: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Auth Types
export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  category: Category;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Order Types
export interface Order {
  id: string;
  user: User;
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  tax: number;
  totalAmount: number;
  shippingAddress: Address;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
}

export type OrderStatus = 'pending' | 'processing' | 'pret_a_porter' | 'payee' | 'cancelled';

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// Stats Types
export interface DashboardStats {
  totalUsers: number;
  customers: number;
  admins: number;
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
  recentOrders: Order[];
  topProducts: {
    product: Product;
    totalSold: number;
    revenue: number;
  }[];
  ordersByStatus: {
    status: OrderStatus;
    count: number;
  }[];
  dailyRevenue: {
    date: string;
    revenue: number;
  }[];
  categoryDistribution: {
    category: Category;
    productCount: number;
    percentage: number;
  }[];
  customerActivity: {
    date: string;
    visits: number;
  }[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Form Types
export interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phoneNumber?: string;
  role: 'admin' | 'customer';
  isAdmin: boolean;
  isActive: boolean;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  categoryId: string;
  isActive: boolean;
}

export interface CategoryFormData {
  name: string;
  description?: string;
  image?: string;
  isActive: boolean;
}

// Table Types
export interface Column<T> {
  id: keyof T | string;
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
  format?: (value: any) => string;
}

// Dialog Types
export interface DialogState {
  open: boolean;
  type: 'create' | 'edit' | 'delete' | 'view' | null;
  data?: any;
}

// Error Types
export interface ApiError {
  message: string;
  code?: string;
  field?: string;
} 