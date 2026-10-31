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
    imageAlt: 'Laptop raised on a black stand on a desk',
    description: 'Raise your laptop screen with a compact laptop stand for a more comfortable, organized workspace.',
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
    imageAlt: 'Bright wooden desk with a pencil holder, white desk lamp, and notebook',
    description: 'Keep pens, chargers, and everyday desk accessories within reach with this compact desk organizer.',
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
    imageAlt: 'Circular desk light with a black rim against a yellow background',
    description: 'Bring adjustable desk lighting to your home office for comfortable reading, studying, and focused work.',
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
    imageAlt: 'Organized white workspace with a monitor, keyboard, pencil cup, and notebook',
    description: 'Create extra desk storage and lift your screen with a bamboo monitor stand for better desk organization.',
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
    imageAlt: 'Black cable organizer holding charging cables beside a laptop',
    description: 'Keep charging cables within reach with a cable organizer that helps prevent tangles and desk clutter.',
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
    imageAlt: 'Succulent in a small white ceramic planter',
    description: 'Add a small touch of green to your desk or home office with a neutral ceramic planter.',
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
