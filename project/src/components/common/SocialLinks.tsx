import { ArrowUpRight } from 'lucide-react';
import { socialLinks } from '@/data/socialLinks';
import instagramLogo from '@/assets/social/instagram.svg';
import tiktokLogo from '@/assets/social/tiktok.svg';

export function SocialLinks() {
  return (
    <div className="social-links">
      {[
        { name: 'Instagram', url: socialLinks.instagram, logo: instagramLogo },
        { name: 'TikTok', url: socialLinks.tiktok, logo: tiktokLogo },
      ].map(({ name, url, logo }) => (
        <a
          key={name}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${name} (opens in a new tab)`}
        >
          <img className="social-brand-logo" src={logo} alt="" aria-hidden="true" width={18} height={18} />
          {name} <ArrowUpRight size={15} aria-hidden="true" />
        </a>
      ))}
    </div>
  );
}
