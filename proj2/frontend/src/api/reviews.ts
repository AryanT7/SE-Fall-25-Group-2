
import { apiClient } from './client';
import {Review, ReviewSummary, CreateReviewInput} from './types';

// --------------------
// API Methods
// --------------------
export const reviewsApi = {
  /** GET /cafes/{cafe_id}/reviews */
  getReviews: (cafeId: number) =>
    apiClient.get<Review[]>(`/cafes/${cafeId}/reviews`),

  /** GET /cafes/{cafe_id}/reviews/summary */
  getReviewSummary: (cafeId: number, force = false) =>
    apiClient.get<ReviewSummary>(
      `/cafes/${cafeId}/reviews/summary${force ? '?force=true' : ''}`
    ),

  /** POST /cafes/{cafe_id}/reviews */
  createReview: (cafeId: number, data: CreateReviewInput) =>
    apiClient.post<Review>(`/cafes/${cafeId}/reviews`, data),
};

// Optional named exports for convenience
export const { getReviews, getReviewSummary, createReview } = reviewsApi;
