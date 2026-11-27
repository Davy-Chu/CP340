import type { ProductReviewsResponse, Review, ReviewInput } from '../../shared/reviews';

export async function fetchReviews(productId: number, signal: AbortSignal): Promise<ProductReviewsResponse> {
  const response = await fetch(`/api/products/${productId}/reviews`, { signal });
  if (!response.ok) throw new Error("We couldn't load reviews. Please try again.");
  return response.json();
}

export async function submitReview(productId: number, input: ReviewInput, signal: AbortSignal): Promise<Review> {
  const response = await fetch(`/api/products/${productId}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    signal,
  });
  if (!response.ok) throw new Error("We couldn't save your review. Please try again.");
  return response.json();
}
