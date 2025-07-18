export const API_ENDPOINTS = {
  PRODUCTS: '/products',
  CATEGORIES: '/categories',
  CART: '/cart',
  CART_ITEMS: '/cart/items',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    GOOGLE: '/auth/google',
  },
} as const;

export const CURRENCY = {
  CODE: 'TND',
  SYMBOL: 'TND',
  LOCALE: 'fr-TN',
  DECIMAL_PLACES: 3,
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  DEFAULT_PAGE: 1,
} as const;

export const IMAGE_DEFAULTS = {
  PLACEHOLDER: '/images/placeholder.jpg',
  ASPECT_RATIO: 4/3,
} as const;

export const TOAST_DURATION = 3000; // milliseconds

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const; 