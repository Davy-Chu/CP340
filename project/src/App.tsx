import { useState } from 'react';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { products } from '@/data/products';
import { AboutPage } from '@/pages/AboutPage';
import { BlogPage } from '@/pages/BlogPage';
import { HomePage } from '@/pages/HomePage';
import { ProductPage } from '@/pages/ProductPage';
import { ShopPage } from '@/pages/ShopPage';
import type { CartItem, PageId, Product } from '@/types/catalog';

function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('home');
  const [selectedProduct, setSelectedProduct] = useState(products[0]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const navigateTo = (page: PageId) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const viewProduct = (product: Product) => {
    setSelectedProduct(product);
    navigateTo('product');
  };

  const addToCart = (product: Product, quantity: number) => {
    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.product.id === product.id);

      if (!existingItem) {
        return [...currentItems, { product, quantity }];
      }

      return currentItems.map((item) =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item,
      );
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: number) => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.product.id !== productId),
    );
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
          <ProductPage product={selectedProduct} onAddToCart={addToCart} />
        )}
        {currentPage === 'about' && <AboutPage onNavigate={navigateTo} />}
        {currentPage === 'blog' && <BlogPage />}
      </main>

      <Footer onNavigate={navigateTo} />

      {isCartOpen && (
        <CartDrawer
          items={cartItems}
          onClose={() => setIsCartOpen(false)}
          onRemove={removeFromCart}
        />
      )}
    </div>
  );
}

export default App;
