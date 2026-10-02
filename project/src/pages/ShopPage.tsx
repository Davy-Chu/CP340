import { useMemo, useState } from 'react';
import { ProductCard } from '@/components/catalog/ProductCard';
import { categories, products } from '@/data/products';
import type { CategoryFilter, Product } from '@/types/catalog';

interface ShopPageProps {
  onViewProduct: (product: Product) => void;
}

export function ShopPage({ onViewProduct }: ShopPageProps) {
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
          <h1>Shop</h1>
          <p>Workspace essentials for a calmer, more productive you.</p>
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
