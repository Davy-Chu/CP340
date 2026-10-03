import type { ReactNode } from 'react';
import { ArrowRight, Leaf, Sparkles } from 'lucide-react';
import { ProductCard } from '@/components/catalog/ProductCard';
import { images, products } from '@/data/products';
import type { PageId, Product } from '@/types/catalog';

interface HomePageProps {
  onNavigate: (page: PageId) => void;
  onViewProduct: (product: Product) => void;
}

export function HomePage({ onNavigate, onViewProduct }: HomePageProps) {
  return (
    <>
      <section className="hero-section page-width">
        <div className="hero-copy">
          <p className="eyebrow">Thoughtful tools for everyday focus</p>
          <h1>
            Build a Better
            <br />
            Workspace
          </h1>
          <p className="hero-description">
            Simple tools for a calmer,
            <br className="desktop-break" /> more productive you.
          </p>
          <button
            className="primary-button"
            type="button"
            onClick={() => onNavigate('shop')}
          >
            Shop Now <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="hero-image-wrap">
          <img
            src={images.laptop_stand}
            alt="Minimal desk with a laptop, plants, and warm light"
          />
          <div className="hero-note" aria-hidden="true">
            Good work
            <br />
            <em>brighter</em>
            <br />
            days
          </div>
        </div>
      </section>

      <section className="pillars-section page-width" aria-label="Our values">
        <Pillar
          icon={<Sparkles size={23} />}
          title="Organized"
          text="Clutter-free spaces."
        />
        <Pillar
          icon={<Leaf size={23} />}
          title="Comfortable"
          text="Work feels better."
        />
        <Pillar
          icon={<ArrowRight size={23} />}
          title="Focused"
          text="More done, less stress."
        />
      </section>

      <section className="story-section page-width">
        <div className="story-image">
          <img
            src={images.desk_organizer}
            alt="Bright, organized workspace"
          />
        </div>
        <div className="story-copy">
          <p className="eyebrow">The WorkNest approach</p>
          <h2>Your desk should help you focus — not distract you.</h2>
          <p>
            A better workday starts with the space around you. We bring together
            simple, affordable essentials designed to improve how your workspace
            looks, feels, and functions.
          </p>
          <button
            className="text-button"
            type="button"
            onClick={() => onNavigate('about')}
          >
            Our story <ArrowRight size={15} aria-hidden="true" />
          </button>
        </div>
      </section>

      <section className="featured-section page-width">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Made for your desk</p>
            <h2>Workspace essentials</h2>
            <p className="currency-note">All prices are in CAD.</p>
          </div>
          <button
            className="text-button"
            type="button"
            onClick={() => onNavigate('shop')}
          >
            View all <ArrowRight size={15} aria-hidden="true" />
          </button>
        </div>

        <div className="product-grid">
          {products.slice(0, 3).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onViewProduct}
            />
          ))}
        </div>
      </section>
    </>
  );
}

interface PillarProps {
  icon: ReactNode;
  title: string;
  text: string;
}

function Pillar({ icon, title, text }: PillarProps) {
  return (
    <div className="pillar">
      <div className="pillar-icon" aria-hidden="true">
        {icon}
      </div>
      <div>
        <strong>{title}</strong>
        <span>{text}</span>
      </div>
    </div>
  );
}
