export interface Review {
  id: string;
  productId: number;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ReviewInput {
  reviewerName: string;
  rating: number;
  comment: string;
}

export interface ProductReviewsResponse {
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
}
