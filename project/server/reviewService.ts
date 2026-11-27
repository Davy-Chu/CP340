import type { Review, ReviewInput } from '../shared/reviews.js';
import { getSupabaseClient } from './supabase.js';

export interface ReviewService {
  list(productId: number): Promise<Review[]>;
  create(productId: number, input: ReviewInput): Promise<Review>;
}

interface ReviewRow {
  id: string;
  product_id: number;
  reviewer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

const columns = 'id, product_id, reviewer_name, rating, comment, created_at';
const toReview = (row: ReviewRow): Review => ({
  id: row.id,
  productId: row.product_id,
  reviewerName: row.reviewer_name,
  rating: row.rating,
  comment: row.comment,
  createdAt: row.created_at,
});

export function createReviewService(getClient = getSupabaseClient): ReviewService {
  return {
    async list(productId) {
      const client = getClient();
      const reviews: Review[] = [];
      const signal = AbortSignal.timeout(15000);
      // Page through the results so Supabase's row limit cannot truncate totals.
      const pageSize = 500;
      let offset = 0;
      while (true) {
        const { data, error, count } = await client.from('reviews')
          .select(columns, { count: 'exact' }).eq('product_id', productId)
          .order('created_at', { ascending: false }).order('id', { ascending: false })
          .range(offset, offset + pageSize - 1).abortSignal(signal);
        if (error || !data) throw new Error('Review database read failed.');
        reviews.push(...data.map((row) => toReview(row as ReviewRow)));
        offset += data.length;
        if (data.length === 0 || (count !== null ? offset >= count : data.length < pageSize)) break;
      }
      return reviews;
    },
    async create(productId, input) {
      const { data, error } = await getClient().from('reviews').insert({
        product_id: productId,
        reviewer_name: input.reviewerName,
        rating: input.rating,
        comment: input.comment,
      }).select(columns).abortSignal(AbortSignal.timeout(15000)).single();
      if (error || !data) throw new Error('Review database write failed.');
      return toReview(data as ReviewRow);
    },
  };
}
