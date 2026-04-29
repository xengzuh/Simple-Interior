export interface Room {
  id: string;
  x: number; // grid units
  y: number;
  width: number;
  height: number;
  name: string;
  color?: string;
}

export type FurnitureType =
  | 'sofa'
  | 'armchair'
  | 'coffee_table'
  | 'dining_table'
  | 'dining_chair'
  | 'bed_double'
  | 'bed_single'
  | 'wardrobe'
  | 'desk'
  | 'office_chair'
  | 'bookshelf'
  | 'tv_stand'
  | 'side_table'
  | 'plant'
  | 'floor_lamp';

export interface FurnitureCatalogItem {
  type: FurnitureType;
  label: string;
  icon: string;
  category: 'living' | 'dining' | 'bedroom' | 'office' | 'decor';
  size: [number, number]; // footprint in meters [width, depth]
}

export interface PlacedFurniture {
  id: string;
  type: FurnitureType;
  roomId: string;
  position: [number, number, number]; // 3D world position
  rotation: number; // Y-axis rotation in radians
}

export type StyleId = 'scandinavian' | 'modern' | 'bohemian' | 'industrial' | 'minimalist';

export interface DesignStyle {
  id: StyleId;
  name: string;
  description: string;
  wallColor: string;
  floorColor: string;
  ceilingColor: string;
  trimColor: string;
  furnitureColors: Record<FurnitureType, string>;
  accentColor: string;
  rugColor: string;
}

export type AppView = '2d' | '3d';

export interface FurnitureSelection {
  type: FurnitureType;
  quantity: number;
}
