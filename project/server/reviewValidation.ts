import type { ReviewInput } from '../shared/reviews.js';

export function parseProductId(value: string): number | null {
  if (!/^-?\d+$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}

export function validateReview(body: unknown): ReviewInput | null {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const { reviewerName, rating, comment } = body as Record<string, unknown>;
  if (typeof reviewerName !== 'string' || typeof comment !== 'string' ||
      typeof rating !== 'number' || !Number.isInteger(rating) || rating < 1 || rating > 5) return null;
  const name = reviewerName.trim();
  const text = comment.trim();
  if (!name || name.length > 50 || !text || text.length > 1000) return null;
  return { reviewerName: name, rating, comment: text };
}
