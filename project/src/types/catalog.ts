export type PageId = 'home' | 'shop' | 'product' | 'about' | 'blog' | 'order-confirmation';

export type ProductCategory = 'Stands' | 'Lighting' | 'Organization' | 'Decor';
export type CategoryFilter = 'All' | ProductCategory;

export interface Product {
  id: number;
  name: string;
  price: number;
  category: ProductCategory;
  image: string;
  imageAlt: string;
  description: string;
  features: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}
