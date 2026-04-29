'use client';
import { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky, Grid, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useStore, getStyle } from '@/store/useStore';
import { Room } from '@/types';
import FurnitureMesh from './FurnitureMesh';

const UNIT = 1; // 1 grid unit = 1 metre
const WALL_H = 3.0;
const WALL_T = 0.15;

function RoomGeometry({ room, wallColor, floorColor, ceilingColor }: {
  room: Room;
  wallColor: string;
  floorColor: string;
  ceilingColor: string;
}) {
  const x = room.x * UNIT;
  const z = room.y * UNIT;
  const w = room.width * UNIT;
  const d = room.height * UNIT;

  const wallMat = <meshStandardMaterial color={wallColor} roughness={0.85} />;
  const floorMat = <meshStandardMaterial color={floorColor} roughness={0.7} />;

  return (
    <group>
      {/* Floor */}
      <mesh position={[x + w / 2, 0, z + d / 2]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w, d]} />
        {floorMat}
      </mesh>

      {/* Ceiling */}
      <mesh position={[x + w / 2, WALL_H, z + d / 2]} receiveShadow rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color={ceilingColor} roughness={0.9} />
      </mesh>

      {/* South wall */}
      <mesh position={[x + w / 2, WALL_H / 2, z + d]} castShadow receiveShadow>
        <boxGeometry args={[w, WALL_H, WALL_T]} />
        {wallMat}
      </mesh>

      {/* North wall */}
      <mesh position={[x + w / 2, WALL_H / 2, z]} castShadow receiveShadow>
        <boxGeometry args={[w, WALL_H, WALL_T]} />
        {wallMat}
      </mesh>

      {/* East wall */}
      <mesh position={[x + w, WALL_H / 2, z + d / 2]} castShadow receiveShadow>
        <boxGeometry args={[WALL_T, WALL_H, d]} />
        {wallMat}
      </mesh>

      {/* West wall */}
      <mesh position={[x, WALL_H / 2, z + d / 2]} castShadow receiveShadow>
        <boxGeometry args={[WALL_T, WALL_H, d]} />
        {wallMat}
      </mesh>

      {/* Room label (floating) */}
      <mesh position={[x + w / 2, WALL_H - 0.1, z + d / 2]}>
        <planeGeometry args={[0, 0]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
}

function SceneContent() {
  const { rooms, furniture, styleId } = useStore();
  const style = getStyle(styleId);

  // Compute scene center for camera target
  const centerX = rooms.length
    ? rooms.reduce((s, r) => s + r.x + r.width / 2, 0) / rooms.length
    : 5;
  const centerZ = rooms.length
    ? rooms.reduce((s, r) => s + r.y + r.height / 2, 0) / rooms.length
    : 5;

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[centerX + 10, 15, centerZ + 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <pointLight position={[centerX, WALL_H - 0.2, centerZ]} intensity={0.4} color="#FFF8DC" />

      {/* Sky */}
      <Sky sunPosition={[100, 20, 100]} />

      {/* Ground plane (outside rooms) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#2D3748" roughness={1} />
      </mesh>

      {/* Rooms */}
      {rooms.map((room) => (
        <RoomGeometry
          key={room.id}
          room={room}
          wallColor={style.wallColor}
          floorColor={style.floorColor}
          ceilingColor={style.ceilingColor}
        />
      ))}

      {/* Furniture */}
      {furniture.map((item) => (
        <FurnitureMesh key={item.id} item={item} styleId={styleId} />
      ))}

      {/* Camera controls */}
      <OrbitControls
        target={[centerX, 0, centerZ]}
        minDistance={2}
        maxDistance={60}
        maxPolarAngle={Math.PI / 2 - 0.02}
        enableDamping
        dampingFactor={0.06}
      />
    </>
  );
}

function EmptyState() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 pointer-events-none">
      <div className="text-6xl mb-4">🏠</div>
      <p className="text-lg font-medium text-slate-300">No rooms yet</p>
      <p className="text-sm mt-1">Go to Floor Plan and draw your rooms first</p>
    </div>
  );
}

export default function Scene3D() {
  const { rooms, furniture } = useStore();

  // Compute initial camera position based on room bounds
  const maxX = rooms.length ? Math.max(...rooms.map((r) => r.x + r.width)) : 10;
  const maxZ = rooms.length ? Math.max(...rooms.map((r) => r.y + r.height)) : 10;
  const camDistance = Math.max(maxX, maxZ) * 1.4 + 5;

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
      <Canvas
        shadows
        camera={{
          position: [maxX / 2 + camDistance * 0.6, camDistance * 0.7, maxZ / 2 + camDistance * 0.6],
          fov: 50,
          near: 0.1,
          far: 500,
        }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#1a1a2e' }}
      >
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>

      {rooms.length === 0 && <EmptyState />}

      {/* HUD */}
      <div className="absolute bottom-3 left-3 flex flex-col gap-1 text-xs text-slate-400 bg-slate-900/70 rounded-lg px-3 py-2 pointer-events-none backdrop-blur">
        <span>🖱 Left drag — orbit</span>
        <span>🖱 Right drag — pan</span>
        <span>🖱 Scroll — zoom</span>
        <span>🖱 Drag furniture to move</span>
        <span>🖱 Double-click furniture to rotate</span>
      </div>

      {furniture.length > 0 && (
        <div className="absolute top-3 right-3 bg-slate-900/70 backdrop-blur rounded-lg px-3 py-1.5 text-xs text-slate-300">
          {furniture.length} piece{furniture.length !== 1 ? 's' : ''} placed
        </div>
      )}
    </div>
  );
}
