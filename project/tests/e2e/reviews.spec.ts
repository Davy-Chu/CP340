import { expect, test, type Page } from '@playwright/test';
import type { Review } from '../../shared/reviews.js';

const empty = { reviews: [], averageRating: 0, reviewCount: 0 };
const review: Review = {
  id: 'review-1', productId: 1, reviewerName: 'Alex', rating: 5,
  comment: 'Great addition to my workspace.', createdAt: '2026-11-26T12:00:00Z',
};

async function openProduct(page: Page, name = 'Lift Laptop Stand') {
  await page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('button', { name: 'Shop', exact: true }).click();
  await page.locator('.product-card').filter({ hasText: name }).click();
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
}

async function fillReview(page: Page) {
  await page.getByLabel('Display name', { exact: true }).fill('  Alex  ');
  await page.getByRole('radio', { name: '5 stars', exact: true }).check();
  await page.getByLabel('Your review', { exact: true }).fill(' Great addition to my workspace. ');
}

test('loading, empty state, validation, keyboard rating, submission and reload', async ({ page }) => {
  let releaseLoad!: () => void;
  const loadGate = new Promise<void>((resolve) => { releaseLoad = resolve; });
  let releasePost!: () => void;
  const postGate = new Promise<void>((resolve) => { releasePost = resolve; });
  let saved: Review | undefined;
  let posts = 0;
  await page.route('**/api/products/1/reviews', async (route) => {
    if (route.request().method() === 'POST') {
      posts++;
      expect(route.request().postDataJSON()).toEqual({ reviewerName: 'Alex', rating: 5, comment: review.comment });
      await postGate;
      saved = review;
      await route.fulfill({ status: 201, json: saved });
    } else {
      await loadGate;
      await route.fulfill({ json: saved ? { reviews: [saved], averageRating: 5, reviewCount: 1 } : empty });
    }
  });
  await page.goto('/');
  await openProduct(page);
  await expect(page.getByText('Loading reviews…')).toBeVisible();
  releaseLoad();
  await expect(page.getByText('No reviews yet. Be the first to share your experience.')).toBeVisible();
  await expect(page.locator('.review-summary')).toHaveCount(0);

  await page.getByRole('button', { name: 'Submit Review', exact: true }).click();
  await expect(page.getByText('Enter a display name of 1–50 characters.')).toBeVisible();
  await expect(page.getByText('Choose a rating from 1 to 5 stars.')).toBeVisible();
  await expect(page.getByText('Write a review of 1–1,000 characters.')).toBeVisible();
  await page.getByLabel('Display name', { exact: true }).fill('  Alex  ');
  const firstStar = page.getByRole('radio', { name: '1 star', exact: true });
  await firstStar.focus();
  await page.keyboard.press('Space');
  for (let step = 0; step < 4; step++) await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('radio', { name: '5 stars', exact: true })).toBeChecked();
  await page.getByLabel('Your review', { exact: true }).fill(` ${review.comment} `);
  await page.getByRole('button', { name: 'Submit Review', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Submitting…' })).toBeDisabled();
  await expect(page.getByLabel('Display name', { exact: true })).toBeDisabled();
  releasePost();
  await expect(page.getByText('Thank you! Your review has been published.')).toBeVisible();
  await expect(page.locator('.review-list')).toContainText(review.comment);
  await expect(page.locator('.review-summary')).toHaveText('5.0 / 51 review');
  await expect(page.getByLabel('Display name', { exact: true })).toHaveValue('');
  await expect(page.getByLabel('Your review', { exact: true })).toHaveValue('');
  await expect(page.locator('.review-rating input:checked')).toHaveCount(0);
  expect(posts).toBe(1);
  await page.reload();
  await openProduct(page);
  await expect(page.locator('.review-list')).toContainText(review.comment);
});

test('shows newest reviews, fractional aggregate, date and plain user text', async ({ page }) => {
  const comment = '<img src=x onerror=alert(1)> A useful stand.\nWould recommend.';
  await page.route('**/api/products/1/reviews', (route) => route.fulfill({ json: {
    reviews: [{ ...review, comment }, { ...review, id: 'older', reviewerName: 'Sam', rating: 4, createdAt: '2026-11-25T12:00:00Z' }],
    averageRating: 4.5, reviewCount: 2,
  } }));
  await page.goto('/');
  await openProduct(page);
  await expect(page.locator('.review-summary')).toContainText('4.5 / 5');
  await expect(page.locator('.review-summary')).toContainText('2 reviews');
  await expect(page.getByRole('img', { name: '4.5 out of 5 stars' })).toBeVisible();
  await expect(page.locator('.review-list li').first()).toContainText('Alex');
  await expect(page.locator('.review-list li').first()).toContainText(comment);
  await expect(page.locator('.review-list img')).toHaveCount(0);
  await expect(page.locator('.review-list time').first()).toContainText('2026');
});

test('load failure can be retried and does not block adding products to the cart', async ({ page }) => {
  let fail = true;
  await page.route('**/api/products/1/reviews', (route) => fail ? route.abort() : route.fulfill({ json: empty }));
  await page.goto('/');
  await openProduct(page);
  await expect(page.getByRole('alert')).toContainText("We couldn't load reviews.");
  await page.getByRole('button', { name: 'Add to Cart', exact: true }).click();
  await page.getByRole('button', { name: 'Open cart with 1 item', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Close cart' }).click();
  fail = false;
  await page.getByRole('button', { name: 'Retry loading reviews' }).click();
  await expect(page.getByText('No reviews yet. Be the first to share your experience.')).toBeVisible();
});

test('failed submission preserves input for retry; a failed refresh does not report the saved review as failed', async ({ page }) => {
  let failPost = true;
  let saved = false;
  await page.route('**/api/products/1/reviews', (route) => {
    if (route.request().method() === 'POST') {
      if (failPost) return route.fulfill({ status: 503, json: { error: 'Unavailable' } });
      saved = true;
      return route.fulfill({ status: 201, json: review });
    }
    return saved ? route.fulfill({ status: 503, json: { error: 'Unavailable' } }) : route.fulfill({ json: empty });
  });
  await page.goto('/');
  await openProduct(page);
  await fillReview(page);
  await page.getByRole('button', { name: 'Submit Review', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Your input has been kept');
  await expect(page.getByLabel('Display name', { exact: true })).toHaveValue('  Alex  ');
  await expect(page.getByRole('radio', { name: '5 stars', exact: true })).toBeChecked();
  await expect(page.getByLabel('Your review', { exact: true })).toHaveValue(` ${review.comment} `);
  failPost = false;
  await page.getByRole('button', { name: 'Submit Review', exact: true }).click();
  await expect(page.getByText('Thank you! Your review has been published.')).toBeVisible();
  await expect(page.getByRole('alert')).toContainText("We couldn't load reviews.");
  await expect(page.locator('.review-list')).toContainText(review.comment);
  await expect(page.getByLabel('Your review', { exact: true })).toHaveValue('');
});

test('switching products clears reviews and ignores the previous product response', async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  await page.route('**/api/products/1/reviews', async (route) => {
    await gate;
    await route.fulfill({ json: { reviews: [review], averageRating: 5, reviewCount: 1 } });
  });
  await page.route('**/api/products/2/reviews', (route) => route.fulfill({ json: empty }));
  await page.goto('/');
  await openProduct(page);
  await expect(page.getByText('Loading reviews…')).toBeVisible();
  await page.getByLabel('Display name', { exact: true }).fill('Old draft');
  await page.getByRole('button', { name: 'Back to shop' }).click();
  await page.locator('.product-card').filter({ hasText: 'Nest Desk Organizer' }).click();
  await expect(page.getByText('No reviews yet. Be the first to share your experience.')).toBeVisible();
  release();
  await expect(page.getByLabel('Display name', { exact: true })).toHaveValue('');
  await expect(page.locator('.review-list')).toHaveCount(0);
  await expect(page.getByText(review.comment)).toHaveCount(0);
});

test('reviews span the product grid and fit a narrow mobile viewport', async ({ page }) => {
  await page.route('**/api/products/*/reviews', (route) => route.fulfill({ json: { reviews: [review], averageRating: 5, reviewCount: 1 } }));
  await page.goto('/');
  await openProduct(page);
  await expect(page.locator('.product-reviews')).toHaveCSS('grid-column', '1 / -1');
  await page.setViewportSize({ width: 320, height: 800 });
  await expect(page.getByRole('heading', { name: 'Customer reviews' })).toBeVisible();
  await fillReview(page);
  const dimensions = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, viewport: window.innerWidth }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.viewport);
});
