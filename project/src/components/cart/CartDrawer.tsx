import { useEffect } from 'react';
import { ArrowRight, LoaderCircle, Minus, Plus, ShoppingCart, X } from 'lucide-react';
import type { CartItem, Product } from '@/types/catalog';
import { MAX_CART_QUANTITY } from '@/utils/cartStorage';

interface CartDrawerProps {
  items: CartItem[];
  onClose: () => void;
  onRemove: (productId: number) => void;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onViewProduct: (product: Product) => void;
  onCheckout: () => void;
  isCheckingOut: boolean;
  checkoutError: string | null;
  checkoutMessage: string | null;
}

export function CartDrawer({
  items,
  onClose,
  onRemove,
  onUpdateQuantity,
  onViewProduct,
  onCheckout,
  isCheckingOut,
  checkoutError,
  checkoutMessage,
}: CartDrawerProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const subtotal = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  );
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  return (
    <div className="cart-overlay" role="presentation" onClick={onClose}>
      <aside
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="cart-header">
          <div>
            <p className="eyebrow">Your workspace</p>
            <h2 id="cart-title">Your cart</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close cart">
            <X size={21} />
          </button>
        </div>

        {checkoutMessage && <p className="checkout-message" role="status">{checkoutMessage}</p>}

        {items.length === 0 ? (
          <div className="empty-cart">
            <ShoppingCart size={30} aria-hidden="true" />
            <p>Your cart is ready when you are.</p>
            <button className="text-button" type="button" onClick={onClose}>
              Continue shopping <ArrowRight size={15} aria-hidden="true" />
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map(({ product, quantity }) => (
                <div className="cart-item" key={product.id}>
                  <button
                    className="cart-item-image"
                    type="button"
                    onClick={() => onViewProduct(product)}
                    aria-label={`View ${product.name}`}
                  >
                    <img src={product.image} alt="" />
                  </button>

                  <div className="cart-item-details">
                    <button
                      className="cart-item-link"
                      type="button"
                      onClick={() => onViewProduct(product)}
                    >
                      <h3>{product.name}</h3>
                      <span>{product.category}</span>
                    </button>

                    <div className="cart-item-price">
                      <span>{formatPrice(product.price)} each</span>
                      <strong>{formatPrice(product.price * quantity)}</strong>
                    </div>

                    <div className="cart-item-actions">
                      <div
                        className="quantity-control cart-quantity-control"
                        aria-label={`Quantity for ${product.name}`}
                      >
                        <button
                          type="button"
                          disabled={isCheckingOut}
                          onClick={() =>
                            onUpdateQuantity(product.id, quantity - 1)
                          }
                          aria-label={`Decrease ${product.name} quantity`}
                        >
                          <Minus size={12} aria-hidden="true" />
                        </button>
                        <span aria-live="polite">{quantity}</span>
                        <button
                          type="button"
                          disabled={isCheckingOut || quantity >= MAX_CART_QUANTITY}
                          onClick={() =>
                            onUpdateQuantity(product.id, quantity + 1)
                          }
                          aria-label={`Increase ${product.name} quantity`}
                        >
                          <Plus size={12} aria-hidden="true" />
                        </button>
                      </div>
                      <button
                        className="cart-remove-button"
                        type="button"
                        disabled={isCheckingOut}
                        onClick={() => onRemove(product.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-total">
              <div>
                <span>Subtotal</span>
                <small>
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </small>
              </div>
              <strong>{formatPrice(subtotal)} CAD</strong>
            </div>
            <p className="checkout-sandbox-note">Stripe sandbox checkout. No real payments.</p>
            {checkoutError && <p className="checkout-error" role="alert">{checkoutError}</p>}
            <button
              className="primary-button checkout-button"
              type="button"
              onClick={onCheckout}
              disabled={isCheckingOut}
              aria-busy={isCheckingOut}
            >
              {isCheckingOut ? 'Redirecting...' : 'Checkout'}
              {isCheckingOut
                ? <LoaderCircle size={16} className="checkout-spinner" aria-hidden="true" />
                : <ArrowRight size={16} aria-hidden="true" />}
            </button>
          </>
        )}
      </aside>
    </div>
  );
}
