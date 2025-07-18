import { CURRENCY } from '../config/constants';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(CURRENCY.LOCALE, {
    style: 'decimal',
    minimumFractionDigits: CURRENCY.DECIMAL_PLACES,
    maximumFractionDigits: CURRENCY.DECIMAL_PLACES,
  }).format(amount);
}

export function formatPrice(amount: number, withSymbol = true): string {
  const formatted = formatCurrency(amount);
  return withSymbol ? `${formatted} ${CURRENCY.SYMBOL}` : formatted;
}

export function calculateDiscountedPrice(price: number, discountPercentage?: number): number {
  if (!discountPercentage) return price;
  return price * (1 - discountPercentage / 100);
}

export function isDiscountValid(startDate?: string, endDate?: string): boolean {
  if (!startDate || !endDate) return false;
  const now = new Date();
  return new Date(startDate) <= now && new Date(endDate) >= now;
}

export function getMainImage(images: Array<{ url: string; isMain: boolean }>, defaultImage: string): string {
  return images.find(img => img.isMain)?.url || images[0]?.url || defaultImage;
} 