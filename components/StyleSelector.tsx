'use client';
import { useStore } from '@/store/useStore';
import { DESIGN_STYLES } from '@/lib/designStyles';
import { StyleId } from '@/types';

export default function StyleSelector() {
  const { styleId, setStyle } = useStore();

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Design Style</h3>
      <div className="grid grid-cols-1 gap-2">
        {DESIGN_STYLES.map((style) => {
          const active = style.id === styleId;
          return (
            <button
              key={style.id}
              onClick={() => setStyle(style.id as StyleId)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all
                ${active
                  ? 'bg-blue-500/20 border-blue-400/60 shadow-lg shadow-blue-500/10'
                  : 'bg-slate-800/60 border-slate-700 hover:border-slate-500 hover:bg-slate-800'}`}
            >
              {/* Colour swatches */}
              <div className="flex gap-1 shrink-0">
                {[style.wallColor, style.floorColor, style.accentColor].map((c, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-full border border-white/10"
                    style={{ background: c }}
                  />
                ))}
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-medium ${active ? 'text-blue-300' : 'text-slate-200'}`}>
                  {style.name}
                </p>
                <p className="text-xs text-slate-500 truncate">{style.description}</p>
              </div>
              {active && (
                <div className="ml-auto shrink-0 w-2 h-2 rounded-full bg-blue-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
