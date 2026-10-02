import { useState } from 'react';
import { Menu, ShoppingCart, X } from 'lucide-react';
import type { PageId } from '@/types/catalog';

interface HeaderProps {
  currentPage: PageId;
  cartItemCount: number;
  onNavigate: (page: PageId) => void;
  onOpenCart: () => void;
}

const navigationItems: Array<{ label: string; page: PageId }> = [
  { label: 'Home', page: 'home' },
  { label: 'Shop', page: 'shop' },
  { label: 'Blog', page: 'blog' },
  { label: 'About', page: 'about' },
];

export function Header({
  currentPage,
  cartItemCount,
  onNavigate,
  onOpenCart,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigation = (page: PageId) => {
    onNavigate(page);
    setIsMenuOpen(false);
  };

  const isCurrentPage = (page: PageId) =>
    currentPage === page || (page === 'shop' && currentPage === 'product');

  return (
    <header className="site-header">
      <div className="header-inner">
        <button
          className="wordmark"
          type="button"
          onClick={() => handleNavigation('home')}
          aria-label="Go to WorkNest home"
        >
          WorkNest
        </button>

        <nav
          className={`main-nav ${isMenuOpen ? 'is-open' : ''}`}
          aria-label="Primary navigation"
        >
          {navigationItems.map(({ label, page }) => (
            <button
              key={page}
              className={isCurrentPage(page) ? 'active' : ''}
              type="button"
              onClick={() => handleNavigation(page)}
              aria-current={isCurrentPage(page) ? 'page' : undefined}
            >
              {label}
            </button>
          ))}
        </nav>

        <button
          className="cart-button"
          type="button"
          onClick={onOpenCart}
          aria-label={`Open cart with ${cartItemCount} ${cartItemCount === 1 ? 'item' : 'items'}`}
        >
          <ShoppingCart size={21} strokeWidth={1.7} aria-hidden="true" />
          {cartItemCount > 0 && <span className="cart-count">{cartItemCount}</span>}
        </button>

        <button
          className="menu-button"
          type="button"
          onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>
  );
}
