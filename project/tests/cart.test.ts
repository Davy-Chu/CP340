import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CART_STORAGE_KEY, persistCart, restoreCart } from '../src/utils/cartStorage.js';
import { isCheckoutSession } from '../src/utils/checkout.js';
import type { Product } from '../src/types/catalog.js';

const product: Product = {
  id: 1, name: 'Lift Laptop Stand', price: 23.99, category: 'Stands',
  image: '/stand.png', imageAlt: 'Laptop on a stand', description: 'A stand', features: [],
};
function storage(initial: string | null = null) {
  let value = initial;
  return {
    getItem: (_key: string) => value,
    setItem: (_key: string, next: string) => { value = next; },
    removeItem: (_key: string) => { value = null; },
  };
}

test('persists only IDs and quantities, restores actual catalog data and removes empty cart storage', () => {
  const store = storage();
  assert.equal(persistCart(store, [{ product, quantity: 2 }]), true);
  assert.deepEqual(JSON.parse(store.getItem(CART_STORAGE_KEY)!), [{ productId: 1, quantity: 2 }]);
  assert.deepEqual(restoreCart(store, [product]), [{ product, quantity: 2 }]);
  persistCart(store, []);
  assert.equal(store.getItem(CART_STORAGE_KEY), null);
});

test('discards corrupt storage, unknown products, invalid quantities and duplicates', () => {
  for (const data of ['broken', '{}', 'null']) assert.deepEqual(restoreCart(storage(data), [product]), []);
  const store = storage(JSON.stringify([
    { productId: 1, quantity: 2, price: 0.01 }, { productId: 1, quantity: 1 },
    { productId: 2, quantity: 1 }, { productId: 1, quantity: -1 },
    { productId: 1, quantity: 1.5 }, { productId: 1, quantity: 100 }, null,
  ]));
  assert.deepEqual(restoreCart(store, [product]), [{ product, quantity: 2 }]);
});

test('blocked browser storage fails safely', () => {
  const blocked = {
    getItem: () => { throw new Error('Blocked'); },
    setItem: () => { throw new Error('Blocked'); },
    removeItem: () => { throw new Error('Blocked'); },
  };
  assert.deepEqual(restoreCart(blocked, [product]), []);
  assert.equal(persistCart(blocked, [{ product, quantity: 1 }]), false);
});

test('rejects malformed confirmation responses, retaining unpaid status for valid responses', () => {
  const data = {
    sessionId: 'cs_test_example', paymentStatus: 'unpaid', amountTotal: 2399, currency: 'cad',
    customerEmail: null, items: [{ name: product.name, quantity: 1, amountTotal: 2399 }],
  };
  assert.equal(isCheckoutSession(data), true);
  for (const invalid of [null, {}, { ...data, currency: 'usd' }, { ...data, items: [] }, { ...data, amountTotal: '2399' }]) {
    assert.equal(isCheckoutSession(invalid), false);
  }
});
