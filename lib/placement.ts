import { Room, PlacedFurniture, FurnitureSelection, FurnitureType } from '@/types';
import { FURNITURE_CATALOG } from './furnitureCatalog';

const GRID = 1; // 1 unit = 1 meter
const WALL_THICKNESS = 0.15;
const WALL_MARGIN = 0.1; // extra gap from wall

function getFurnitureSize(type: FurnitureType): [number, number] {
  return FURNITURE_CATALOG.find((f) => f.type === type)?.size ?? [1, 1];
}

// Returns a rotation (0, π/2, π, 3π/2) to place furniture against the nearest wall
function rotationForWall(wall: 'north' | 'south' | 'east' | 'west'): number {
  return { north: Math.PI, south: 0, east: -Math.PI / 2, west: Math.PI / 2 }[wall];
}

export function autoPlace(
  rooms: Room[],
  selections: FurnitureSelection[]
): PlacedFurniture[] {
  const placed: PlacedFurniture[] = [];

  if (rooms.length === 0) return placed;

  // Flatten selections into individual items
  const items: FurnitureType[] = [];
  for (const sel of selections) {
    for (let i = 0; i < sel.quantity; i++) items.push(sel.type);
  }

  // Spread items across rooms round-robin
  let roomIndex = 0;

  for (const type of items) {
    const room = rooms[roomIndex % rooms.length];
    roomIndex++;

    const [fw, fd] = getFurnitureSize(type);

    // Room bounds in 3D world coords (grid unit = 1m)
    const rx = room.x * GRID;
    const rz = room.y * GRID;
    const rw = room.width * GRID;
    const rd = room.height * GRID;

    // Default: place in center, then try wall-hugging strategies
    let px = rx + rw / 2;
    let pz = rz + rd / 2;
    let rotation = 0;

    const wallItems: FurnitureType[] = [
      'sofa', 'wardrobe', 'bookshelf', 'tv_stand', 'desk', 'bed_double', 'bed_single',
    ];
    const centerItems: FurnitureType[] = ['coffee_table', 'dining_table', 'plant'];

    if (wallItems.includes(type)) {
      // Place against south wall by default, unless something is already there
      const margin = WALL_THICKNESS + WALL_MARGIN + fd / 2;
      pz = rz + rd - margin;
      px = rx + rw / 2;
      rotation = rotationForWall('south');

      // Offset if room is too small
      if (fd / 2 + margin > rd / 2) {
        pz = rz + rd / 2;
      }

      // Spread multiple wall items horizontally
      const wallItemsInRoom = placed.filter(
        (p) => p.roomId === room.id && wallItems.includes(p.type)
      );
      if (wallItemsInRoom.length > 0) {
        const offset = (wallItemsInRoom.length % 2 === 0 ? 1 : -1) *
          (fw + 0.3) * Math.ceil(wallItemsInRoom.length / 2);
        px = Math.max(rx + fw / 2 + WALL_MARGIN, Math.min(rx + rw - fw / 2 - WALL_MARGIN, px + offset));
      }
    } else if (centerItems.includes(type)) {
      // Place in center with small offset per item
      const centerItemsInRoom = placed.filter(
        (p) => p.roomId === room.id && centerItems.includes(p.type)
      );
      px = rx + rw / 2 + (centerItemsInRoom.length * 0.6);
      pz = rz + rd / 2;
    } else {
      // Chairs, lamps, etc — scatter near center
      const others = placed.filter((p) => p.roomId === room.id);
      const angle = (others.length * 1.2);
      const radius = 0.8 + others.length * 0.3;
      px = rx + rw / 2 + Math.cos(angle) * radius;
      pz = rz + rd / 2 + Math.sin(angle) * radius;
    }

    // Clamp to room
    px = Math.max(rx + fw / 2 + WALL_MARGIN, Math.min(rx + rw - fw / 2 - WALL_MARGIN, px));
    pz = Math.max(rz + fd / 2 + WALL_MARGIN, Math.min(rz + rd - fd / 2 - WALL_MARGIN, pz));

    placed.push({
      id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      roomId: room.id,
      position: [px, 0, pz],
      rotation,
    });
  }

  return placed;
}
