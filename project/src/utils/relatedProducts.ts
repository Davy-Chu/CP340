import { products } from '@/data/products';
import type { Product } from '@/types/catalog';

export function getRelatedProducts(product: Product): Product[] {
  const sameCategory = products.filter(
    (candidate) => candidate.id !== product.id && candidate.category === product.category,
  );
  const otherProducts = products.filter(
    (candidate) => candidate.id !== product.id && candidate.category !== product.category,
  );

  return [...sameCategory, ...otherProducts].slice(0, 3);
}
