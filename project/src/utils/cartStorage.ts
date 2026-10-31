import type { CartItem, Product } from '../types/catalog.js';
import { MAX_QUANTITY } from '../../shared/catalog/products.js';

export const CART_STORAGE_KEY = 'worknest-cart';
export const MAX_CART_QUANTITY = MAX_QUANTITY;

interface CartStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function restoreCart(storage: CartStorage, products: Product[]): CartItem[] {
  try {
    const stored: unknown = JSON.parse(storage.getItem(CART_STORAGE_KEY) ?? '[]');
    if (!Array.isArray(stored)) return [];
    const seen = new Set<number>();
    const items: CartItem[] = [];
    for (const item of stored) {
      if (!item || typeof item !== 'object') continue;
      const product = products.find((candidate) => candidate.id === item.productId);
      if (
        !product || seen.has(product.id) || !Number.isInteger(item.quantity) ||
        item.quantity < 1 || item.quantity > MAX_CART_QUANTITY
      ) continue;
      seen.add(product.id);
      items.push({ product, quantity: item.quantity });
    }
    return items;
  } catch {
    return [];
  }
}

export function persistCart(storage: CartStorage, items: CartItem[]): boolean {
  try {
    if (items.length === 0) {
      storage.removeItem(CART_STORAGE_KEY);
    } else {
      storage.setItem(CART_STORAGE_KEY, JSON.stringify(items.map(({ product, quantity }) => ({
        productId: product.id,
        quantity,
      }))));
    }
    return true;
  } catch {
    return false;
  }
}
