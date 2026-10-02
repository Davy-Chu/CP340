import { ArrowRight } from 'lucide-react';
import type { Product } from '@/types/catalog';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export function ProductCard({ product, onSelect }: ProductCardProps) {
  return (
    <button
      className="product-card"
      type="button"
      onClick={() => onSelect(product)}
    >
      <span className="product-image">
        <img src={product.image} alt={product.name} />
        <span className="product-image-action">
          View details <ArrowRight size={14} aria-hidden="true" />
        </span>
      </span>

      <span className="product-card-info">
        <span>
          <span className="product-name">{product.name}</span>
          <span className="product-category">{product.category}</span>
        </span>
        <strong>${product.price}</strong>
      </span>
    </button>
  );
}
