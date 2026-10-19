import React from 'react';
import { Crown, Gem, Shield, Star, Check, ChevronUp, ChevronDown, Pencil } from 'lucide-react';
import { Game, TierLevel } from '../../types/game';
import { TIERS_CONFIG } from '../../data/seedGames';
import { GameCover } from '../common/GameCover';

interface TierBoardViewProps {
  games: Game[];
  onMoveUp: (gameId: string) => void;
  onMoveDown: (gameId: string) => void;
  onEdit: (game: Game) => void;
  onSelectGenre?: (genre: string) => void;
}

export function TierBoardView({
  games,
  onMoveUp,
  onMoveDown,
  onEdit,
  onSelectGenre,
}: TierBoardViewProps) {
  const tiers: TierLevel[] = ['S', 'A', 'B', 'C', 'D'];

  const getTierIcon = (level: TierLevel) => {
    switch (level) {
      case 'S':
        return <Crown className="w-5 h-5 text-amber-400" />;
      case 'A':
        return <Gem className="w-5 h-5 text-purple-400" />;
      case 'B':
        return <Shield className="w-5 h-5 text-blue-400" />;
      case 'C':
        return <Star className="w-5 h-5 text-emerald-400" />;
      default:
        return <Check className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {tiers.map((tierLevel) => {
        const tierInfo = TIERS_CONFIG[tierLevel];
        const tierGames = games.filter(
          (g) => g.rank >= tierInfo.minRank && g.rank <= tierInfo.maxRank
        );

        if (tierGames.length === 0) return null;

        return (
          <div
            key={tierLevel}
            className="rounded-2xl border overflow-hidden bg-slate-900/60 backdrop-blur-sm"
            style={{ borderColor: tierInfo.borderColor }}
          >
            {/* Cabecera del Tier */}
            <div
              className="px-5 py-3.5 flex flex-wrap items-center justify-between gap-2 border-b"
              style={{
                backgroundColor: tierInfo.bgColor,
                borderColor: tierInfo.borderColor,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-lg ${tierInfo.badgeBg}`}
                >
                  {tierLevel}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white flex items-center gap-1.5">
                      {getTierIcon(tierLevel)}
                      {tierInfo.name}
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-900/80 text-slate-300 font-bold border border-slate-700">
                      {tierGames.length} juegos
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">{tierInfo.description}</p>
                </div>
              </div>
            </div>

            {/* Grid de juegos en este Tier */}
            <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {tierGames.map((game) => (
                <div
                  key={game.id}
                  className="group relative p-3 rounded-xl bg-slate-850/90 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 transition-all flex gap-3 items-center justify-between"
                >
                  <GameCover
                    title={game.title}
                    coverUrl={game.coverUrl}
                    size="sm"
                    rounded="rounded-lg"
                    className="shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs flex-shrink-0 ${
                            game.rank <= 3
                              ? 'bg-amber-400 text-slate-950 shadow-sm'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          #{game.rank}
                        </span>
                        <h4 className="text-sm font-bold text-slate-100 group-hover:text-purple-300 truncate">
                          {game.title}
                        </h4>
                      </div>

                      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => onMoveUp(game.id)}
                          disabled={game.rank <= 1}
                          className="p-1 text-slate-400 hover:text-white disabled:opacity-20"
                          title="Subir"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onMoveDown(game.id)}
                          disabled={game.rank >= games.length}
                          className="p-1 text-slate-400 hover:text-white disabled:opacity-20"
                          title="Bajar"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEdit(game)}
                          className="p-1 text-slate-400 hover:text-purple-300"
                          title="Editar"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {game.genres.slice(0, 3).map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => onSelectGenre?.(g)}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-purple-900/40 hover:text-purple-200 transition-colors"
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  {game.notes && (
                    <p className="mt-2 text-[11px] text-slate-400 italic line-clamp-1 border-t border-slate-800/60 pt-1.5">
                      "{game.notes}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
