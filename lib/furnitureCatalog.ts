import { FurnitureCatalogItem } from '@/types';

export const FURNITURE_CATALOG: FurnitureCatalogItem[] = [
  // Living Room
  { type: 'sofa', label: 'Sofa', icon: '🛋️', category: 'living', size: [2.2, 0.9] },
  { type: 'armchair', label: 'Armchair', icon: '🪑', category: 'living', size: [0.85, 0.85] },
  { type: 'coffee_table', label: 'Coffee Table', icon: '🪵', category: 'living', size: [1.1, 0.6] },
  { type: 'tv_stand', label: 'TV Stand', icon: '📺', category: 'living', size: [1.6, 0.45] },
  { type: 'bookshelf', label: 'Bookshelf', icon: '📚', category: 'living', size: [0.8, 0.3] },
  { type: 'side_table', label: 'Side Table', icon: '🟫', category: 'living', size: [0.5, 0.5] },
  // Dining
  { type: 'dining_table', label: 'Dining Table', icon: '🍽️', category: 'dining', size: [1.8, 0.9] },
  { type: 'dining_chair', label: 'Dining Chair', icon: '🪑', category: 'dining', size: [0.5, 0.5] },
  // Bedroom
  { type: 'bed_double', label: 'Double Bed', icon: '🛏️', category: 'bedroom', size: [1.6, 2.0] },
  { type: 'bed_single', label: 'Single Bed', icon: '🛏️', category: 'bedroom', size: [0.9, 2.0] },
  { type: 'wardrobe', label: 'Wardrobe', icon: '🚪', category: 'bedroom', size: [1.2, 0.6] },
  // Office
  { type: 'desk', label: 'Desk', icon: '🖥️', category: 'office', size: [1.4, 0.7] },
  { type: 'office_chair', label: 'Office Chair', icon: '💺', category: 'office', size: [0.65, 0.65] },
  // Decor
  { type: 'plant', label: 'Plant', icon: '🌿', category: 'decor', size: [0.4, 0.4] },
  { type: 'floor_lamp', label: 'Floor Lamp', icon: '💡', category: 'decor', size: [0.3, 0.3] },
];

export const CATEGORY_LABELS: Record<string, string> = {
  living: 'Living Room',
  dining: 'Dining',
  bedroom: 'Bedroom',
  office: 'Office',
  decor: 'Decor',
};
