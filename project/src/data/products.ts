import type { CategoryFilter, Product } from '@/types/catalog';

export const images = {
  hero: 'https://images.pexels.com/photos/10567351/pexels-photo-10567351.jpeg?auto=compress&cs=tinysrgb&w=1400',
  desk: 'https://images.pexels.com/photos/12278554/pexels-photo-12278554.jpeg?auto=compress&cs=tinysrgb&w=1400',
  journal: 'https://images.pexels.com/photos/6177596/pexels-photo-6177596.jpeg?auto=compress&cs=tinysrgb&w=1200',
  stand: 'https://images.pexels.com/photos/8004107/pexels-photo-8004107.jpeg?auto=compress&cs=tinysrgb&w=900',
  organizer: 'https://images.pexels.com/photos/11148009/pexels-photo-11148009.jpeg?auto=compress&cs=tinysrgb&w=900',
  lamp: 'https://images.pexels.com/photos/30107913/pexels-photo-30107913.png?auto=compress&cs=tinysrgb&w=900',
} as const;

export const categories: CategoryFilter[] = [
  'All',
  'Stands',
  'Lighting',
  'Organization',
  'Decor',
];

export const products: Product[] = [
  {
    id: 1,
    name: 'Lift Laptop Stand',
    price: 59,
    category: 'Stands',
    image: images.stand,
    description: 'Raise your screen and create a more comfortable workspace.',
    features: [
      'Ergonomic design',
      'Sturdy and stable build',
      'Sleek, minimalist look',
      'Fits most laptops up to 16″',
    ],
  },
  {
    id: 2,
    name: 'Nest Desk Organizer',
    price: 39,
    category: 'Organization',
    image: images.organizer,
    description: 'A calm home for the small tools you use every day.',
    features: [
      'Solid wood construction',
      'Modular compartments',
      'Keeps essentials within reach',
      'Designed for small desks',
    ],
  },
  {
    id: 3,
    name: 'Halo Desk Lamp',
    price: 49,
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
  {
    id: 4,
    name: 'Rise Monitor Stand',
    price: 69,
    category: 'Stands',
    image: images.desk,
    description: 'A little more height, and a lot more breathing room.',
    features: [
      'Raises monitor to eye level',
      'Hidden storage shelf',
      'Solid bamboo finish',
      'Supports up to 20kg',
    ],
  },
  {
    id: 5,
    name: 'CableDock Organizer',
    price: 24,
    category: 'Organization',
    image: images.organizer,
    description: 'Keep every cable in its place and off the floor.',
    features: [
      'Six cable channels',
      'Weighted non-slip base',
      'Fits charging cables',
      'Easy one-hand access',
    ],
  },
  {
    id: 6,
    name: 'Quiet Ceramic Planter',
    price: 29,
    category: 'Decor',
    image: images.lamp,
    description: 'A small touch of green to make your desk feel alive.',
    features: [
      'Hand-finished ceramic',
      'Drainage tray included',
      'Fits small desk plants',
      'Neutral matte glaze',
    ],
  },
];
