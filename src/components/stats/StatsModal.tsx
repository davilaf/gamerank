import React from 'react';
import { X, BarChart3, Trophy, Flame, Gamepad2, Award } from 'lucide-react';
import { Game } from '../../types/game';
import { TIERS_CONFIG } from '../../data/seedGames';

interface StatsModalProps {
  isOpen: boolean;
  games: Game[];
  onClose: () => void;
}

export function StatsModal({ isOpen, games, onClose }: StatsModalProps) {
  if (!isOpen) return null;

  // Conteo de géneros
  const genreCounts: Record<string, number> = {};
  games.forEach((game) => {
    game.genres.forEach((genre) => {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });
  });

  const sortedGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Conteo por Tier
  const tierCounts = {
    S: games.filter((g) => g.rank >= TIERS_CONFIG.S.minRank && g.rank <= TIERS_CONFIG.S.maxRank).length,
    A: games.filter((g) => g.rank >= TIERS_CONFIG.A.minRank && g.rank <= TIERS_CONFIG.A.maxRank).length,
    B: games.filter((g) => g.rank >= TIERS_CONFIG.B.minRank && g.rank <= TIERS_CONFIG.B.maxRank).length,
    C: games.filter((g) => g.rank >= TIERS_CONFIG.C.minRank && g.rank <= TIERS_CONFIG.C.maxRank).length,
    D: games.filter((g) => g.rank >= TIERS_CONFIG.D.minRank && g.rank <= TIERS_CONFIG.D.maxRank).length,
  };

  // Detección de sagas destacadas
  const franchises = [
    { name: 'Dark Souls / FromSoft', count: games.filter((g) => /dark souls|sekiro|elden ring|bloodborne/i.test(g.title)).length },
    { name: 'Resident Evil', count: games.filter((g) => /resident evil/i.test(g.title)).length },
    { name: 'Batman Arkham', count: games.filter((g) => /batman/i.test(g.title)).length },
    { name: 'Gears of War', count: games.filter((g) => /gears of war/i.test(g.title)).length },
    { name: 'Marvel', count: games.filter((g) => /marvel/i.test(g.title)).length },
  ].filter((f) => f.count > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-bold text-white">Estadísticas y Análisis de tu Perfil Gamer</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6 text-xs sm:text-sm max-h-[80vh] overflow-y-auto">
          {/* Tarjetas resumen */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Total Juegos</span>
              <div className="text-2xl font-black text-white mt-1">{games.length}</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 text-center">
              <span className="text-[10px] text-amber-400 uppercase font-bold">S-Tier (Top 10)</span>
              <div className="text-2xl font-black text-amber-400 mt-1">{tierCounts.S}</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/30 text-center">
              <span className="text-[10px] text-purple-400 uppercase font-bold">A-Tier (Top 11-25)</span>
              <div className="text-2xl font-black text-purple-400 mt-1">{tierCounts.A}</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-blue-500/30 text-center">
              <span className="text-[10px] text-blue-400 uppercase font-bold">B-Tier (26-50)</span>
              <div className="text-2xl font-black text-blue-400 mt-1">{tierCounts.B}</div>
            </div>
          </div>

          {/* Distribución por Tiers */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              Distribución por Tiers
            </h4>
            <div className="space-y-2">
              {[
                { level: 'S', name: 'S-Tier (Top 10)', count: tierCounts.S, color: 'bg-amber-500' },
                { level: 'A', name: 'A-Tier (Top 11-25)', count: tierCounts.A, color: 'bg-purple-500' },
                { level: 'B', name: 'B-Tier (26-50)', count: tierCounts.B, color: 'bg-blue-500' },
                { level: 'C', name: 'C-Tier (51-75)', count: tierCounts.C, color: 'bg-emerald-500' },
                { level: 'D', name: 'D-Tier (76+)', count: tierCounts.D, color: 'bg-slate-600' },
              ].map((t) => {
                const percent = Math.round((t.count / games.length) * 100);
                return (
                  <div key={t.level} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-semibold">{t.name}</span>
                      <span className="text-slate-400 font-mono">
                        {t.count} juegos ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${t.color} rounded-full transition-all duration-500`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top 10 Géneros Predilectos */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-purple-400" />
              Top 10 Géneros con más títulos
            </h4>
            <div className="space-y-2.5">
              {sortedGenres.map(([genre, count]) => {
                const percent = Math.round((count / games.length) * 100);
                return (
                  <div key={genre} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-200 font-semibold">{genre}</span>
                      <span className="text-purple-300 font-mono font-bold">
                        {count} juegos
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full"
                        style={{ width: `${Math.min(100, (count / sortedGenres[0][1]) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sagas más representadas */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Gamepad2 className="w-4 h-4 text-cyan-400" />
              Sagas y Franquicias Más Jugadas
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
              {franchises.map((fr) => (
                <div key={fr.name} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
                  <div className="text-xs font-bold text-slate-200">{fr.name}</div>
                  <div className="text-sm font-extrabold text-cyan-400 mt-0.5">{fr.count} entregas</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
