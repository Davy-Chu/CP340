import assert from 'node:assert/strict';
import { once } from 'node:events';
import { test } from 'node:test';
import express from 'express';
import type Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { configureApp, type CheckoutService } from './createApp.js';
import { createReviewService, type ReviewService } from './reviewService.js';
import { getSupabaseClient, ReviewConfigurationError } from './supabase.js';
import type { Review, ReviewInput } from '../shared/reviews.js';

const input: ReviewInput = { reviewerName: 'Alex', rating: 5, comment: 'Great addition to my workspace.' };
const review: Review = { ...input, id: 'review-uuid', productId: 1, createdAt: '2026-11-26T12:00:00Z' };
const checkout: CheckoutService = {
  create: async () => ({ url: 'https://checkout.stripe.com/test', livemode: false } as Stripe.Checkout.Session),
  retrieve: async () => { throw new Error('Not used'); },
  listLineItems: async () => ({ data: [] }),
};

async function withServer(reviews: ReviewService | undefined, run: (base: string) => Promise<void>) {
  const server = configureApp(express(), checkout, 'http://localhost:5173', reviews).listen(0, '127.0.0.1');
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

const post = (base: string, productId: string, body: unknown) => fetch(`${base}/api/products/${productId}/reviews`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
});

test('review endpoints return product-specific reviews and exact aggregates, including empty products', async () => {
  const reviews = [review, { ...review, id: 'older', rating: 2, createdAt: '2026-11-25T12:00:00Z' }];
  await withServer({ list: async (id) => id === 1 ? reviews : [], create: async () => review }, async (base) => {
    const response = await fetch(`${base}/api/products/1/reviews`);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await response.json(), { reviews, averageRating: 3.5, reviewCount: 2 });
    assert.deepEqual(await (await fetch(`${base}/api/products/2/reviews`)).json(), { reviews: [], averageRating: 0, reviewCount: 0 });
  });
});

test('both methods reject malformed and unknown product IDs before accessing the database', async () => {
  let calls = 0;
  await withServer({ list: async () => { calls++; return []; }, create: async () => { calls++; return review; } }, async (base) => {
    for (const id of ['abc', '1.5', '1e0', '1abc', '%20', '9007199254740992']) {
      assert.equal((await fetch(`${base}/api/products/${id}/reviews`)).status, 400, id);
      assert.equal((await post(base, id, input)).status, 400, id);
    }
    for (const id of ['0', '-1', '999']) {
      assert.equal((await fetch(`${base}/api/products/${id}/reviews`)).status, 404, id);
      assert.equal((await post(base, id, input)).status, 404, id);
    }
    assert.equal(calls, 0);
  });
});

test('POST trims text, ignores forged product IDs and generated fields, and accepts boundary lengths', async () => {
  const received: { productId: number; input: ReviewInput }[] = [];
  await withServer({ list: async () => [], create: async (productId, value) => {
    received.push({ productId, input: value });
    return { ...review, ...value, productId };
  } }, async (base) => {
    const response = await post(base, '1', { ...input, reviewerName: '  Alex  ', comment: ' Great addition to my workspace. \n', productId: 2, product_id: 2, id: 'forged', created_at: 'forged' });
    assert.equal(response.status, 201);
    assert.deepEqual(await response.json(), review);
    assert.deepEqual(received[0], { productId: 1, input });
    const boundary = { reviewerName: 'a'.repeat(50), rating: 1, comment: 'b'.repeat(1000) };
    assert.equal((await post(base, '2', boundary)).status, 201);
    assert.deepEqual(received[1], { productId: 2, input: boundary });
  });
});

test('POST rejects missing, malformed, oversized and wrongly typed input without writing', async () => {
  let writes = 0;
  await withServer({ list: async () => [], create: async () => { writes++; return review; } }, async (base) => {
    const bodies = [
      null, [], {}, 'invalid',
      ...['', '   ', 'a'.repeat(51), 1, null, {}, []].map((reviewerName) => ({ ...input, reviewerName })),
      ...['', '\n\t', 'a'.repeat(1001), 1, null, {}, []].map((comment) => ({ ...input, comment })),
      ...[0, 6, -1, 1.5, '5', null, true, {}, []].map((rating) => ({ ...input, rating })),
    ];
    for (const body of bodies) assert.equal((await post(base, '1', body)).status, 400);
    for (const body of ['{invalid', JSON.stringify({ ...input, comment: 'a'.repeat(12000) })]) {
      const response = await fetch(`${base}/api/products/1/reviews`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
      assert.equal(response.status, 400);
      assert.equal(typeof (await response.json() as { error: string }).error, 'string');
    }
    assert.equal(writes, 0);
  });
});

test('database outages return generic 503 responses and do not leak provider details', async (context) => {
  const logged: unknown[][] = [];
  context.mock.method(console, 'error', (...args: unknown[]) => logged.push(args));
  const fail = async () => { throw new Error('private database URL and secret'); };
  await withServer({ list: fail, create: fail }, async (base) => {
    for (const response of [await fetch(`${base}/api/products/1/reviews`), await post(base, '1', input)]) {
      assert.equal(response.status, 503);
      assert.doesNotMatch(await response.text(), /private database/);
    }
  });
  assert.doesNotMatch(JSON.stringify(logged), /private database/);
});

test('missing Supabase configuration produces a safe server diagnostic while checkout remains available', async (context) => {
  const savedUrl = process.env.SUPABASE_URL;
  const savedKey = process.env.SUPABASE_SECRET_KEY;
  const logged: unknown[][] = [];
  context.mock.method(console, 'error', (...args: unknown[]) => logged.push(args));
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SECRET_KEY;
  try {
    assert.throws(getSupabaseClient, ReviewConfigurationError);
    await withServer(undefined, async (base) => {
      const response = await fetch(`${base}/api/products/1/reviews`);
      assert.equal(response.status, 503);
      assert.doesNotMatch(await response.text(), /SUPABASE/);
      assert.equal((await fetch(`${base}/api/checkout/create-session`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [{ productId: 1, quantity: 1 }] }),
      })).status, 200);
    });
    assert.match(JSON.stringify(logged), /SUPABASE_URL and SUPABASE_SECRET_KEY/);
  } finally {
    if (savedUrl === undefined) delete process.env.SUPABASE_URL; else process.env.SUPABASE_URL = savedUrl;
    if (savedKey === undefined) delete process.env.SUPABASE_SECRET_KEY; else process.env.SUPABASE_SECRET_KEY = savedKey;
  }
});

test('Supabase adapter reads all pages in descending order and writes only allowed database columns', async () => {
  const row = { id: review.id, product_id: 1, reviewer_name: input.reviewerName, rating: 5, comment: input.comment, created_at: review.createdAt };
  const requests: { url: URL; init: RequestInit | undefined }[] = [];
  const client = createClient('https://reviews.example.test', 'test-server-key', {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: async (url, init) => {
      const parsed = new URL(String(url));
      requests.push({ url: parsed, init });
      const writing = init?.method === 'POST';
      const secondPage = parsed.searchParams.get('offset') === '1';
      return new Response(JSON.stringify(writing ? row : [{ ...row, id: secondPage ? 'older' : row.id }]), {
        status: writing ? 201 : 200,
        headers: { 'Content-Type': 'application/json', 'Content-Range': secondPage ? '1-1/2' : '0-0/2' },
      });
    } },
  });
  const service = createReviewService(() => client);
  assert.deepEqual(await service.list(1), [review, { ...review, id: 'older' }]);
  for (const request of requests) {
    assert.equal(request.url.pathname, '/rest/v1/reviews');
    assert.equal(request.url.searchParams.get('product_id'), 'eq.1');
    assert.equal(request.url.searchParams.get('order'), 'created_at.desc,id.desc');
  }
  assert.deepEqual(await service.create(1, input), review);
  assert.deepEqual(JSON.parse(String(requests[2].init?.body)), { product_id: 1, reviewer_name: 'Alex', rating: 5, comment: input.comment });
});

test('Supabase adapter rejects provider read and write errors', async () => {
  const client = createClient('https://reviews.example.test', 'test-server-key', {
    auth: { persistSession: false },
    global: { fetch: async () => new Response(JSON.stringify({ message: 'Private provider details' }), { status: 401 }) },
  });
  const service = createReviewService(() => client);
  await assert.rejects(service.list(1), { message: 'Review database read failed.' });
  await assert.rejects(service.create(1, input), { message: 'Review database write failed.' });
});
