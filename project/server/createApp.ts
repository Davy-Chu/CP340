import express from 'express';
import type { ErrorRequestHandler, Express } from 'express';
import Stripe from 'stripe';
import { CATALOG_CURRENCY, productCatalog } from '../shared/catalog/products.js';
import { validateCheckoutItems } from './checkoutValidation.js';

// Keep the Stripe boundary small so endpoint behavior can be tested without credentials.
export interface CheckoutService {
  create(params: Stripe.Checkout.SessionCreateParams): Promise<Stripe.Checkout.Session>;
  retrieve(sessionId: string): Promise<Stripe.Checkout.Session>;
  listLineItems(sessionId: string, params: { limit: number }): Promise<{ data: Stripe.LineItem[] }>;
}

export function configureApp(app: Express, checkout: CheckoutService, clientUrl: string) {
  app.disable('x-powered-by');
  app.use('/api', (_request, response, next) => {
    response.setHeader('Cache-Control', 'no-store');
    next();
  });
  app.use(express.json({ limit: '10kb' }));

  app.post('/api/checkout/create-session', async (request, response) => {
    const items = validateCheckoutItems(request.body);
    if (!items) {
      response.status(400).json({ error: 'Choose valid products with whole quantities between 1 and 99.' });
      return;
    }

    try {
      const session = await checkout.create({
        mode: 'payment',
        allowed_payment_method_types: ['card'],
        ui_mode: 'hosted_page',
        adaptive_pricing: { enabled: false },
        metadata: { storefront: 'worknest' },
        line_items: items.map(({ productId, quantity }) => {
          const product = productCatalog.get(productId)!;
          return {
            price_data: {
              currency: CATALOG_CURRENCY,
              product_data: { name: product.name },
              unit_amount: product.priceInCents,
            },
            quantity,
          };
        }),
        success_url: `${clientUrl}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${clientUrl}/?checkout=cancelled`,
      });
      if (session.livemode || !session.url) throw new Error('Expected a sandbox Checkout URL.');
      response.json({ url: session.url });
    } catch (error) {
      console.error('Stripe Checkout creation failed:', error);
      response.status(502).json({ error: "We couldn't start checkout. Please try again." });
    }
  });

  app.get('/api/checkout/session/:sessionId', async (request, response) => {
    const { sessionId } = request.params;
    if (!/^cs_test_[A-Za-z0-9]{1,200}$/.test(sessionId)) {
      response.status(400).json({ error: "We couldn't verify this order." });
      return;
    }

    try {
      const session = await checkout.retrieve(sessionId);
      if (
        session.livemode || session.mode !== 'payment' ||
        session.metadata?.storefront !== 'worknest' || session.currency !== CATALOG_CURRENCY
      ) {
        response.status(404).json({ error: "We couldn't verify this order." });
        return;
      }
      const lineItems = await checkout.listLineItems(sessionId, { limit: 100 });
      response.json({
        sessionId: session.id,
        paymentStatus: session.payment_status,
        amountTotal: session.amount_total,
        currency: session.currency,
        customerEmail: session.customer_details?.email ?? session.customer_email ?? null,
        items: lineItems.data.map((item) => ({
          name: item.description,
          quantity: item.quantity ?? 0,
          amountTotal: item.amount_total,
        })),
      });
    } catch (error) {
      if (error instanceof Stripe.errors.StripeInvalidRequestError && error.statusCode === 404) {
        response.status(404).json({ error: "We couldn't verify this order." });
        return;
      }
      console.error('Stripe Checkout verification failed:', error);
      response.status(502).json({ error: "We couldn't verify your payment right now. Please try again." });
    }
  });

  app.use('/api', (_request, response) => {
    response.status(404).json({ error: 'API endpoint not found.' });
  });

  const handleError: ErrorRequestHandler = (error, _request, response, _next) => {
    if (error instanceof SyntaxError || error.status === 413) {
      response.status(400).json({ error: 'Invalid checkout request.' });
      return;
    }
    console.error('Checkout server error:', error);
    response.status(500).json({ error: 'Something went wrong. Please try again.' });
  };
  app.use(handleError);
  return app;
}
