'use client';
import { create } from 'zustand';
import { Room, PlacedFurniture, FurnitureSelection, AppView, StyleId } from '@/types';
import { DESIGN_STYLES } from '@/lib/designStyles';
import { autoPlace } from '@/lib/placement';

interface AppState {
  // View
  view: AppView;
  setView: (v: AppView) => void;

  // Rooms
  rooms: Room[];
  addRoom: (room: Room) => void;
  updateRoom: (id: string, patch: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  clearRooms: () => void;

  // Style
  styleId: StyleId;
  setStyle: (id: StyleId) => void;

  // Furniture selections (catalog picks)
  selections: FurnitureSelection[];
  setSelections: (s: FurnitureSelection[]) => void;

  // Placed furniture in 3D
  furniture: PlacedFurniture[];
  setFurniture: (f: PlacedFurniture[]) => void;
  updateFurniturePosition: (id: string, position: [number, number, number]) => void;
  updateFurnitureRotation: (id: string, rotation: number) => void;

  // Generate
  generate: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  view: '2d',
  setView: (view) => set({ view }),

  rooms: [],
  addRoom: (room) => set((s) => ({ rooms: [...s.rooms, room] })),
  updateRoom: (id, patch) =>
    set((s) => ({ rooms: s.rooms.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),
  deleteRoom: (id) => set((s) => ({ rooms: s.rooms.filter((r) => r.id !== id) })),
  clearRooms: () => set({ rooms: [], furniture: [] }),

  styleId: 'scandinavian',
  setStyle: (styleId) => set({ styleId }),

  selections: [],
  setSelections: (selections) => set({ selections }),

  furniture: [],
  setFurniture: (furniture) => set({ furniture }),
  updateFurniturePosition: (id, position) =>
    set((s) => ({
      furniture: s.furniture.map((f) => (f.id === id ? { ...f, position } : f)),
    })),
  updateFurnitureRotation: (id, rotation) =>
    set((s) => ({
      furniture: s.furniture.map((f) => (f.id === id ? { ...f, rotation } : f)),
    })),

  generate: () => {
    const { rooms, selections } = get();
    const placed = autoPlace(rooms, selections);
    set({ furniture: placed, view: '3d' });
  },
}));

export const getStyle = (id: StyleId) =>
  DESIGN_STYLES.find((s) => s.id === id) ?? DESIGN_STYLES[0];
