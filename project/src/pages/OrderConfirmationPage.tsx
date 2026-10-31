import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle, LoaderCircle } from 'lucide-react';
import type { CheckoutSession } from '@/types/checkout';
import { isCheckoutSession, isTestSessionId } from '@/utils/checkout';
import { useSeo } from '@/utils/seo';

interface OrderConfirmationPageProps {
  sessionId: string | null;
  onPaymentVerified: () => void;
  onContinueShopping: () => void;
  onOpenCart: () => void;
}

type ConfirmationState =
  | { status: 'loading' }
  | { status: 'error'; message: string; retryable: boolean }
  | { status: 'incomplete' }
  | { status: 'paid'; session: CheckoutSession };

const formatAmount = (amount: number) =>
  new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(amount / 100);

export function OrderConfirmationPage({
  sessionId,
  onPaymentVerified,
  onContinueShopping,
  onOpenCart,
}: OrderConfirmationPageProps) {
  useSeo({
    title: 'Order Confirmation | WorkNest',
    description: 'Verify your WorkNest sandbox payment and view your order details.',
    noindex: true,
  });

  const [state, setState] = useState<ConfirmationState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!isTestSessionId(sessionId)) {
      setState({ status: 'error', message: "We couldn't verify this order.", retryable: false });
      return;
    }
    let active = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 30000);
    setState({ status: 'loading' });

    async function verify() {
      try {
        const response = await fetch(`/api/checkout/session/${encodeURIComponent(sessionId!)}`, {
          signal: controller.signal,
          cache: 'no-store',
        });
        if (!active) return;
        if (response.status === 400 || response.status === 404) {
          setState({ status: 'error', message: "We couldn't verify this order.", retryable: false });
          return;
        }
        if (!response.ok) throw new Error('Verification unavailable.');
        const session: unknown = await response.json();
        if (!active) return;
        if (!isCheckoutSession(session) || session.sessionId !== sessionId) {
          throw new Error('Invalid verification response.');
        }
        if (session.paymentStatus !== 'paid') {
          setState({ status: 'incomplete' });
          return;
        }
        onPaymentVerified();
        setState({ status: 'paid', session });
      } catch {
        if (active) setState({
          status: 'error',
          message: "We couldn't verify your payment right now. Please try again.",
          retryable: true,
        });
      } finally {
        window.clearTimeout(timeout);
      }
    }
    void verify();
    return () => {
      active = false;
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [sessionId, onPaymentVerified, attempt]);

  if (state.status === 'loading') {
    return (
      <section className="order-page page-width order-state" aria-live="polite" aria-busy="true">
        <LoaderCircle size={32} className="checkout-spinner" aria-hidden="true" />
        <h1>Confirming your payment...</h1>
        <p>Please wait while we verify your payment with Stripe.</p>
      </section>
    );
  }

  if (state.status !== 'paid') {
    return (
      <section className="order-page page-width order-state" aria-live="polite">
        <p className="eyebrow">Your checkout</p>
        <h1>{state.status === 'incomplete' ? 'Payment incomplete' : 'Unable to verify order'}</h1>
        <p role={state.status === 'error' ? 'alert' : undefined}>
          {state.status === 'incomplete'
            ? 'We could not confirm that this payment was completed.'
            : state.message}
        </p>
        <p>Your cart has been kept intact.</p>
        <div className="order-actions">
          {state.status === 'error' && state.retryable && (
            <button className="primary-button" type="button" onClick={() => setAttempt((value) => value + 1)}>
              Try verification again
            </button>
          )}
          <button className="text-button" type="button" onClick={onOpenCart}>Return to cart</button>
          <button className="text-button" type="button" onClick={onContinueShopping}>Continue shopping</button>
        </div>
      </section>
    );
  }

  const { session } = state;
  return (
    <section className="order-page page-width" aria-labelledby="order-title">
      <div className="order-confirmation">
        <header className="order-heading">
          <CheckCircle size={38} aria-hidden="true" />
          <p className="eyebrow">Your workspace awaits</p>
          <h1 id="order-title">Order Confirmed</h1>
          <p>Thank you for your order. Your payment was successfully processed.</p>
          <p className="order-sandbox-note">Sandbox order — no real payment was taken.</p>
        </header>

        <div className="order-summary">
          <h2>Your order</h2>
          <ul>
            {session.items.map((item, index) => (
              <li key={`${item.name}-${index}`}>
                <span>{item.name}<small>Quantity: {item.quantity}</small></span>
                <strong>{formatAmount(item.amountTotal)}</strong>
              </li>
            ))}
          </ul>
          <div className="order-total">
            <span>Total paid</span>
            <strong>{formatAmount(session.amountTotal!)} CAD</strong>
          </div>
          <dl className="order-details">
            <div><dt>Order reference</dt><dd title={session.sessionId}>…{session.sessionId.slice(-16)}</dd></div>
            {session.customerEmail && <div><dt>Customer email</dt><dd>{session.customerEmail}</dd></div>}
          </dl>
        </div>

        <button className="primary-button" type="button" onClick={onContinueShopping}>
          Continue Shopping <ArrowRight size={16} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
