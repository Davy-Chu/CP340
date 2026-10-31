import cableOrganizerImage from '@/assets/minimalist-cable-organizer-workspace.png';
import type { CategoryFilter, Product } from '@/types/catalog';
import { catalogProducts } from '../../shared/catalog/products.js';
import type { CatalogProduct } from '../../shared/catalog/products.js';

export const images = {
  planter: 'https://images.pexels.com/photos/8787632/pexels-photo-8787632.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  desk_organizer: 'https://images.pexels.com/photos/12278554/pexels-photo-12278554.jpeg?auto=compress&cs=tinysrgb&w=1400',
  monitor_stand: 'https://images.pexels.com/photos/6177596/pexels-photo-6177596.jpeg?auto=compress&cs=tinysrgb&w=1200',
  laptop_stand: 'https://images.pexels.com/photos/968631/pexels-photo-968631.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  cable_organizer: cableOrganizerImage,
  lamp: 'https://images.pexels.com/photos/24206110/pexels-photo-24206110.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
} as const;

export const categories: CategoryFilter[] = [
  'All',
  'Stands',
  'Lighting',
  'Organization',
  'Decor',
];

// Presentation details stay in the frontend; IDs, names, and prices come from
// the same catalog the backend uses to build Stripe Checkout line items.
const productDetails: Record<CatalogProduct['id'], Omit<Product, 'id' | 'name' | 'price'>> = {
  1: {
    category: 'Stands',
    image: images.laptop_stand,
    description: 'Raise your screen and create a more comfortable workspace.',
    features: [
      'Ergonomic design',
      'Sturdy and stable build',
      'Sleek, minimalist look',
      'Fits most laptops up to 16″',
    ],
  },
  2: {
    category: 'Organization',
    image: images.desk_organizer,
    description: 'A calm home for the small tools you use every day.',
    features: [
      'Solid wood construction',
      'Modular compartments',
      'Keeps essentials within reach',
      'Designed for small desks',
    ],
  },
  3: {
    category: 'Lighting',
    image: images.lamp,
    description: 'Soft, focused light for your clearest hours.',
    features: [
      'Warm adjustable glow',
      'Compact footprint',
      'Touch dimmer',
      'Low-energy LED',
    ],
  },
  4: {
    category: 'Stands',
    image: images.monitor_stand,
    description: 'A little more height, and a lot more breathing room.',
    features: [
      'Raises monitor to eye level',
      'Hidden storage shelf',
      'Solid bamboo finish',
      'Supports up to 20kg',
    ],
  },
  5: {
    category: 'Organization',
    image: images.cable_organizer,
    description: 'Keep every cable in its place and off the floor.',
    features: [
      'Six cable channels',
      'Weighted non-slip base',
      'Fits charging cables',
      'Easy one-hand access',
    ],
  },
  6: {
    category: 'Decor',
    image: images.planter,
    description: 'A small touch of green to make your desk feel alive.',
    features: [
      'Hand-finished ceramic',
      'Drainage tray included',
      'Fits small desk plants',
      'Neutral matte glaze',
    ],
  },
};

export const products: Product[] = catalogProducts.map(({ id, name, priceInCents }) => ({
  ...productDetails[id],
  id,
  name,
  price: priceInCents / 100,
}));
