export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: Array<{ url: string; isMain: boolean }>;
  category: string;
  stock: number;
  brand: string;
  specifications: {
    weight: string;
    dimensions: string;
    ingredients: string[];
    usage: string;
    warnings: string[];
    storageInstructions: string;
  };
  averageRating: number;
  discount?: {
    percentage: number;
    startDate: string;
    endDate: string;
  };
}

export interface Category {
  _id: string;
  name: string;
  description: string;
  image?: string;
  slug: string;
}

export interface CartItem {
  _id: string;
  product: Product;
  quantity: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  total: number;
}

export interface User {
  _id?: string;  // For backward compatibility
  id: string;    // Primary ID field
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  profilePicture?: string;
  role?: string;
  isAdmin?: boolean;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

// Order related types
export interface OrderItem {
  product: {
    _id: string;
    name: string;
    price: number;
    images?: Array<{ url: string; isMain: boolean }>;
    description?: string;
  };
  quantity: number;
  price: number;
  discount?: number;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface PaymentInfo {
  method: 'cash_on_delivery' | 'credit_card' | 'debit_card';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
}

export interface StatusHistoryEntry {
  status: string;
  date: string;
  note?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: string | User;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentInfo: PaymentInfo;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'ready';
  paymentStatus: string;
  deliveryType: 'pickup' | 'delivery';
  subtotal: number;
  shippingCost: number;
  tax: number;
  totalAmount: number;
  trackingNumber?: string;
  estimatedDeliveryDate?: string;
  estimatedPickupDate?: string;
  notes?: string;
  statusHistory: StatusHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderResponse {
  success: boolean;
  order: Order;
  message?: string;
}

export interface OrdersListResponse {
  success: boolean;
  orders: Order[];
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface OrderStats {
  totalOrders: number;
  totalSpent: number;
  ordersByStatus: Array<{
    _id: string;
    count: number;
    totalAmount: number;
  }>;
}

export interface OrderStatsResponse {
  success: boolean;
  stats: OrderStats;
} 