import React from 'react';
import { Gamepad2, Trophy, Compass, BarChart3, Plus, Download, Settings, Sparkles, Cloud } from 'lucide-react';

interface HeaderProps {
  activeTab: 'ranking' | 'recommendations' | 'stats';
  totalGames: number;
  recommendationsCount: number;
  onTabChange: (tab: 'ranking' | 'recommendations' | 'stats') => void;
  onOpenAddModal: () => void;
  onOpenExportModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenSyncModal: () => void;
  isCloudSyncing?: boolean;
}

export function Header({
  activeTab,
  totalGames,
  recommendationsCount,
  onTabChange,
  onOpenAddModal,
  onOpenExportModal,
  onOpenSettingsModal,
  onOpenSyncModal,
  isCloudSyncing,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800 shadow-xl shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          {/* Logo & título */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onTabChange('ranking')}>
            <div className="relative p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 text-white shadow-lg shadow-purple-600/30">
              <Gamepad2 className="w-6 h-6" />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full border-2 border-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-purple-300">
                  GameRank
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {totalGames} Terminados
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden md:block">
                Ranking personal correlativo & Sistema de Duelos 1v1
              </p>
            </div>
          </div>

          {/* Selector de pestañas para escritorio */}
          <nav className="hidden md:flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => onTabChange('ranking')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'ranking'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Ranking</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('recommendations')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all relative ${
                activeTab === 'recommendations'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Recomendaciones</span>
              {recommendationsCount > 0 && (
                <span className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-cyan-400 text-slate-950">
                  <Sparkles className="w-2.5 h-2.5" />
                  {recommendationsCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => onTabChange('stats')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'stats'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Estadísticas</span>
            </button>
          </nav>

          {/* Acciones principales */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenAddModal}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">+ Añadir Juego</span>
              <span className="sm:hidden">Añadir</span>
            </button>

            <button
              type="button"
              onClick={onOpenSyncModal}
              className={`p-2 sm:px-3 sm:py-2 border rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                isCloudSyncing
                  ? 'bg-purple-950/60 text-purple-300 border-purple-500/50 animate-pulse'
                  : 'bg-slate-900 hover:bg-slate-800 text-purple-400 hover:text-purple-300 border-purple-500/30'
              }`}
              title="Sincronización en la Nube (PC y Celular)"
            >
              <Cloud className={`w-4 h-4 ${isCloudSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden lg:inline">Nube</span>
            </button>

            <button
              type="button"
              onClick={onOpenExportModal}
              className="p-2 sm:px-3 sm:py-2 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
              title="Exportar a Excel / CSV o Restaurar Copia"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span className="hidden md:inline">Exportar / Copia</span>
            </button>

            <button
              type="button"
              onClick={onOpenSettingsModal}
              className="p-2 text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors"
              title="Configuración y APIs"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
