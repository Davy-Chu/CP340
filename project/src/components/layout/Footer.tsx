import type { PageId } from '@/types/catalog';

interface FooterProps {
  onNavigate: (page: PageId) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <button
          className="footer-wordmark"
          type="button"
          onClick={() => onNavigate('home')}
          aria-label="Go to WorkNest home"
        >
          WorkNest
        </button>
        <p>Simple tools for a calmer, more productive workspace.</p>
      </div>
      <p className="footer-note">
        © {new Date().getFullYear()} WorkNest. Made for better workdays.
      </p>
    </footer>
  );
}
