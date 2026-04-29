'use client';
import { useRef, useState, useCallback, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Room } from '@/types';

const GRID = 40;       // px per metre at zoom=1
const HANDLE = 6;      // corner handle half-size in screen px

const ROOM_NAMES = [
  'Living Room', 'Bedroom', 'Kitchen', 'Bathroom',
  'Office', 'Dining Room', 'Hallway', 'Storage',
];

interface Camera { zoom: number; panX: number; panY: number }

function w2s(wx: number, wy: number, c: Camera) {
  return { sx: wx * GRID * c.zoom + c.panX, sy: wy * GRID * c.zoom + c.panY };
}
function s2w(sx: number, sy: number, c: Camera) {
  return { wx: (sx - c.panX) / (GRID * c.zoom), wy: (sy - c.panY) / (GRID * c.zoom) };
}
function snap(v: number) { return Math.round(v); }

type Corner = 'tl' | 'tr' | 'br' | 'bl';
function corners(r: Room) {
  return [
    { c: 'tl' as Corner, wx: r.x,            wy: r.y },
    { c: 'tr' as Corner, wx: r.x + r.width,  wy: r.y },
    { c: 'br' as Corner, wx: r.x + r.width,  wy: r.y + r.height },
    { c: 'bl' as Corner, wx: r.x,            wy: r.y + r.height },
  ];
}

type Mode =
  | { t: 'idle' }
  | { t: 'draw'; x0: number; y0: number; x1: number; y1: number }
  | { t: 'pan';  lx: number; ly: number }
  | { t: 'resize'; roomId: string; corner: Corner; orig: Room };

export default function FloorPlanCanvas() {
  const { rooms, addRoom, updateRoom, deleteRoom, clearRooms } = useStore();

  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nameIdx      = useRef(0);

  const [cam,        setCam]       = useState<Camera>({ zoom: 1, panX: 20, panY: 20 });
  const [mode,       setMode]      = useState<Mode>({ t: 'idle' });
  const [hovered,    setHovered]   = useState<string | null>(null);
  const [selected,   setSelected]  = useState<string | null>(null);
  const [editId,     setEditId]    = useState<string | null>(null);
  const [editName,   setEditName]  = useState('');
  const [canvasSize, setSize]      = useState({ w: 800, h: 580 });

  // Keep refs in sync so stable callbacks can read latest values
  const camRef  = useRef(cam);  useEffect(() => { camRef.current  = cam;  }, [cam]);
  const modeRef = useRef(mode); useEffect(() => { modeRef.current = mode; }, [mode]);
  const roomsRef = useRef(rooms); useEffect(() => { roomsRef.current = rooms; }, [rooms]);

  // Resize observer for canvas container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      setSize({ w: Math.floor(width), h: Math.floor(height) });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ─── Draw ────────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { w, h } = canvasSize;
    const c = camRef.current;
    const m = modeRef.current;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, w, h);

    // Grid dots (only in viewport)
    const step = GRID * c.zoom;
    const gx0 = Math.floor((-c.panX) / step) - 1;
    const gy0 = Math.floor((-c.panY) / step) - 1;
    const gx1 = gx0 + Math.ceil(w / step) + 2;
    const gy1 = gy0 + Math.ceil(h / step) + 2;
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    for (let gx = gx0; gx <= gx1; gx++) {
      for (let gy = gy0; gy <= gy1; gy++) {
        const { sx, sy } = w2s(gx, gy, c);
        ctx.beginPath();
        ctx.arc(sx, sy, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Rooms
    for (const room of roomsRef.current) {
      const { sx: rx, sy: ry } = w2s(room.x, room.y, c);
      const rw = room.width  * GRID * c.zoom;
      const rh = room.height * GRID * c.zoom;
      const isSel = room.id === selected;
      const isHov = room.id === hovered;

      ctx.fillStyle = isSel ? 'rgba(99,179,237,0.35)' : isHov ? 'rgba(99,179,237,0.2)' : 'rgba(99,179,237,0.12)';
      ctx.fillRect(rx, ry, rw, rh);
      ctx.strokeStyle = isSel ? '#63B3ED' : isHov ? '#90CDF4' : 'rgba(99,179,237,0.5)';
      ctx.lineWidth = isSel ? 2 : 1.5;
      ctx.strokeRect(rx + 0.5, ry + 0.5, rw - 1, rh - 1);

      if (room.id !== editId) {
        const fs = Math.max(10, 12 * c.zoom);
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.font = `${isSel ? 'bold ' : ''}${fs}px system-ui`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(room.name, rx + rw / 2, ry + rh / 2 - 8 * c.zoom);
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        ctx.font = `${Math.max(8, 10 * c.zoom)}px system-ui`;
        ctx.fillText(`${room.width}m × ${room.height}m`, rx + rw / 2, ry + rh / 2 + 8 * c.zoom);
      }

      // Corner handles for selected room
      if (isSel) {
        for (const { wx, wy } of corners(room)) {
          const { sx, sy } = w2s(wx, wy, c);
          ctx.fillStyle = '#63B3ED';
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1;
          ctx.fillRect(sx - HANDLE, sy - HANDLE, HANDLE * 2, HANDLE * 2);
          ctx.strokeRect(sx - HANDLE + 0.5, sy - HANDLE + 0.5, HANDLE * 2 - 1, HANDLE * 2 - 1);
        }
      }
    }

    // Draw preview
    if (m.t === 'draw') {
      const x1 = Math.min(m.x0, m.x1), y1 = Math.min(m.y0, m.y1);
      const dw = Math.abs(m.x1 - m.x0), dh = Math.abs(m.y1 - m.y0);
      if (dw > 0 && dh > 0) {
        const { sx, sy } = w2s(x1, y1, c);
        const pw = dw * GRID * c.zoom, ph = dh * GRID * c.zoom;
        ctx.fillStyle = 'rgba(72,187,120,0.2)';
        ctx.fillRect(sx, sy, pw, ph);
        ctx.strokeStyle = '#48BB78';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.strokeRect(sx + 0.5, sy + 0.5, pw - 1, ph - 1);
        ctx.setLineDash([]);
        ctx.fillStyle = '#48BB78';
        ctx.font = `${Math.max(9, 11 * c.zoom)}px system-ui`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${dw}m × ${dh}m`, sx + pw / 2, sy + ph / 2);
      }
    }

    // Zoom indicator
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '11px system-ui';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`${Math.round(c.zoom * 100)}%`, w - 8, h - 8);
  }, [canvasSize, selected, hovered, editId]);

  useEffect(() => { draw(); }, [draw, cam, mode, rooms]);

  // ─── Helpers ─────────────────────────────────────────────────────────────
  const clientToCanvas = (e: { clientX: number; clientY: number }) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { sx: e.clientX - rect.left, sy: e.clientY - rect.top };
  };

  const hitCorner = useCallback((sx: number, sy: number, room: Room): Corner | null => {
    for (const { c, wx, wy } of corners(room)) {
      const { sx: hx, sy: hy } = w2s(wx, wy, camRef.current);
      if (Math.abs(sx - hx) <= HANDLE + 3 && Math.abs(sy - hy) <= HANDLE + 3) return c;
    }
    return null;
  }, []);

  const roomAt = useCallback((sx: number, sy: number) => {
    const { wx, wy } = s2w(sx, sy, camRef.current);
    return roomsRef.current.find(r => wx >= r.x && wx <= r.x + r.width && wy >= r.y && wy <= r.y + r.height);
  }, []);

  // ─── Mouse events ─────────────────────────────────────────────────────────
  const onMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (editId) return;
    const { sx, sy } = clientToCanvas(e);

    if (e.button === 1 || (e.button === 2)) {
      e.preventDefault();
      setMode({ t: 'pan', lx: sx, ly: sy });
      return;
    }
    if (e.button !== 0) return;

    // Check corner handles on selected room
    const sel = roomsRef.current.find(r => r.id === selected);
    if (sel) {
      const corner = hitCorner(sx, sy, sel);
      if (corner) {
        setMode({ t: 'resize', roomId: sel.id, corner, orig: { ...sel } });
        return;
      }
    }

    // Check room body
    const hit = roomAt(sx, sy);
    if (hit) {
      setSelected(prev => prev === hit.id ? null : hit.id);
      return;
    }

    // Start drawing
    setSelected(null);
    const { wx, wy } = s2w(sx, sy, camRef.current);
    const gx = snap(wx), gy = snap(wy);
    setMode({ t: 'draw', x0: gx, y0: gy, x1: gx, y1: gy });
  }, [selected, editId, hitCorner, roomAt]);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const { sx, sy } = clientToCanvas(e);
    const m = modeRef.current;

    if (m.t === 'pan') {
      const dx = sx - m.lx, dy = sy - m.ly;
      setCam(c => ({ ...c, panX: c.panX + dx, panY: c.panY + dy }));
      setMode({ t: 'pan', lx: sx, ly: sy });
      return;
    }

    if (m.t === 'draw') {
      const { wx, wy } = s2w(sx, sy, camRef.current);
      setMode(prev => prev.t === 'draw' ? { ...prev, x1: snap(wx), y1: snap(wy) } : prev);
      return;
    }

    if (m.t === 'resize') {
      const { roomId, corner, orig } = m;
      const { wx, wy } = s2w(sx, sy, camRef.current);
      const gx = snap(wx), gy = snap(wy);
      let { x, y, width, height } = orig;
      if (corner === 'tl') {
        const nx = Math.min(gx, orig.x + orig.width - 1);
        const ny = Math.min(gy, orig.y + orig.height - 1);
        width  = orig.x + orig.width  - nx;
        height = orig.y + orig.height - ny;
        x = nx; y = ny;
      } else if (corner === 'tr') {
        const ny = Math.min(gy, orig.y + orig.height - 1);
        width  = Math.max(1, gx - orig.x);
        height = orig.y + orig.height - ny;
        y = ny;
      } else if (corner === 'br') {
        width  = Math.max(1, gx - orig.x);
        height = Math.max(1, gy - orig.y);
      } else {
        const nx = Math.min(gx, orig.x + orig.width - 1);
        width  = orig.x + orig.width - nx;
        height = Math.max(1, gy - orig.y);
        x = nx;
      }
      updateRoom(roomId, { x, y, width, height });
      return;
    }

    // Hover + cursor
    const hit = roomAt(sx, sy);
    setHovered(hit?.id ?? null);

    const sel = roomsRef.current.find(r => r.id === selected);
    if (sel) {
      const corner = hitCorner(sx, sy, sel);
      if (corner) {
        canvasRef.current!.style.cursor = (corner === 'tl' || corner === 'br') ? 'nwse-resize' : 'nesw-resize';
        return;
      }
    }
    canvasRef.current!.style.cursor = hit ? 'pointer' : 'crosshair';
  }, [selected, updateRoom, hitCorner, roomAt]);

  const onMouseUp = useCallback(() => {
    const m = modeRef.current;
    if (m.t === 'draw') {
      const x1 = Math.min(m.x0, m.x1), y1 = Math.min(m.y0, m.y1);
      const dw = Math.abs(m.x1 - m.x0), dh = Math.abs(m.y1 - m.y0);
      if (dw >= 2 && dh >= 2) {
        const name = ROOM_NAMES[nameIdx.current % ROOM_NAMES.length];
        nameIdx.current++;
        addRoom({ id: `room-${Date.now()}`, x: x1, y: y1, width: dw, height: dh, name });
      }
    }
    setMode({ t: 'idle' });
  }, [addRoom]);

  // ─── Scroll to zoom ───────────────────────────────────────────────────────
  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const rect = canvasRef.current!.getBoundingClientRect();
    const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    setCam(c => {
      const z = Math.min(4, Math.max(0.2, c.zoom * factor));
      return {
        zoom: z,
        panX: sx - (sx - c.panX) * (z / c.zoom),
        panY: sy - (sy - c.panY) * (z / c.zoom),
      };
    });
  }, []);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [onWheel]);

  // ─── Double-click to edit name ────────────────────────────────────────────
  const onDblClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const { sx, sy } = clientToCanvas(e);
    const hit = roomAt(sx, sy);
    if (hit) { setEditId(hit.id); setEditName(hit.name); setSelected(hit.id); }
  }, [roomAt]);

  const commitEdit = () => {
    if (editId) {
      const t = editName.trim();
      if (t) updateRoom(editId, { name: t });
    }
    setEditId(null);
  };

  // Position of name-edit input over the room
  const editRoom = rooms.find(r => r.id === editId);
  let inputStyle: React.CSSProperties = { display: 'none' };
  if (editRoom) {
    const { sx, sy } = w2s(editRoom.x, editRoom.y, cam);
    const rw = editRoom.width  * GRID * cam.zoom;
    const rh = editRoom.height * GRID * cam.zoom;
    inputStyle = { position: 'absolute', left: sx + rw / 2 - 72, top: sy + rh / 2 - 14, width: 144, height: 28 };
  }

  const deleteSelected = () => { if (selected) { deleteRoom(selected); setSelected(null); } };

  return (
    <div className="flex flex-col gap-3">
      {/* Instructions */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
        <span className="px-1.5 py-0.5 bg-slate-700 rounded">Drag</span> draw room
        <span className="text-slate-600">·</span>
        <span className="px-1.5 py-0.5 bg-slate-700 rounded">Scroll</span> zoom
        <span className="text-slate-600">·</span>
        <span className="px-1.5 py-0.5 bg-slate-700 rounded">Middle-drag</span> pan
        <span className="text-slate-600">·</span>
        <span className="px-1.5 py-0.5 bg-slate-700 rounded">Double-click</span> rename
        <span className="text-slate-600">·</span>
        <span className="px-1.5 py-0.5 bg-slate-700 rounded">Corner handles</span> resize
      </div>

      {/* Canvas container */}
      <div
        ref={containerRef}
        className="relative rounded-xl overflow-hidden border border-slate-700 shadow-2xl"
        style={{ height: 560 }}
      >
        <canvas
          ref={canvasRef}
          width={canvasSize.w}
          height={canvasSize.h}
          style={{ display: 'block', width: '100%', height: '100%', cursor: 'crosshair' }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={() => { setHovered(null); setMode({ t: 'idle' }); }}
          onDoubleClick={onDblClick}
          onContextMenu={e => e.preventDefault()}
        />

        {/* Floating name editor */}
        {editRoom && (
          <input
            autoFocus
            value={editName}
            onChange={e => setEditName(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={e => {
              if (e.key === 'Enter') commitEdit();
              if (e.key === 'Escape') setEditId(null);
            }}
            style={inputStyle}
            className="bg-slate-800 border border-blue-400 text-white text-center text-sm rounded px-2 outline-none ring-2 ring-blue-500/50"
          />
        )}
      </div>

      {/* Room list */}
      <div className="flex flex-wrap gap-2 items-center">
        {rooms.map(r => (
          <div
            key={r.id}
            onClick={() => setSelected(r.id === selected ? null : r.id)}
            onDoubleClick={() => { setEditId(r.id); setEditName(r.name); setSelected(r.id); }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm cursor-pointer transition-all
              ${r.id === selected
                ? 'bg-blue-500/30 border border-blue-400 text-blue-200'
                : 'bg-slate-700/60 border border-slate-600 text-slate-300 hover:border-slate-400'}`}
          >
            <span>{r.name}</span>
            <span className="text-xs opacity-60">{r.width}×{r.height}m</span>
          </div>
        ))}

        {selected && (
          <button
            onClick={deleteSelected}
            className="px-3 py-1 rounded-full text-sm bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30 transition-all"
          >
            Delete selected
          </button>
        )}

        {rooms.length > 0 && (
          <button
            onClick={() => { clearRooms(); setSelected(null); nameIdx.current = 0; }}
            className="px-3 py-1 rounded-full text-sm bg-slate-700/60 border border-slate-600 text-slate-400 hover:text-slate-200 transition-all ml-auto"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
