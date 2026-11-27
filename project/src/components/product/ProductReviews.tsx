import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { Star } from 'lucide-react';
import type { ProductReviewsResponse, Review } from '../../../shared/reviews';
import { fetchReviews, submitReview } from '@/utils/reviews';

const ratings = [1, 2, 3, 4, 5];
const dateFormat = new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="review-stars" role="img" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {ratings.map((value) => (
        <span className="review-star" key={value} aria-hidden="true">
          <Star size={20} />
          <span className="review-star-fill" style={{ width: `${Math.max(0, Math.min(1, rating - value + 1)) * 100}%` }}>
            <Star size={20} fill="currentColor" />
          </span>
        </span>
      ))}
    </span>
  );
}

// Key the state to the product even when a parent reuses this component instance.
export function ProductReviews({ productId }: { productId: number }) {
  return <ProductReviewContent key={productId} productId={productId} />;
}

function ProductReviewContent({ productId }: { productId: number }) {
  const id = useId();
  const [data, setData] = useState<ProductReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reload, setReload] = useState(0);
  const [reviewerName, setReviewerName] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState('');
  const [savedReview, setSavedReview] = useState<Review | null>(null);
  const loadController = useRef<AbortController | null>(null);
  const submissionController = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    loadController.current = controller;
    setLoading(true);
    setLoadError('');
    fetchReviews(productId, controller.signal).then((result) => {
      if (!controller.signal.aborted) setData(result);
    }).catch(() => {
      if (!controller.signal.aborted) setLoadError("We couldn't load reviews. Please try again.");
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [productId, reload]);

  useEffect(() => () => submissionController.current?.abort(), []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submissionController.current) return;
    const validation: Record<string, string> = {};
    if (!reviewerName.trim() || reviewerName.trim().length > 50) validation.name = 'Enter a display name of 1–50 characters.';
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) validation.rating = 'Choose a rating from 1 to 5 stars.';
    if (!comment.trim() || comment.trim().length > 1000) validation.comment = 'Write a review of 1–1,000 characters.';
    setErrors(validation);
    setSuccess('');
    setSubmitError('');
    if (Object.keys(validation).length) {
      const first = validation.name ? 'name' : validation.rating ? 'rating-1' : 'comment';
      document.getElementById(`${id}-${first}`)?.focus();
      return;
    }

    const controller = new AbortController();
    submissionController.current = controller;
    setSubmitting(true);
    try {
      const created = await submitReview(productId, { reviewerName: reviewerName.trim(), rating, comment: comment.trim() }, controller.signal);
      if (controller.signal.aborted) return;
      // Stop any older GET before applying the write, then refresh server totals.
      loadController.current?.abort();
      setSavedReview(created);
      setData((previous) => {
        if (!previous) return null;
        const reviews = [created, ...previous.reviews.filter((review) => review.id !== created.id)];
        return { reviews, reviewCount: reviews.length, averageRating: reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length };
      });
      setReviewerName('');
      setRating(0);
      setComment('');
      setSuccess('Thank you! Your review has been published.');
      setReload((value) => value + 1);
    } catch {
      if (!controller.signal.aborted) setSubmitError("We couldn't save your review. Your input has been kept so you can try again.");
    } finally {
      if (!controller.signal.aborted) {
        submissionController.current = null;
        setSubmitting(false);
      }
    }
  }

  const visibleReviews = data?.reviews ?? (savedReview ? [savedReview] : []);

  return (
    <section className="product-reviews" aria-labelledby={`${id}-heading`}>
      <header className="reviews-heading">
        <p className="eyebrow">From the WorkNest community</p>
        <h2 id={`${id}-heading`}>Customer reviews</h2>
        {data && data.reviewCount > 0 && (
          <div className="review-summary">
            <strong>{data.averageRating.toFixed(1)} / 5</strong>
            <RatingStars rating={data.averageRating} />
            <span>{data.reviewCount} {data.reviewCount === 1 ? 'review' : 'reviews'}</span>
          </div>
        )}
      </header>

      <div className="reviews-layout">
        <div className="reviews-feed" aria-busy={loading}>
          {loading && <p role="status">{data ? 'Refreshing reviews…' : 'Loading reviews…'}</p>}
          {loadError && (
            <div className="review-load-error">
              <p role="alert">{loadError}</p>
              <button className="text-button" type="button" disabled={loading} onClick={() => setReload((value) => value + 1)}>Retry loading reviews</button>
            </div>
          )}
          {data?.reviewCount === 0 && !loading && !loadError && <p>No reviews yet. Be the first to share your experience.</p>}
          {visibleReviews.length > 0 && (
            <ul className="review-list" aria-label="Product reviews">
              {visibleReviews.map((review) => (
                <li key={review.id}>
                  <article>
                    <div className="review-byline">
                      <h3>{review.reviewerName}</h3>
                      <time dateTime={review.createdAt}>{dateFormat.format(new Date(review.createdAt))}</time>
                    </div>
                    <RatingStars rating={review.rating} />
                    <p className="review-comment">{review.comment}</p>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </div>

        <form className="review-form" onSubmit={handleSubmit} noValidate aria-labelledby={`${id}-form-heading`}>
          <h3 id={`${id}-form-heading`}>Share your experience</h3>
          <p>Your name and review will be visible to everyone. All fields are required.</p>
          <label htmlFor={`${id}-name`}>Display name</label>
          <input id={`${id}-name`} value={reviewerName} onChange={(event) => setReviewerName(event.target.value)} maxLength={50} required disabled={submitting} autoComplete="nickname" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? `${id}-name-error` : undefined} />
          {errors.name && <p className="review-error" id={`${id}-name-error`}>{errors.name}</p>}

          <fieldset className="review-rating" disabled={submitting} aria-describedby={errors.rating ? `${id}-rating-error` : undefined} aria-invalid={Boolean(errors.rating)}>
            <legend>Your rating</legend>
            <div className="review-rating-options">
              {ratings.map((value) => (
                <label className={value <= rating ? 'selected' : ''} key={value}>
                  <input type="radio" id={`${id}-rating-${value}`} name={`${id}-rating`} value={value} checked={rating === value} onChange={() => setRating(value)} required aria-label={`${value} ${value === 1 ? 'star' : 'stars'}`} />
                  <Star size={28} aria-hidden="true" fill={value <= rating ? 'currentColor' : 'none'} />
                </label>
              ))}
              <span className="review-rating-value" aria-hidden="true">{rating ? `${rating} / 5` : 'Select'}</span>
            </div>
          </fieldset>
          {errors.rating && <p className="review-error" id={`${id}-rating-error`}>{errors.rating}</p>}

          <label htmlFor={`${id}-comment`}>Your review</label>
          <textarea id={`${id}-comment`} rows={5} value={comment} onChange={(event) => setComment(event.target.value)} maxLength={1000} required disabled={submitting} aria-invalid={Boolean(errors.comment)} aria-describedby={`${id}-comment-hint${errors.comment ? ` ${id}-comment-error` : ''}`} />
          <span className="review-character-count" id={`${id}-comment-hint`}>{comment.length} / 1,000 characters</span>
          {errors.comment && <p className="review-error" id={`${id}-comment-error`}>{errors.comment}</p>}
          <button className="primary-button" type="submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit Review'}</button>
          {submitError && <p className="review-error" role="alert">{submitError}</p>}
          {success && <p className="review-success" role="status">{success}</p>}
        </form>
      </div>
    </section>
  );
}
