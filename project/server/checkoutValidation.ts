import { MAX_QUANTITY, productCatalog } from '../shared/catalog/products.js';

export interface CheckoutItem {
  productId: number;
  quantity: number;
}

export function validateCheckoutItems(body: unknown): CheckoutItem[] | null {
  if (!body || typeof body !== 'object' || !('items' in body)) return null;
  const { items } = body;
  if (!Array.isArray(items) || items.length === 0 || items.length > productCatalog.size) {
    return null;
  }

  const seen = new Set<number>();
  const validated: CheckoutItem[] = [];
  for (const item of items) {
    if (!item || typeof item !== 'object') return null;
    const { productId, quantity } = item;
    if (
      !Number.isInteger(productId) || !productCatalog.has(productId) ||
      !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY ||
      seen.has(productId)
    ) return null;
    seen.add(productId);
    validated.push({ productId, quantity });
  }
  return validated;
}
