import { useCallback, useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { products } from '@/data/products';
import { AboutPage } from '@/pages/AboutPage';
import { BlogPage } from '@/pages/BlogPage';
import { HomePage } from '@/pages/HomePage';
import { ProductPage } from '@/pages/ProductPage';
import { ShopPage } from '@/pages/ShopPage';
import { OrderConfirmationPage } from '@/pages/OrderConfirmationPage';
import { CART_STORAGE_KEY, MAX_CART_QUANTITY, persistCart, restoreCart } from '@/utils/cartStorage';
import type { CartItem, PageId, Product } from '@/types/catalog';

function App() {
  const [checkoutReturn] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return { status: params.get('checkout'), sessionId: params.get('session_id') };
  });
  const [currentPage, setCurrentPage] = useState<PageId>(
    checkoutReturn.status === 'success' ? 'order-confirmation' : 'home',
  );
  const [selectedProduct, setSelectedProduct] = useState(products[0]);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try { return restoreCart(window.localStorage, products); } catch { return []; }
  });
  const [isCartOpen, setIsCartOpen] = useState(checkoutReturn.status === 'cancelled');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [cartNotice, setCartNotice] = useState(0);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(
    checkoutReturn.status === 'cancelled' ? 'Checkout was cancelled. Your cart has been saved.' : null,
  );

  useEffect(() => {
    try { persistCart(window.localStorage, cartItems); } catch { /* Storage may be blocked. */ }
  }, [cartItems]);

  useEffect(() => {
    if (cartNotice === 0) return;
    const timeout = window.setTimeout(() => setCartNotice(0), 3000);
    return () => window.clearTimeout(timeout);
  }, [cartNotice]);

  useEffect(() => {
    if (checkoutReturn.status === 'cancelled') {
      const url = new URL(window.location.href);
      url.searchParams.delete('checkout');
      url.searchParams.delete('session_id');
      window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    }
  }, [checkoutReturn.status]);

  const clearVerifiedCart = useCallback(() => {
    setCartItems([]);
    try { window.localStorage.removeItem(CART_STORAGE_KEY); } catch { /* Memory cart is cleared. */ }
  }, []);

  const navigateTo = (page: PageId) => {
    const url = new URL(window.location.href);
    url.searchParams.delete('checkout');
    url.searchParams.delete('session_id');
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const viewProduct = (product: Product) => {
    setSelectedProduct(product);
    navigateTo('product');
  };

  const addToCart = (product: Product, quantity: number) => {
    if (!Number.isInteger(quantity) || quantity < 1) return;
    setCheckoutError(null);
    setCheckoutMessage(null);
    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.product.id === product.id);

      if (!existingItem) {
        return [...currentItems, { product, quantity: Math.min(MAX_CART_QUANTITY, quantity) }];
      }

      return currentItems.map((item) =>
        item.product.id === product.id
          ? { ...item, quantity: Math.min(MAX_CART_QUANTITY, item.quantity + quantity) }
          : item,
      );
    });
    setCartNotice((notice) => notice + 1);
  };

  const removeFromCart = (productId: number) => {
    setCheckoutError(null);
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.product.id !== productId),
    );
  };

  const updateCartQuantity = (productId: number, quantity: number) => {
    if (!Number.isInteger(quantity) || quantity > MAX_CART_QUANTITY) return;
    setCheckoutError(null);
    setCartItems((currentItems) => {
      if (quantity <= 0) {
        return currentItems.filter((item) => item.product.id !== productId);
      }

      return currentItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item,
      );
    });
  };

  const viewCartProduct = (product: Product) => {
    setIsCartOpen(false);
    viewProduct(product);
  };

  const startCheckout = async () => {
    if (isCheckingOut || cartItems.length === 0) return;
    setIsCheckingOut(true);
    setCheckoutError(null);
    setCheckoutMessage(null);
    try {
      if (!persistCart(window.localStorage, cartItems)) {
        throw new Error('Cart storage unavailable.');
      }
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map(({ product, quantity }) => ({ productId: product.id, quantity })),
        }),
        signal: AbortSignal.timeout(30000),
      });
      if (!response.ok) throw new Error('Checkout unavailable.');
      const data: unknown = await response.json();
      if (!data || typeof data !== 'object' || !('url' in data) || typeof data.url !== 'string') {
        throw new Error('Invalid checkout response.');
      }
      const url = new URL(data.url);
      if (url.protocol !== 'https:' || url.hostname !== 'checkout.stripe.com' || url.username || url.password) {
        throw new Error('Invalid checkout destination.');
      }
      window.location.assign(url.toString());
    } catch {
      setCheckoutError("We couldn't start checkout. Please try again. Your cart has been kept.");
      setIsCheckingOut(false);
    }
  };

  const cartItemCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return (
    <div className="app">
      <Header
        currentPage={currentPage}
        cartItemCount={cartItemCount}
        onNavigate={navigateTo}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <main>
        {currentPage === 'home' && (
          <HomePage onNavigate={navigateTo} onViewProduct={viewProduct} />
        )}
        {currentPage === 'shop' && <ShopPage onViewProduct={viewProduct} />}
        {currentPage === 'product' && (
          <ProductPage
            key={selectedProduct.id}
            product={selectedProduct}
            onAddToCart={addToCart}
            onBackToShop={() => navigateTo('shop')}
          />
        )}
        {currentPage === 'about' && <AboutPage />}
        {currentPage === 'blog' && <BlogPage />}
        {currentPage === 'order-confirmation' && (
          <OrderConfirmationPage
            sessionId={checkoutReturn.sessionId}
            onPaymentVerified={clearVerifiedCart}
            onContinueShopping={() => navigateTo('shop')}
            onOpenCart={() => setIsCartOpen(true)}
          />
        )}
      </main>

      <Footer onNavigate={navigateTo} />

      {cartNotice > 0 && (
        <div className="cart-added-notice" key={cartNotice} role="status" aria-live="polite" aria-atomic="true">
          <CheckCircle size={20} aria-hidden="true" />
          <span>Item added successfully</span>
        </div>
      )}

      {isCartOpen && (
        <CartDrawer
          items={cartItems}
          onClose={() => setIsCartOpen(false)}
          onRemove={removeFromCart}
          onUpdateQuantity={updateCartQuantity}
          onViewProduct={viewCartProduct}
          onCheckout={startCheckout}
          isCheckingOut={isCheckingOut}
          checkoutError={checkoutError}
          checkoutMessage={checkoutMessage}
        />
      )}
    </div>
  );
}

export default App;
