'use client';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { FURNITURE_CATALOG, CATEGORY_LABELS } from '@/lib/furnitureCatalog';
import { FurnitureType, FurnitureSelection } from '@/types';

export default function FurnitureCatalog() {
  const { selections, setSelections } = useStore();
  const [activeCategory, setActiveCategory] = useState<string>('living');

  const categories = Array.from(new Set(FURNITURE_CATALOG.map((f) => f.category)));

  const getQty = (type: FurnitureType) =>
    selections.find((s) => s.type === type)?.quantity ?? 0;

  const setQty = (type: FurnitureType, qty: number) => {
    if (qty <= 0) {
      setSelections(selections.filter((s) => s.type !== type));
    } else {
      const existing = selections.find((s) => s.type === type);
      if (existing) {
        setSelections(selections.map((s) => s.type === type ? { ...s, quantity: qty } : s));
      } else {
        setSelections([...selections, { type, quantity: qty }]);
      }
    }
  };

  const totalPieces = selections.reduce((s, sel) => s + sel.quantity, 0);

  const filtered = FURNITURE_CATALOG.filter((f) => f.category === activeCategory);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Furniture</h3>
        {totalPieces > 0 && (
          <span className="text-xs text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded-full">
            {totalPieces} selected
          </span>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all
              ${activeCategory === cat
                ? 'bg-blue-500/30 text-blue-300 border border-blue-400/40'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200'}`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="flex flex-col gap-1.5">
        {filtered.map((item) => {
          const qty = getQty(item.type);
          return (
            <div
              key={item.type}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl border transition-all
                ${qty > 0
                  ? 'bg-blue-500/10 border-blue-400/30'
                  : 'bg-slate-800/60 border-slate-700'}`}
            >
              <span className="text-xl">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200">{item.label}</p>
                <p className="text-xs text-slate-500">{item.size[0]}m × {item.size[1]}m</p>
              </div>
              {/* Quantity controls */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setQty(item.type, qty - 1)}
                  disabled={qty === 0}
                  className="w-6 h-6 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200 text-sm flex items-center justify-center transition-all"
                >
                  −
                </button>
                <span className={`w-5 text-center text-sm font-medium ${qty > 0 ? 'text-blue-300' : 'text-slate-500'}`}>
                  {qty}
                </span>
                <button
                  onClick={() => setQty(item.type, qty + 1)}
                  className="w-6 h-6 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm flex items-center justify-center transition-all"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
