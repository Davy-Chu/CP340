import { useMemo, useState } from 'react';
import { ProductCard } from '@/components/catalog/ProductCard';
import { categories, products } from '@/data/products';
import type { CategoryFilter, Product } from '@/types/catalog';
import { useSeo } from '@/utils/seo';

interface ShopPageProps {
  onViewProduct: (product: Product) => void;
}

export function ShopPage({ onViewProduct }: ShopPageProps) {
  useSeo({
    title: 'Shop Desk & Workspace Accessories | WorkNest',
    description: 'Browse WorkNest desk accessories including laptop stands, desk organizers, lighting, cable organizers, and workspace decor.',
  });

  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All');

  const filteredProducts = useMemo(
    () =>
      selectedCategory === 'All'
        ? products
        : products.filter((product) => product.category === selectedCategory),
    [selectedCategory],
  );

  return (
    <section className="shop-page page-width">
      <div className="shop-heading">
        <div>
          <p className="eyebrow">The WorkNest collection</p>
          <h1>Desk &amp; Workspace Accessories</h1>
          <p>
            Explore desk accessories for an organized, productive workspace,
            including laptop stands, desk organizers, lighting, and cable management.
          </p>
        </div>
        <span className="product-total">
          {filteredProducts.length}{' '}
          {filteredProducts.length === 1 ? 'product' : 'products'}
        </span>
      </div>

      <div className="category-tabs" aria-label="Filter products by category">
        {categories.map((category) => (
          <button
            key={category}
            className={selectedCategory === category ? 'selected' : ''}
            type="button"
            onClick={() => setSelectedCategory(category)}
            aria-pressed={selectedCategory === category}
          >
            {category}
          </button>
        ))}
      </div>
      <p className="currency-note shop-currency-note">
        All prices are in CAD.
      </p>

      <div className="product-grid">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onSelect={onViewProduct}
          />
        ))}
      </div>
    </section>
  );
}
