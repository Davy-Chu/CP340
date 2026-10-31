import { expect, test } from '@playwright/test';
import { catalogProducts } from '../../shared/catalog/products.js';

const cart = [{ productId: 1, quantity: 1 }, { productId: 5, quantity: 2 }];
const paidSession = {
  sessionId: 'cs_test_browser', paymentStatus: 'paid', amountTotal: 4597,
  currency: 'cad', customerEmail: 'buyer@example.com',
  items: [
    { name: 'Lift Laptop Stand', quantity: 1, amountTotal: 2399 },
    { name: 'CableDock Organizer', quantity: 2, amountTotal: 2198 },
  ],
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript((items) => {
    if (localStorage.getItem('test-cart-seeded') === null) {
      localStorage.setItem('worknest-cart', JSON.stringify(items));
      localStorage.setItem('test-cart-seeded', 'yes');
    }
  }, cart);
});

test('shop shows every shared catalog product at its catalog price', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('button', { name: 'Shop', exact: true }).click();
  await expect(page.locator('.product-card')).toHaveCount(catalogProducts.length);
  for (const product of catalogProducts) {
    const card = page.locator('.product-card').filter({ hasText: product.name });
    await expect(card.locator('.product-card-info strong')).toHaveText(`$${(product.priceInCents / 100).toFixed(2)}`);
  }
});

test('cart persists across reload and cancellation, and cancellation parameters are cleaned', async ({ page }) => {
  await page.goto('/?checkout=cancelled&keep=this');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('status')).toHaveText('Checkout was cancelled. Your cart has been saved.');
  await expect(page).toHaveURL(/\?keep=this$/);
  await expect(page.getByText('$45.97 CAD', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'Open cart with 3 items' }).click();
  await expect(page.getByText('$45.97 CAD', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Increase CableDock Organizer quantity' }).click();
  await expect(page.getByText('$56.96 CAD', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Decrease Lift Laptop Stand quantity' }).click();
  await expect(page.locator('.cart-item')).toHaveCount(1);
});

test('checkout sends only IDs and quantities, redirects to Stripe, and keeps storage', async ({ page }) => {
  await page.route('https://checkout.stripe.com/**', (route) => route.fulfill({
    contentType: 'text/html', body: '<h1>Mock hosted sandbox checkout</h1>',
  }));
  let sent: unknown;
  await page.route('**/api/checkout/create-session', async (route) => {
    sent = route.request().postDataJSON();
    await route.fulfill({ json: { url: 'https://checkout.stripe.com/c/pay/cs_test_browser' } });
  });
  await page.goto('/?checkout=cancelled');
  await page.getByRole('button', { name: 'Checkout', exact: true }).click();
  await expect(page).toHaveURL('https://checkout.stripe.com/c/pay/cs_test_browser');
  expect(sent).toEqual({ items: cart });
  await page.goto('/?checkout=cancelled');
  await expect(page.getByText('$45.97 CAD', { exact: true })).toBeVisible();
});

test('checkout failure shows inline error and permits retry without losing items', async ({ page }) => {
  await page.route('**/api/checkout/create-session', (route) => route.fulfill({
    status: 502, json: { error: 'Unavailable' },
  }));
  await page.goto('/?checkout=cancelled');
  await page.getByRole('button', { name: 'Checkout', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText("We couldn't start checkout.");
  await expect(page.getByRole('button', { name: 'Checkout', exact: true })).toBeEnabled();
  await expect(page.getByText('$45.97 CAD', { exact: true })).toBeVisible();
});

test('success URL alone never clears cart; verified paid response clears it and displays Stripe totals', async ({ page }) => {
  let allowResponse!: () => void;
  const gate = new Promise<void>((resolve) => { allowResponse = resolve; });
  await page.route('**/api/checkout/session/cs_test_browser', async (route) => {
    await gate;
    await route.fulfill({ json: paidSession });
  });
  await page.goto('/?checkout=success&session_id=cs_test_browser');
  await expect(page.getByRole('heading', { name: 'Confirming your payment...' })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('worknest-cart')!))).toEqual(cart);
  await expect(page.getByRole('heading', { name: 'Order Confirmed' })).toHaveCount(0);
  allowResponse();
  await expect(page.getByRole('heading', { name: 'Order Confirmed' })).toBeVisible();
  await expect(page.getByText('$45.97 CAD', { exact: true })).toBeVisible();
  await expect(page.getByText('buyer@example.com', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('worknest-cart'))).toBeNull();
  await page.getByRole('button', { name: 'Continue Shopping', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Desk & Workspace Accessories', exact: true })).toBeVisible();
  await expect(page).not.toHaveURL(/checkout=/);
});

test('unpaid response never shows confirmed or deletes cart', async ({ page }) => {
  await page.route('**/api/checkout/session/cs_test_browser', (route) => route.fulfill({
    json: { ...paidSession, paymentStatus: 'unpaid' },
  }));
  await page.goto('/?checkout=success&session_id=cs_test_browser');
  await expect(page.getByRole('heading', { name: 'Payment incomplete' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Order Confirmed' })).toHaveCount(0);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('worknest-cart')!))).toEqual(cart);
  await page.getByRole('button', { name: 'Return to cart' }).click();
  await expect(page.getByText('$45.97 CAD', { exact: true })).toBeVisible();
});

for (const query of ['?checkout=success', '?checkout=success&session_id=invalid']) {
  test(`missing/invalid session is not confirmed: ${query}`, async ({ page }) => {
    await page.goto(`/${query}`);
    await expect(page.getByRole('alert')).toHaveText("We couldn't verify this order.");
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('worknest-cart')!))).toEqual(cart);
  });
}

test('verification failure preserves cart and supports successful retry', async ({ page }) => {
  let available = false;
  await page.route('**/api/checkout/session/cs_test_browser', (route) => route.fulfill(
    available ? { json: paidSession } : { status: 502, json: { error: 'Unavailable' } },
  ));
  await page.goto('/?checkout=success&session_id=cs_test_browser');
  await expect(page.getByRole('alert')).toContainText("We couldn't verify your payment right now.");
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('worknest-cart')!))).toEqual(cart);
  available = true;
  await page.getByRole('button', { name: 'Try verification again' }).click();
  await expect(page.getByRole('heading', { name: 'Order Confirmed' })).toBeVisible();
});

test('confirmation fits a narrow mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.route('**/api/checkout/session/cs_test_browser', (route) => route.fulfill({ json: paidSession }));
  await page.goto('/?checkout=success&session_id=cs_test_browser');
  await expect(page.getByRole('heading', { name: 'Order Confirmed' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
