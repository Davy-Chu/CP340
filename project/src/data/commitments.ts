import { Leaf, Package, ShieldCheck, type LucideIcon } from 'lucide-react';
import paperPackaging from '@/assets/commitments/paper-packaging.jpg';
import shippingBoxes from '@/assets/commitments/shipping-boxes.jpg';
import woodenOrganizer from '@/assets/commitments/wooden-organizer.jpg';

interface Commitment {
  title: string;
  description: string;
  icon: LucideIcon;
}

interface Supplier {
  name: string;
  category: string;
  website: string;
  description: string;
  image: string;
  imageAlt: string;
}

export const commitments: Commitment[] = [
  {
    title: 'Mindful Packaging',
    description: 'We ship our orders in appropriately sized recyclable cardboard boxes and protect products with recycled paper cushioning and paper wrapping. These materials replace conventional plastic fillers and help us avoid unnecessary packaging while keeping your workspace essentials protected in transit.',
    icon: Package,
  },
  {
    title: 'Responsible Materials',
    description: 'We prioritize responsibly sourced bamboo, wood, and reusable metals in our workspace accessories. We choose suppliers with consideration for sourcing transparency, responsible manufacturing, and environmental and labour standards, making the people and processes behind our products part of every sourcing decision.',
    icon: Leaf,
  },
  {
    title: 'Built for Longevity',
    description: 'We select everyday accessories for their durability, functionality, and timeless design. From sturdy stands to practical desk organizers, our collection brings together dependable materials and useful features that support daily work and reduce the need for frequent replacement.',
    icon: ShieldCheck,
  },
];

export const suppliers: Supplier[] = [
  {
    name: 'EcoEnclose',
    category: 'Sustainable Protective Packaging',
    website: 'https://www.ecoenclose.com/',
    description: 'We use recycled paper cushioning and honeycomb wrapping from EcoEnclose to protect fragile products such as ceramic planters and desk lamps. These paper-based alternatives provide protection during shipping and reduce our reliance on single-use plastic packaging.',
    image: paperPackaging,
    imageAlt: 'Hands lining a cardboard shipping box with protective paper',
  },
  {
    name: 'Cascades',
    category: 'Recyclable Shipping Materials',
    website: 'https://www.cascades.com/',
    description: 'We use corrugated shipping boxes from Cascades, a Canadian manufacturer of fibre-based and recyclable packaging. We match box sizes to our orders to limit empty space, unnecessary packing material, and shipping volume.',
    image: shippingBoxes,
    imageAlt: 'Unbranded brown cardboard shipping boxes of different sizes stacked in sunlight',
  },
  {
    name: 'Rewood',
    category: 'Responsibly Sourced Workspace Accessories',
    website: 'https://www.rewoodhouseware.com/',
    description: 'We source bamboo and wooden monitor stands, laptop stands, and desk organizers from Rewood. Its natural-material workspace accessories and responsible sourcing options support our focus on practical products, lasting use, and thoughtful material choices.',
    image: woodenOrganizer,
    imageAlt: 'Wooden desk organizer with a built-in clock and pens',
  },
];
