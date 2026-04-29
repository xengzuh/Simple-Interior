'use client';
import dynamic from 'next/dynamic';
import { useStore } from '@/store/useStore';
import FloorPlanCanvas from '@/components/FloorPlanCanvas';
import StyleSelector from '@/components/StyleSelector';
import FurnitureCatalog from '@/components/FurnitureCatalog';

// Lazy-load 3D scene (avoids SSR issues with Three.js)
const Scene3D = dynamic(() => import('@/components/Scene3D'), { ssr: false });

export default function Home() {
  const { view, setView, rooms, selections, generate, furniture } = useStore();

  const totalSelections = selections.reduce((s, sel) => s + sel.quantity, 0);
  const canGenerate = rooms.length > 0 && totalSelections > 0;

  return (
    <div className="h-screen flex flex-col bg-[#0f1117] overflow-hidden">
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏠</span>
          <div>
            <h1 className="text-lg font-bold text-white leading-none">RoomCraft</h1>
            <p className="text-xs text-slate-500 leading-none mt-0.5">3D Interior Designer</p>
          </div>
        </div>

        {/* View switcher */}
        <div className="flex items-center gap-1 bg-slate-800 rounded-xl p-1">
          <button
            onClick={() => setView('2d')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all
              ${view === '2d'
                ? 'bg-slate-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'}`}
          >
            ✏️ Floor Plan
          </button>
          <button
            onClick={() => setView('3d')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all
              ${view === '3d'
                ? 'bg-slate-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'}`}
          >
            🧊 3D View
          </button>
        </div>

        {/* Generate button */}
        <button
          onClick={generate}
          disabled={!canGenerate}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl font-semibold text-sm transition-all
            ${canGenerate
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-400 hover:to-indigo-500 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-95'
              : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
        >
          <span>✨</span>
          <span>{furniture.length > 0 ? 'Re-generate' : 'Generate Design'}</span>
        </button>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <aside className="w-64 shrink-0 flex flex-col gap-4 p-4 border-r border-slate-800 overflow-y-auto">
          <StyleSelector />
          <div className="border-t border-slate-800" />
          <FurnitureCatalog />
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 overflow-hidden flex flex-col gap-4">
          {/* Step hints */}
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <Step n={1} done={rooms.length > 0} label="Draw rooms" />
            <div className="flex-1 h-px bg-slate-800" />
            <Step n={2} done={totalSelections > 0} label="Pick furniture" />
            <div className="flex-1 h-px bg-slate-800" />
            <Step n={3} done={false} label="Choose style" />
            <div className="flex-1 h-px bg-slate-800" />
            <Step n={4} done={furniture.length > 0} label="Generate!" />
          </div>

          {/* View area */}
          <div className="flex-1 min-h-0">
            {view === '2d' ? (
              <div className="h-full overflow-auto">
                <FloorPlanCanvas />
              </div>
            ) : (
              <div className="h-full">
                <Scene3D />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function Step({ n, done, label }: { n: number; done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0
        ${done ? 'bg-green-500 text-white' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
        {done ? '✓' : n}
      </div>
      <span className={done ? 'text-green-400' : 'text-slate-500'}>{label}</span>
    </div>
  );
}
