import type { CheckoutSession } from '../types/checkout.js';

export const isTestSessionId = (value: string | null): value is string =>
  typeof value === 'string' && /^cs_test_[A-Za-z0-9]{1,200}$/.test(value);

export function isCheckoutSession(value: unknown): value is CheckoutSession {
  if (!value || typeof value !== 'object') return false;
  const data = value as Partial<CheckoutSession>;
  return isTestSessionId(data.sessionId ?? null) &&
    typeof data.paymentStatus === 'string' && data.currency === 'cad' &&
    typeof data.amountTotal === 'number' && Number.isSafeInteger(data.amountTotal) && data.amountTotal >= 0 &&
    (data.customerEmail === null || typeof data.customerEmail === 'string') &&
    Array.isArray(data.items) && data.items.length > 0 &&
    data.items.every((item) => item && typeof item.name === 'string' &&
      Number.isSafeInteger(item.quantity) && item.quantity > 0 &&
      Number.isSafeInteger(item.amountTotal) && item.amountTotal >= 0);
}
