'use client';
import { useRef, useState } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { FurnitureType, PlacedFurniture } from '@/types';
import { useStore, getStyle } from '@/store/useStore';
import { FURNITURE_CATALOG } from '@/lib/furnitureCatalog';

interface FurnitureMeshProps {
  item: PlacedFurniture;
  styleId: string;
}

// ─── Individual piece components ──────────────────────────────────────────────

function Box({ w, h, d, color, y = 0, ...rest }: {
  w: number; h: number; d: number; color: string; y?: number;
  [k: string]: unknown;
}) {
  return (
    <mesh position={[0, y + h / 2, 0]} castShadow receiveShadow {...rest}>
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function Cylinder({ r, h, color, y = 0 }: { r: number; h: number; color: string; y?: number }) {
  return (
    <mesh position={[0, y + h / 2, 0]} castShadow>
      <cylinderGeometry args={[r, r, h, 12]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// ─── Furniture geometry definitions ──────────────────────────────────────────

function Sofa({ color }: { color: string }) {
  const dark = '#00000030';
  return (
    <group>
      <Box w={2.2} h={0.2} d={0.9} color={color} y={0.2} /> {/* seat */}
      <Box w={2.2} h={0.5} d={0.15} color={color} y={0.2} /> {/* back — positioned at front of seat depth */}
      <Box w={0.15} h={0.5} d={0.9} color={color} y={0.2} /> {/* left arm */}
      <mesh position={[0, 0.35 + 0.5 / 2, -0.9 / 2 + 0.075]} castShadow>
        <boxGeometry args={[2.2, 0.5, 0.15]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[-2.2 / 2 + 0.075, 0.35 + 0.5 / 2, 0]} castShadow>
        <boxGeometry args={[0.15, 0.5, 0.9]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[2.2 / 2 - 0.075, 0.35 + 0.5 / 2, 0]} castShadow>
        <boxGeometry args={[0.15, 0.5, 0.9]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* legs */}
      {[[-0.95, -0.35], [0.95, -0.35], [-0.95, 0.35], [0.95, 0.35]].map(([lx, lz], i) => (
        <mesh key={i} position={[lx, 0.1, lz]} castShadow>
          <boxGeometry args={[0.08, 0.2, 0.08]} />
          <meshStandardMaterial color="#8B6914" />
        </mesh>
      ))}
    </group>
  );
}

function Armchair({ color }: { color: string }) {
  return (
    <group>
      <Box w={0.85} h={0.18} d={0.85} color={color} y={0.3} />
      <mesh position={[0, 0.48 + 0.4 / 2, -0.85 / 2 + 0.08]} castShadow>
        <boxGeometry args={[0.85, 0.4, 0.15]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[-0.85 / 2 + 0.07, 0.48 + 0.2 / 2, 0]} castShadow>
        <boxGeometry args={[0.13, 0.2, 0.85]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.85 / 2 - 0.07, 0.48 + 0.2 / 2, 0]} castShadow>
        <boxGeometry args={[0.13, 0.2, 0.85]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {[[-0.35, -0.35], [0.35, -0.35], [-0.35, 0.35], [0.35, 0.35]].map(([lx, lz], i) => (
        <mesh key={i} position={[lx, 0.15, lz]} castShadow>
          <boxGeometry args={[0.07, 0.3, 0.07]} />
          <meshStandardMaterial color="#8B6914" />
        </mesh>
      ))}
    </group>
  );
}

function CoffeeTable({ color }: { color: string }) {
  return (
    <group>
      <Box w={1.1} h={0.04} d={0.6} color={color} y={0.38} />
      {[[-0.48, -0.25], [0.48, -0.25], [-0.48, 0.25], [0.48, 0.25]].map(([lx, lz], i) => (
        <mesh key={i} position={[lx, 0.19, lz]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.38, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
}

function DiningTable({ color }: { color: string }) {
  return (
    <group>
      <Box w={1.8} h={0.05} d={0.9} color={color} y={0.73} />
      {[[-0.8, -0.38], [0.8, -0.38], [-0.8, 0.38], [0.8, 0.38]].map(([lx, lz], i) => (
        <mesh key={i} position={[lx, 0.365, lz]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.73, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
}

function DiningChair({ color }: { color: string }) {
  return (
    <group>
      <Box w={0.45} h={0.04} d={0.45} color={color} y={0.44} />
      <mesh position={[0, 0.44 + 0.4 / 2, -0.45 / 2 + 0.03]} castShadow>
        <boxGeometry args={[0.45, 0.4, 0.05]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {[[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]].map(([lx, lz], i) => (
        <mesh key={i} position={[lx, 0.22, lz]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.44, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
}

function Bed({ color, size }: { color: string; size: 'double' | 'single' }) {
  const w = size === 'double' ? 1.6 : 0.9;
  return (
    <group>
      {/* Base */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <boxGeometry args={[w, 0.3, 2.0]} />
        <meshStandardMaterial color="#8B6914" />
      </mesh>
      {/* Mattress */}
      <mesh position={[0, 0.36, 0.1]} castShadow>
        <boxGeometry args={[w - 0.05, 0.15, 1.8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Pillow(s) */}
      {(size === 'double' ? [-0.3, 0.3] : [0]).map((px, i) => (
        <mesh key={i} position={[px, 0.52, -0.75]} castShadow>
          <boxGeometry args={[0.5, 0.08, 0.35]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.9} />
        </mesh>
      ))}
      {/* Headboard */}
      <mesh position={[0, 0.65, -0.95]} castShadow>
        <boxGeometry args={[w, 0.8, 0.08]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

function Wardrobe({ color }: { color: string }) {
  return (
    <group>
      <Box w={1.2} h={2.0} d={0.6} color={color} y={0} />
      {/* Door lines */}
      <mesh position={[0, 1.0, 0.305]} castShadow>
        <boxGeometry args={[0.015, 1.8, 0.01]} />
        <meshStandardMaterial color="#00000040" />
      </mesh>
      {/* Handles */}
      {[-0.2, 0.2].map((hx, i) => (
        <mesh key={i} position={[hx, 1.0, 0.31]} castShadow>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

function Desk({ color }: { color: string }) {
  return (
    <group>
      <Box w={1.4} h={0.04} d={0.7} color={color} y={0.73} />
      {[[-0.64, -0.3], [0.64, -0.3], [-0.64, 0.3], [0.64, 0.3]].map(([lx, lz], i) => (
        <mesh key={i} position={[lx, 0.365, lz]} castShadow>
          <boxGeometry args={[0.05, 0.73, 0.05]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
}

function OfficeChair({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0.48, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.28, 0.06, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.48 + 0.35, -0.28 + 0.04]} castShadow>
        <boxGeometry args={[0.5, 0.4, 0.06]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 0.45, 8]} />
        <meshStandardMaterial color="#888888" metalness={0.6} />
      </mesh>
      {/* 5-star base */}
      {Array.from({ length: 5 }).map((_, i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.25, 0.04, Math.sin(a) * 0.25]} rotation={[0, a, 0]} castShadow>
            <boxGeometry args={[0.5, 0.03, 0.04]} />
            <meshStandardMaterial color="#555555" metalness={0.6} />
          </mesh>
        );
      })}
    </group>
  );
}

function Bookshelf({ color }: { color: string }) {
  return (
    <group>
      <Box w={0.8} h={1.8} d={0.3} color={color} y={0} />
      {[0.4, 0.8, 1.2, 1.6].map((sy, i) => (
        <mesh key={i} position={[0, sy, 0.005]} castShadow>
          <boxGeometry args={[0.76, 0.02, 0.28]} />
          <meshStandardMaterial color="#00000025" />
        </mesh>
      ))}
      {/* Colourful books */}
      {['#E53E3E', '#3182CE', '#38A169', '#D69E2E', '#805AD5'].map((bc, i) => (
        <mesh key={i} position={[-0.3 + i * 0.12, 0.22, 0.06]} castShadow>
          <boxGeometry args={[0.08, 0.3, 0.2]} />
          <meshStandardMaterial color={bc} />
        </mesh>
      ))}
    </group>
  );
}

function TvStand({ color }: { color: string }) {
  return (
    <group>
      <Box w={1.6} h={0.5} d={0.45} color={color} y={0} />
      <mesh position={[0, 0.26, 0.005]} castShadow>
        <boxGeometry args={[1.56, 0.01, 0.43]} />
        <meshStandardMaterial color="#FFFFFF10" />
      </mesh>
      {/* Door outlines */}
      {[-0.55, 0.55].map((dx, i) => (
        <mesh key={i} position={[dx, 0.25, 0.228]} castShadow>
          <boxGeometry args={[0.7, 0.45, 0.01]} />
          <meshStandardMaterial color="#FFFFFF08" />
        </mesh>
      ))}
    </group>
  );
}

function SideTable({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.04, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.275, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.55, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.03, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.06, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

function Plant({ color }: { color: string }) {
  return (
    <group>
      {/* Pot */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.12, 0.35, 12]} />
        <meshStandardMaterial color="#C4956A" roughness={0.9} />
      </mesh>
      {/* Foliage */}
      <mesh position={[0, 0.65, 0]} castShadow>
        <sphereGeometry args={[0.28, 12, 12]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[0.12, 0.75, 0.1]} castShadow>
        <sphereGeometry args={[0.18, 10, 10]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[-0.1, 0.7, -0.1]} castShadow>
        <sphereGeometry args={[0.15, 10, 10]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
    </group>
  );
}

function FloorLamp({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 1.7, 8]} />
        <meshStandardMaterial color={color} metalness={0.4} />
      </mesh>
      <mesh position={[0, 1.75, 0]} castShadow>
        <cylinderGeometry args={[0, 0.22, 0.28, 16, 1, true]} />
        <meshStandardMaterial color="#F5F0DC" side={2} />
      </mesh>
      <mesh position={[0, 0.03, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.06, 12]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <pointLight position={[0, 1.6, 0]} intensity={0.6} distance={4} color="#FFF8DC" />
    </group>
  );
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

function FurnitureGeometry({ type, color }: { type: FurnitureType; color: string }) {
  switch (type) {
    case 'sofa': return <Sofa color={color} />;
    case 'armchair': return <Armchair color={color} />;
    case 'coffee_table': return <CoffeeTable color={color} />;
    case 'dining_table': return <DiningTable color={color} />;
    case 'dining_chair': return <DiningChair color={color} />;
    case 'bed_double': return <Bed color={color} size="double" />;
    case 'bed_single': return <Bed color={color} size="single" />;
    case 'wardrobe': return <Wardrobe color={color} />;
    case 'desk': return <Desk color={color} />;
    case 'office_chair': return <OfficeChair color={color} />;
    case 'bookshelf': return <Bookshelf color={color} />;
    case 'tv_stand': return <TvStand color={color} />;
    case 'side_table': return <SideTable color={color} />;
    case 'plant': return <Plant color={color} />;
    case 'floor_lamp': return <FloorLamp color={color} />;
    default: return <Box w={1} h={1} d={1} color={color} />;
  }
}

// ─── Draggable wrapper ────────────────────────────────────────────────────────

export default function FurnitureMesh({ item, styleId }: FurnitureMeshProps) {
  const { updateFurniturePosition, updateFurnitureRotation } = useStore();
  const style = getStyle(styleId as Parameters<typeof getStyle>[0]);
  const color = style.furnitureColors[item.type] ?? '#CCCCCC';

  const groupRef = useRef<THREE.Group>(null!);
  const [selected, setSelected] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Drag state
  const dragging = useRef(false);
  const dragPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const dragOffset = useRef(new THREE.Vector3());

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    dragging.current = true;
    setSelected(true);
    // Compute offset so object doesn't jump
    const hit = e.point.clone();
    dragOffset.current.set(
      groupRef.current.position.x - hit.x,
      0,
      groupRef.current.position.z - hit.z
    );
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!dragging.current) return;
    e.stopPropagation();
    const ray = e.ray;
    const target = new THREE.Vector3();
    ray.intersectPlane(dragPlane.current, target);
    const newX = target.x + dragOffset.current.x;
    const newZ = target.z + dragOffset.current.z;
    groupRef.current.position.set(newX, item.position[1], newZ);
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    if (!dragging.current) return;
    dragging.current = false;
    updateFurniturePosition(item.id, [
      groupRef.current.position.x,
      item.position[1],
      groupRef.current.position.z,
    ]);
  };

  const handleDoubleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    updateFurnitureRotation(item.id, item.rotation + Math.PI / 2);
  };

  return (
    <group
      ref={groupRef}
      position={item.position}
      rotation={[0, item.rotation, 0]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => { e.stopPropagation(); setSelected((s) => !s); }}
      onDoubleClick={handleDoubleClick}
    >
      <FurnitureGeometry type={item.type} color={hovered || selected ? '#90CDF4' : color} />

      {/* Selection ring */}
      {selected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[0.6, 0.7, 32]} />
          <meshBasicMaterial color="#63B3ED" transparent opacity={0.7} />
        </mesh>
      )}
    </group>
  );
}
