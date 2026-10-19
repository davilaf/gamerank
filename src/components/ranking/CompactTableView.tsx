import React from 'react';
import { ChevronUp, ChevronDown, Pencil, Trash2 } from 'lucide-react';
import { Game } from '../../types/game';
import { getTierForRank } from '../../data/seedGames';
import { GameCover } from '../common/GameCover';

interface CompactTableViewProps {
  games: Game[];
  onMoveUp: (gameId: string) => void;
  onMoveDown: (gameId: string) => void;
  onEdit: (game: Game) => void;
  onDelete: (gameId: string) => void;
  onSelectGenre?: (genre: string) => void;
}

export function CompactTableView({
  games,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
  onSelectGenre,
}: CompactTableViewProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-sm">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800">
          <tr>
            <th className="py-3 px-3 w-16 text-center">Puesto</th>
            <th className="py-3 px-2 w-16 text-center">Tier</th>
            <th className="py-3 px-2 w-12 text-center">Portada</th>
            <th className="py-3 px-4">Título</th>
            <th className="py-3 px-4 hidden sm:table-cell">Plataforma</th>
            <th className="py-3 px-4">Géneros</th>
            <th className="py-3 px-4 hidden md:table-cell">Notas</th>
            <th className="py-3 px-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 font-medium">
          {games.map((game) => {
            const tier = getTierForRank(game.rank);
            const isTop3 = game.rank <= 3;
            const isTop10 = game.rank <= 10;

            return (
              <tr
                key={game.id}
                className="hover:bg-slate-800/50 transition-colors group"
              >
                {/* Puesto */}
                <td className="py-2.5 px-3 text-center">
                  <span
                    className={`inline-flex items-center justify-center font-black w-8 h-8 rounded-lg text-xs ${
                      isTop3
                        ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                        : isTop10
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : tier.level === 'A'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    #{game.rank}
                  </span>
                </td>

                {/* Tier */}
                <td className="py-2.5 px-2 text-center">
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-black ${tier.badgeBg}`}
                  >
                    {tier.level}
                  </span>
                </td>

                {/* Portada Thumbnail */}
                <td className="py-2 px-2 text-center">
                  <div className="flex justify-center">
                    <GameCover
                      title={game.title}
                      coverUrl={game.coverUrl}
                      size="xs"
                      rounded="rounded-md"
                    />
                  </div>
                </td>

                {/* Título */}
                <td className="py-2.5 px-4 font-bold text-slate-100 group-hover:text-purple-300">
                  {game.title}
                </td>

                {/* Plataforma */}
                <td className="py-2.5 px-4 text-slate-400 hidden sm:table-cell text-[11px]">
                  {game.platform || 'Multiplataforma'}
                </td>

                {/* Géneros */}
                <td className="py-2.5 px-4">
                  <div className="flex flex-wrap gap-1">
                    {game.genres.map((g) => (
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
                </td>

                {/* Notas */}
                <td className="py-2.5 px-4 text-slate-400 text-[11px] italic hidden md:table-cell max-w-xs truncate">
                  {game.notes ? `"${game.notes}"` : '-'}
                </td>

                {/* Acciones */}
                <td className="py-2.5 px-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      disabled={game.rank <= 1}
                      onClick={() => onMoveUp(game.id)}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-20 transition-colors"
                      title="Subir"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={game.rank >= games.length}
                      onClick={() => onMoveDown(game.id)}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-20 transition-colors"
                      title="Bajar"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(game)}
                      className="p-1 text-slate-400 hover:text-purple-300 transition-colors"
                      title="Editar"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(game.id)}
                      className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
