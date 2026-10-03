import { useState } from 'react';
import { Check, Minus, Plus, ShoppingCart } from 'lucide-react';
import { images } from '@/data/products';
import type { Product } from '@/types/catalog';

interface ProductPageProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
}

export function ProductPage({ product, onAddToCart }: ProductPageProps) {
  const [quantity, setQuantity] = useState(1);
  const galleryImages = [
    product.image,
    images.desk_organizer,
    images.cable_organizer,
    images.laptop_stand,
  ];

  return (
    <section className="product-page page-width">
      <div className="product-gallery">
        <div className="gallery-thumbs" aria-hidden="true">
          {galleryImages.map((image, index) => (
            <img key={`${image}-${index}`} src={image} alt="" />
          ))}
        </div>
        <div className="product-main-image">
          <img src={product.image} alt={product.name} />
        </div>
      </div>

      <div className="product-details">
        <p className="eyebrow">{product.category}</p>
        <h1>{product.name}</h1>
        <div className="product-price">${product.price}</div>
        <p className="product-description">{product.description}</p>

        <ul className="feature-list">
          {product.features.map((feature) => (
            <li key={feature}>
              <Check size={17} aria-hidden="true" />
              {feature}
            </li>
          ))}
        </ul>

        <div className="quantity-row">
          <span>Quantity</span>
          <div className="quantity-control">
            <button
              type="button"
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              aria-label="Decrease quantity"
            >
              <Minus size={14} aria-hidden="true" />
            </button>
            <span aria-live="polite">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((value) => value + 1)}
              aria-label="Increase quantity"
            >
              <Plus size={14} aria-hidden="true" />
            </button>
          </div>
        </div>

        <button
          className="primary-button add-button"
          type="button"
          onClick={() => onAddToCart(product, quantity)}
        >
          Add to Cart <ShoppingCart size={17} aria-hidden="true" />
        </button>
        <p className="shipping-note">Free shipping on orders over $75</p>
      </div>
    </section>
  );
}
