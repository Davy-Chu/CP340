import { Mail } from 'lucide-react';
import { SocialLinks } from '@/components/common/SocialLinks';
import { useSeo } from '@/utils/seo';

export function ContactPage() {
  useSeo({
    title: 'Contact WorkNest | Customer Support & Social Media',
    description: 'Contact WorkNest by email or connect with us on Instagram and TikTok for workspace inspiration, product updates, and support.',
  });

  return (
    <section className="contact-page page-width" aria-labelledby="contact-title">
      <header className="contact-heading">
        <p className="eyebrow">Here to help</p>
        <h1 id="contact-title">Contact WorkNest</h1>
        <p>
          Have a question about WorkNest, our products, or your order?
          We&rsquo;d be happy to hear from you.
        </p>
      </header>

      <div className="contact-grid">
        <section className="contact-card" aria-labelledby="contact-email-title">
          <Mail size={28} className="contact-icon" aria-hidden="true" />
          <h2 id="contact-email-title">Email us</h2>
          <p>
            For product questions, order support, or a suggestion, get in touch
            by email.
          </p>
          <a className="contact-email" href="mailto:huxx1791@mylaurier.ca">
            huxx1791@mylaurier.ca
          </a>
        </section>

        <section className="contact-card" aria-labelledby="contact-social-title">
          <h2 id="contact-social-title">Follow WorkNest</h2>
          <p>
            Follow WorkNest for workspace inspiration, product updates, and
            simple desk organization ideas.
          </p>
          <SocialLinks />
        </section>
      </div>
    </section>
  );
}
