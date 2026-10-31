import assert from 'node:assert/strict';
import { once } from 'node:events';
import { test } from 'node:test';
import express from 'express';
import Stripe from 'stripe';
import { configureApp } from './createApp.js';
import type { CheckoutService } from './createApp.js';
import { readConfig } from './config.js';
import { catalogProducts, CATALOG_CURRENCY, productCatalog } from '../shared/catalog/products.js';
import { validateCheckoutItems } from './checkoutValidation.js';

const session = (overrides: Partial<Stripe.Checkout.Session> = {}) => ({
  id: 'cs_test_example',
  mode: 'payment',
  livemode: false,
  metadata: { storefront: 'worknest' },
  payment_status: 'paid',
  amount_total: 4597,
  currency: 'cad',
  customer_details: { email: 'buyer@example.com' },
  url: 'https://checkout.stripe.com/c/pay/cs_test_example',
  ...overrides,
} as Stripe.Checkout.Session);

function service(overrides: Partial<CheckoutService> = {}): CheckoutService {
  return {
    create: async () => session(),
    retrieve: async () => session(),
    listLineItems: async () => ({ data: [
      { description: 'Lift Laptop Stand', quantity: 1, amount_total: 2399 },
      { description: 'CableDock Organizer', quantity: 2, amount_total: 2198 },
    ] as Stripe.LineItem[] }),
    ...overrides,
  };
}

async function withServer(checkout: CheckoutService, run: (base: string) => Promise<void>) {
  const app = express();
  configureApp(app, checkout, 'http://localhost:5173');
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  assert(address && typeof address !== 'string');
  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

test('validates product IDs and bounded integer quantities, including duplicate bypass attempts', () => {
  for (const body of [
    null, {}, { items: [] }, { items: 'bad' },
    { items: [{ productId: 999, quantity: 1 }] },
    { items: [{ productId: '1', quantity: 1 }] },
    { items: [{ productId: 1, quantity: '2' }] },
    ...[0, -1, 1.5, 100, Infinity, NaN].map((quantity) => ({ items: [{ productId: 1, quantity }] })),
    { items: [{ productId: 1, quantity: 99 }, { productId: 1, quantity: 99 }] },
  ]) assert.equal(validateCheckoutItems(body), null);
  assert.deepEqual(validateCheckoutItems({ items: [{ productId: 1, quantity: 99 }] }), [{ productId: 1, quantity: 99 }]);
  assert.deepEqual([...productCatalog.values()].map((product) => product.priceInCents), [2399, 1199, 5499, 6999, 1099, 1399]);
});

test('requires a sandbox secret and validates startup configuration', () => {
  assert.throws(() => readConfig({}), /STRIPE_SECRET_KEY is missing/);
  assert.throws(() => readConfig({ STRIPE_SECRET_KEY: 'sk_test_replace_me' }), /missing/);
  assert.throws(() => readConfig({ STRIPE_SECRET_KEY: 'sk_live_notallowed' }), /Live payments are disabled/);
  assert.throws(() => readConfig({ STRIPE_SECRET_KEY: 'sk_test_fixture', PORT: 'not-a-port' }), /PORT/);
  assert.throws(() => readConfig({ STRIPE_SECRET_KEY: 'sk_test_fixture', CLIENT_URL: 'javascript:bad' }), /CLIENT_URL/);
  assert.equal(readConfig({ STRIPE_SECRET_KEY: 'sk_test_fixture' }).clientUrl, 'http://localhost:5173');
});

test('creates a CAD session using server prices and returns only its URL', async () => {
  let params: Stripe.Checkout.SessionCreateParams | undefined;
  await withServer(service({ create: async (input) => { params = input; return session(); } }), async (base) => {
    const response = await fetch(`${base}/api/checkout/create-session`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [
        { productId: 1, quantity: 1, price: 1, name: 'tampered' },
        { productId: 5, quantity: 2 },
      ], total: 1 }),
    });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { url: session().url });
    assert.equal(params?.mode, 'payment');
    assert.equal(params?.success_url, 'http://localhost:5173/?checkout=success&session_id={CHECKOUT_SESSION_ID}');
    assert.equal(params?.cancel_url, 'http://localhost:5173/?checkout=cancelled');
    assert.deepEqual(params?.line_items?.map((item) => [item.price_data?.product_data?.name, item.price_data?.unit_amount, item.price_data?.currency, item.quantity]), [
      ['Lift Laptop Stand', 2399, 'cad', 1], ['CableDock Organizer', 1099, 'cad', 2],
    ]);
  });
});

test('returns HTTP 400 for invalid and malformed requests without calling Stripe', async () => {
  let calls = 0;
  await withServer(service({ create: async () => { calls++; return session(); } }), async (base) => {
    for (const body of ['{}', '{"items":[]}', '{"items":[{"productId":1,"quantity":100}]}', '{invalid']) {
      const response = await fetch(`${base}/api/checkout/create-session`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body,
      });
      assert.equal(response.status, 400);
      const data = await response.json() as { error: string };
      assert.equal(typeof data.error, 'string');
    }
    assert.equal(calls, 0);
  });
});

test('forged HTTP prices, currencies, names and Stripe line items cannot override any catalog product', async () => {
  let params: Stripe.Checkout.SessionCreateParams | undefined;
  await withServer(service({ create: async (input) => { params = input; return session(); } }), async (base) => {
    const response = await fetch(`${base}/api/checkout/create-session`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: catalogProducts.map(({ id }) => ({
          productId: id, quantity: 2, name: 'Forged product',
          price: 0.01, priceInCents: 1, unit_amount: 1, currency: 'usd',
          price_data: { unit_amount: 1, currency: 'usd' },
        })),
        subtotal: 1, total: 1, amount_total: 1, currency: 'usd',
        line_items: [{ price_data: { unit_amount: 1, currency: 'usd' }, quantity: 1 }],
      }),
    });
    assert.equal(response.status, 200);
    assert.deepEqual(params?.line_items, catalogProducts.map((product) => ({
      price_data: {
        currency: CATALOG_CURRENCY,
        product_data: { name: product.name },
        unit_amount: product.priceInCents,
      },
      quantity: 2,
    })));
    const total = params!.line_items!.reduce((sum, item) =>
      sum + item.price_data!.unit_amount! * item.quantity!, 0);
    assert.equal(total, 37188);
  });
});

test('HTTP requests cannot bypass catalog membership or quantity limits', async () => {
  let calls = 0;
  await withServer(service({ create: async () => { calls++; return session(); } }), async (base) => {
    const invalidItems = [
      [{ productId: 999, quantity: 1, price: 0.01 }],
      [{ productId: '1', quantity: 1 }],
      ...[0, -1, 1.5, 100, '1', { value: 1 }].map((quantity) => [{ productId: 1, quantity }]),
      [{ productId: 1, quantity: 99 }, { productId: 1, quantity: 99 }],
    ];
    for (const items of invalidItems) {
      const response = await fetch(`${base}/api/checkout/create-session`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      assert.equal(response.status, 400);
    }
    assert.equal(calls, 0);
  });
});

test('returns sanitized paid confirmation using Stripe line totals', async () => {
  await withServer(service(), async (base) => {
    const response = await fetch(`${base}/api/checkout/session/cs_test_example`);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await response.json(), {
      sessionId: 'cs_test_example', paymentStatus: 'paid', amountTotal: 4597, currency: 'cad',
      customerEmail: 'buyer@example.com', items: [
        { name: 'Lift Laptop Stand', quantity: 1, amountTotal: 2399 },
        { name: 'CableDock Organizer', quantity: 2, amountTotal: 2198 },
      ],
    });
  });
});

test('does not change unpaid sessions into successful payments', async () => {
  await withServer(service({ retrieve: async () => session({ payment_status: 'unpaid' }) }), async (base) => {
    const response = await fetch(`${base}/api/checkout/session/cs_test_example`);
    const data = await response.json() as { paymentStatus: string };
    assert.equal(data.paymentStatus, 'unpaid');
  });
});

test('rejects malformed/live IDs, unrelated sessions and missing sessions', async () => {
  await withServer(service(), async (base) => {
    for (const id of ['invalid', 'cs_live_example']) {
      assert.equal((await fetch(`${base}/api/checkout/session/${id}`)).status, 400);
    }
  });
  for (const changes of [{ livemode: true }, { metadata: {} }, { currency: 'usd' }]) {
    await withServer(service({ retrieve: async () => session(changes) }), async (base) => {
      assert.equal((await fetch(`${base}/api/checkout/session/cs_test_example`)).status, 404);
    });
  }
  await withServer(service({ retrieve: async () => {
    throw new Stripe.errors.StripeInvalidRequestError({ message: 'No such session', statusCode: 404 });
  } }), async (base) => {
    assert.equal((await fetch(`${base}/api/checkout/session/cs_test_missing`)).status, 404);
  });
});

test('handles Stripe outages with safe errors instead of leaking provider details', async (context) => {
  context.mock.method(console, 'error', () => {});
  const fail = async () => { throw new Error('Private provider details'); };
  await withServer(service({ create: fail, retrieve: fail }), async (base) => {
    const created = await fetch(`${base}/api/checkout/create-session`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ productId: 1, quantity: 1 }] }),
    });
    const verified = await fetch(`${base}/api/checkout/session/cs_test_example`);
    for (const response of [created, verified]) {
      assert.equal(response.status, 502);
      assert.doesNotMatch(await response.text(), /Private provider details/);
    }
  });
});
