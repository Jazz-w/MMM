import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Price formatting for Tunisian Dinar
export function formatPrice(price?: number | null): string {
  if (price === undefined || price === null) {
    return '0.00 TND';
  }
  return `${price.toFixed(2)} TND`;
}

// Get placeholder image for products
export function getProductImageOrPlaceholder(imageUrl?: string): string {
  // Use the existing screenshot images as placeholders
  const placeholders = [
    '/images/Screenshot 2025-06-26 152648.png',
    '/images/Screenshot 2025-06-26 152659.png'
  ];
  
  if (!imageUrl || imageUrl.trim() === '') {
    // Randomly select one of the screenshot placeholders
    const randomIndex = Math.floor(Math.random() * placeholders.length);
    return placeholders[randomIndex];
  }
  
  return imageUrl;
}
