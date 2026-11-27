import { useId } from 'react';
import { ProductCard } from '@/components/catalog/ProductCard';
import type { Product } from '@/types/catalog';
import { getRelatedProducts } from '@/utils/relatedProducts';

interface RelatedProductsProps {
  product: Product;
  onViewProduct: (product: Product) => void;
}

export function RelatedProducts({ product, onViewProduct }: RelatedProductsProps) {
  const headingId = useId();
  const relatedProducts = getRelatedProducts(product);

  if (relatedProducts.length === 0) return null;

  return (
    <section className="related-products" aria-labelledby={headingId}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Complete your workspace</p>
          <h2 id={headingId}>You May Also Like</h2>
          <p className="currency-note">All prices are in CAD.</p>
        </div>
      </div>
      <div className="product-grid">
        {relatedProducts.map((relatedProduct) => (
          <ProductCard key={relatedProduct.id} product={relatedProduct} onSelect={onViewProduct} />
        ))}
      </div>
    </section>
  );
}
