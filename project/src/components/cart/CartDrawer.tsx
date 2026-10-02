import { useEffect } from 'react';
import { ArrowRight, ShoppingCart, X } from 'lucide-react';
import type { CartItem } from '@/types/catalog';

interface CartDrawerProps {
  items: CartItem[];
  onClose: () => void;
  onRemove: (productId: number) => void;
}

export function CartDrawer({ items, onClose, onRemove }: CartDrawerProps) {
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
                  <img src={product.image} alt="" />
                  <div>
                    <h3>{product.name}</h3>
                    <p>
                      {quantity} × ${product.price}
                    </p>
                    <button type="button" onClick={() => onRemove(product.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-total">
              <span>Subtotal</span>
              <strong>${subtotal}</strong>
            </div>
            <button className="primary-button checkout-button" type="button">
              Checkout <ArrowRight size={16} aria-hidden="true" />
            </button>
          </>
        )}
      </aside>
    </div>
  );
}
