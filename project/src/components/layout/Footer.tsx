import type { PageId } from '@/types/catalog';
import { SocialLinks } from '@/components/common/SocialLinks';

interface FooterProps {
  onNavigate: (page: PageId) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="site-footer">
      <div className="footer-main">
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

        <div className="footer-contact">
          <h2 className="footer-heading">Get in touch</h2>
          <button type="button" onClick={() => onNavigate('contact')}>
            Contact Us
          </button>
        </div>

        <div>
          <h2 className="footer-heading">Follow WorkNest</h2>
          <SocialLinks />
        </div>
      </div>
      <p className="footer-note">
        © {new Date().getFullYear()} David Hu 169041791 huxx1791@mylaurier.ca
      </p>
    </footer>
  );
}
