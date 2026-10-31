# WorkNest

React, TypeScript, and Vite storefront with a small TypeScript Express backend
and Stripe-hosted **sandbox checkout**. No database is required. Only `sk_test_`
keys are accepted; real payments are disabled.

## Local setup

Use Node.js 22 or newer and npm. From the repository root:

```powershell
cd project
npm install
Copy-Item .env.example .env
```

Edit `.env` locally and replace the placeholder with the secret key from your
Stripe sandbox:

```dotenv
STRIPE_SECRET_KEY=sk_test_replace_me
CLIENT_URL=http://localhost:5173
PORT=4242
```

Keep the real key in `.env`; it is ignored by Git. Never add a `VITE_` prefix to
this key. The browser does not need a Stripe key or Stripe.js because checkout
is hosted by Stripe. The backend exits with a clear configuration error when
the key is missing, still the placeholder, or a live key.

```powershell
npm run dev
```

This starts Vite at **http://localhost:5173** and Express at
**http://localhost:4242**. Open the Vite URL, not the Express URL. Vite forwards
relative `/api` requests to Express. If you change `PORT`, also change the proxy
target in `vite.config.ts`. If you change the frontend origin, update `CLIENT_URL`.

## Try a sandbox purchase

1. Open a product, choose a quantity, and add it to the cart.
2. Select **Checkout**. Stripe opens its hosted sandbox form.
3. Enter the test card `4242 4242 4242 4242`, any future expiration date, any
   three-digit CVC, and a test email. Do not use a real card.
4. Complete the payment. WorkNest verifies the session with the backend before
   showing **Order Confirmed** and clearing the cart.
5. Confirm the summary shows Stripe's purchased items, quantities, total in CAD,
   email (when provided), and readable order reference.

To test a decline, use `4000 0000 0000 0002`. To test cancellation, return using
Stripe's back/cancel control: WorkNest reopens the saved cart with an informational
message. Refreshing after cancellation should keep the items without reopening
the drawer. These card values are documented in
[Stripe's testing guide](https://docs.stripe.com/testing).

Also test `/?checkout=success` and
`/?checkout=success&session_id=cs_test_missing`: neither should show a confirmed
order or delete the cart. Stop the backend to check the inline checkout and
verification errors; restart it and retry verification instead of paying again.

## How checkout works

- The browser sends **only product IDs and quantities** to
  `POST /api/checkout/create-session`.
- Frontend product names and prices and backend checkout pricing come from
  `shared/catalog/products.ts`. This is the single source of truth: edit prices
  there in integer CAD cents, then rebuild/restart both applications.
- Express validates the cart, limits each product to 99 units, and looks up names
  and prices from its own server-side copy of the shared catalog. Browser prices,
  names, currencies, totals, and Stripe line-item overrides are ignored. Modifying
  a browser or HTTP request cannot change the server's catalog prices.
- Stripe receives inline `price_data`, so no manually configured Stripe Price
  IDs are needed. Adaptive currency conversion is disabled to keep payments in CAD.
- Stripe redirects to `/?checkout=success&session_id={CHECKOUT_SESSION_ID}` or
  `/?checkout=cancelled`. WorkNest retains its existing page-state navigation.
- `GET /api/checkout/session/:sessionId` retrieves the session and line items.
  Only WorkNest sandbox payment sessions in CAD are accepted; the response
  includes a small order summary rather than the raw Stripe object.
- A success URL is not proof of payment. Only a backend response with
  `paymentStatus === 'paid'` clears the cart and its local storage entry.
- Cart storage contains only `{ productId, quantity }` entries. Corrupt and
  invalid entries are discarded, and products are restored from the current
  frontend catalog. Card details are entered on Stripe, not on WorkNest.
- Order confirmation is a verified receipt view. This assignment has no database,
  webhook fulfillment, stock management, or shipping service. Taxes and shipping
  charges are not added; the checkout total is the product subtotal.

## Commands and verification

```powershell
npm run dev          # Start frontend and backend together
npm run dev:client   # Vite only
npm run dev:server   # Express with automatic restarts
npm run start:server # Express without file watching
npm run build        # Check all TypeScript projects and build the frontend
npm run preview      # Preview dist/ with the same API proxy; run the backend separately
npm run lint         # Browser, server, and test linting
npm test             # API validation, sandbox guards, safe errors, cart storage
npm run test:e2e     # Browser flow tests with mocked Stripe API responses
```

On Windows the browser tests use installed Microsoft Edge. On other systems,
install Chromium once with `npx playwright install chromium`. Browser tests
start Vite automatically and do not require a Stripe key. They cover request
payloads, redirect handling, cancellation, refresh persistence, loading, paid and
unpaid confirmations, invalid sessions, retryable errors, and mobile layout.
They do not replace completing a real Stripe sandbox checkout with your own key.

## Deployment notes

The frontend build goes in `dist/`; the Express API runs separately with
`npm run start:server`. A deployment must forward `/api` to Express under the same
site origin and set `CLIENT_URL` to that site's URL. Vite's development proxy is
not included in the static build. Keep the Stripe test key on the server only.

## Project structure

```text
shared/catalog/         Public product IDs, names, CAD prices in cents, quantity limit
server/                 Express endpoints, cart validation, configuration, tests
src/components/cart/    Cart drawer and checkout controls
src/pages/              Store pages and verified order confirmation
src/utils/              Cart persistence and confirmation response validation
src/styles/             Existing CSS organization
tests/                  Cart unit tests and browser checkout tests
.env.example            Placeholder backend configuration; copy to ignored .env
```
