import { ArrowRight } from 'lucide-react';
import { images } from '@/data/products';
import type { PageId } from '@/types/catalog';

interface AboutPageProps {
  onNavigate: (page: PageId) => void;
}

export function AboutPage({ onNavigate }: AboutPageProps) {
  return (
    <section className="about-page page-width">
      <div className="about-intro">
        <div>
          <p className="eyebrow">A little about us</p>
          <h1>
            About
            <br />
            WorkNest
          </h1>
          <p>
            WorkNest creates simple, thoughtful workspace essentials for a
            calmer, more productive everyday life.
          </p>
        </div>
        <img
          src={images.desk}
          alt="Calm home office with plants and a wooden desk"
        />
      </div>

      <div className="about-body">
        <blockquote className="about-quote">
          “The space where we work has a major impact on how we work.”
        </blockquote>
        <div>
          <p>
            Many of us now study, work, and complete personal projects from the
            same desk every day. But building a comfortable and organized
            workspace can quickly become expensive or unnecessarily complicated.
          </p>
          <p>
            WorkNest was created to offer simple, affordable products that solve
            everyday problems — from tangled cables and limited desk space to
            uncomfortable laptop placement.
          </p>
          <button
            className="text-button"
            type="button"
            onClick={() => onNavigate('shop')}
          >
            Find your essentials <ArrowRight size={15} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
