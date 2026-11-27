import { ExternalLink } from 'lucide-react';
import naturalWorkspace from '@/assets/commitments/natural-workspace.jpg';
import { commitments, suppliers } from '@/data/commitments';
import { useSeo } from '@/utils/seo';

export function CommitmentsPage() {
  useSeo({
    title: 'Our Commitments | WorkNest',
    description: 'Discover how WorkNest uses mindful packaging, responsibly sourced materials, and durable workspace accessories, and meet our suppliers.',
  });

  return (
    <div className="commitments-page page-width">
      <section className="commitments-hero" aria-labelledby="commitments-title">
        <div>
          <p className="eyebrow">Our Commitments</p>
          <h1 id="commitments-title">A better workspace. A lighter footprint.</h1>
          <p className="commitments-intro">
            A thoughtfully designed workspace starts with the choices behind it. At WorkNest, we use
            mindful packaging, source responsible materials, and select products built for lasting use
            to make everyday productivity more environmentally responsible.
          </p>
        </div>
        <img
          className="commitments-hero-image"
          src={naturalWorkspace}
          alt="Sunlit wooden desk and shelves with potted green plants beside a window"
          width={1200}
          height={1897}
        />
      </section>

      <section className="commitments-section" aria-labelledby="commitments-values-title">
        <header className="commitments-section-heading">
          <p className="eyebrow">Thoughtful choices, every day</p>
          <h2 id="commitments-values-title">What We Stand For</h2>
        </header>
        <div className="commitments-grid">
          {commitments.map(({ title, description, icon: Icon }) => (
            <article className="commitment-card" key={title}>
              <span className="commitment-icon"><Icon size={26} strokeWidth={1.5} aria-hidden="true" /></span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="commitments-section" aria-labelledby="commitments-suppliers-title">
        <header className="commitments-section-heading">
          <p className="eyebrow">Responsible sourcing in practice</p>
          <h2 id="commitments-suppliers-title">Our Suppliers</h2>
          <p>
            Responsible sourcing shapes what we sell and how we ship it. We work with EcoEnclose,
            Cascades, and Rewood to bring paper-based protective packaging, recyclable shipping boxes,
            and thoughtfully made workspace accessories into our everyday operations.
          </p>
        </header>
        <p className="supplier-context">
          Photos illustrate materials and workspace ideas; they do not depict these suppliers' products.
        </p>
        <div className="commitments-grid">
          {suppliers.map((supplier) => (
            <article className="supplier-card" key={supplier.name}>
              <img src={supplier.image} alt={supplier.imageAlt} width={800} height={533} loading="lazy" />
              <div className="supplier-card-body">
                <h3>{supplier.name}</h3>
                <p className="supplier-category">{supplier.category}</p>
                <p className="supplier-description">{supplier.description}</p>
                <a
                  className="text-button supplier-link"
                  href={supplier.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit Website: ${supplier.name} (opens in a new tab)`}
                >
                  Visit Website <ExternalLink size={16} aria-hidden="true" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
