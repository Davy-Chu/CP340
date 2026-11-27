import { Router } from 'express';
import { productCatalog } from '../shared/catalog/products.js';
import type { ReviewService } from './reviewService.js';
import { parseProductId, validateReview } from './reviewValidation.js';
import { ReviewConfigurationError } from './supabase.js';

function reportFailure(error: unknown) {
  // Provider errors can contain URLs or credentials. Only log our safe messages.
  console.error(error instanceof ReviewConfigurationError ? error.message : 'Review database operation failed.');
}

export function reviewRoutes(service: ReviewService) {
  const router = Router();
  const path = '/products/:productId/reviews';
  router.route(path).all((request, response, next) => {
    const productId = parseProductId(request.params.productId);
    if (productId === null) {
      response.status(400).json({ error: 'Product ID must be a valid integer.' });
    } else if (!productCatalog.has(productId)) {
      response.status(404).json({ error: 'Product not found.' });
    } else {
      next();
    }
  }).get(async (request, response) => {
    try {
      const reviews = await service.list(Number(request.params.productId));
      response.json({
        reviews,
        averageRating: reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0,
        reviewCount: reviews.length,
      });
    } catch (error) {
      reportFailure(error);
      response.status(503).json({ error: 'Reviews are temporarily unavailable. Please try again later.' });
    }
  }).post(async (request, response) => {
    const input = validateReview(request.body);
    if (!input) {
      response.status(400).json({ error: 'Enter a display name (1–50 characters), a whole rating from 1 to 5, and a comment (1–1,000 characters).' });
      return;
    }
    try {
      const review = await service.create(Number(request.params.productId), input);
      response.status(201).json(review);
    } catch (error) {
      reportFailure(error);
      response.status(503).json({ error: "We couldn't save your review. Please try again later." });
    }
  });
  return router;
}
