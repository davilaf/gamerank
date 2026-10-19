import React from 'react';
import { Trophy, Compass, Plus, BarChart3, Download, Sparkles, Cloud } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'ranking' | 'recommendations' | 'stats';
  recommendationsCount: number;
  onTabChange: (tab: 'ranking' | 'recommendations' | 'stats') => void;
  onOpenAddModal: () => void;
  onOpenExportModal: () => void;
  onOpenSyncModal: () => void;
  isCloudSyncing?: boolean;
}

export function BottomNav({
  activeTab,
  recommendationsCount,
  onTabChange,
  onOpenAddModal,
  onOpenExportModal,
  onOpenSyncModal,
  isCloudSyncing,
}: BottomNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 px-2 py-2 safe-area-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {/* Pestaña Ranking */}
        <button
          type="button"
          onClick={() => onTabChange('ranking')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all ${
            activeTab === 'ranking'
              ? 'text-purple-400 font-extrabold scale-105'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <Trophy className={`w-5 h-5 ${activeTab === 'ranking' ? 'text-purple-400 fill-purple-400/20' : ''}`} />
          <span className="text-[10px] tracking-tight">Ranking</span>
        </button>

        {/* Pestaña Recomendaciones */}
        <button
          type="button"
          onClick={() => onTabChange('recommendations')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all relative ${
            activeTab === 'recommendations'
              ? 'text-purple-400 font-extrabold scale-105'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <div className="relative">
            <Compass className={`w-5 h-5 ${activeTab === 'recommendations' ? 'text-purple-400 fill-purple-400/20' : ''}`} />
            {recommendationsCount > 0 && (
              <span className="absolute -top-1 -right-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-cyan-400 text-[8px] font-black text-slate-950">
                {recommendationsCount > 9 ? '9+' : recommendationsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Sugeridos</span>
        </button>

        {/* Botón Central: + Añadir */}
        <button
          type="button"
          onClick={onOpenAddModal}
          className="flex flex-col items-center -mt-5 cursor-pointer group"
          title="Añadir nuevo juego"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 text-white flex items-center justify-center shadow-lg shadow-purple-600/40 group-active:scale-95 transition-transform border-2 border-slate-950">
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-[9px] font-extrabold text-purple-300 mt-0.5">Añadir</span>
        </button>

        {/* Sincronización en la Nube */}
        <button
          type="button"
          onClick={onOpenSyncModal}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all ${
            isCloudSyncing ? 'text-purple-300 animate-pulse' : 'text-purple-400 hover:text-purple-300 font-medium'
          }`}
          title="Sincronizar con la nube"
        >
          <Cloud className={`w-5 h-5 ${isCloudSyncing ? 'animate-spin' : ''}`} />
          <span className="text-[10px] tracking-tight">Nube</span>
        </button>

        {/* Pestaña Estadísticas */}
        <button
          type="button"
          onClick={() => onTabChange('stats')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all ${
            activeTab === 'stats'
              ? 'text-purple-400 font-extrabold scale-105'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Stats</span>
        </button>
      </div>
    </nav>
  );
}
