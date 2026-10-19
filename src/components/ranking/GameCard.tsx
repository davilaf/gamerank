import React, { useState } from 'react';
import {
  Trophy,
  Crown,
  Gem,
  Shield,
  Star,
  ChevronUp,
  ChevronDown,
  Pencil,
  Trash2,
  GripVertical,
  Monitor,
  Gamepad,
  MessageSquareQuote,
  Check,
} from 'lucide-react';
import { Game } from '../../types/game';
import { getTierForRank } from '../../data/seedGames';
import { GameCover } from '../common/GameCover';

interface GameCardProps {
  game: Game;
  totalGames: number;
  onMoveUp: (gameId: string) => void;
  onMoveDown: (gameId: string) => void;
  onEdit: (game: Game) => void;
  onDelete: (gameId: string) => void;
  onSelectGenre?: (genre: string) => void;
  onDragStart?: (e: React.DragEvent, index: number) => void;
  onDragOver?: (e: React.DragEvent, index: number) => void;
  onDrop?: (e: React.DragEvent, index: number) => void;
  index: number;
  isDragging?: boolean;
}

export function GameCard({
  game,
  totalGames,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
  onSelectGenre,
  onDragStart,
  onDragOver,
  onDrop,
  index,
  isDragging,
}: GameCardProps) {
  const [showFullNotes, setShowFullNotes] = useState(false);
  const tier = getTierForRank(game.rank);

  // Icono según Tier
  const renderTierIcon = () => {
    switch (tier.level) {
      case 'S':
        return <Crown className="w-4 h-4 text-amber-400" />;
      case 'A':
        return <Gem className="w-4 h-4 text-purple-400" />;
      case 'B':
        return <Shield className="w-4 h-4 text-blue-400" />;
      case 'C':
        return <Star className="w-4 h-4 text-emerald-400" />;
      default:
        return <Check className="w-4 h-4 text-slate-400" />;
    }
  };

  const isTop10 = game.rank <= 10;
  const isTop3 = game.rank <= 3;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart?.(e, index)}
      onDragOver={(e) => onDragOver?.(e, index)}
      onDrop={(e) => onDrop?.(e, index)}
      className={`group relative rounded-2xl transition-all duration-200 border ${
        isTop10
          ? 'bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20 border-amber-500/40 hover:border-amber-400 shadow-lg shadow-amber-950/30'
          : tier.level === 'A'
          ? 'bg-slate-900/90 border-purple-500/30 hover:border-purple-400/70 shadow-md shadow-purple-950/20'
          : tier.level === 'B'
          ? 'bg-slate-900/80 border-blue-500/25 hover:border-blue-400/60'
          : tier.level === 'C'
          ? 'bg-slate-900/70 border-emerald-500/20 hover:border-emerald-400/50'
          : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
      } ${isDragging ? 'opacity-40 scale-95 border-dashed border-purple-400' : ''} p-4 sm:p-5`}
      style={{
        boxShadow: isTop3 ? '0 0 25px rgba(245, 158, 11, 0.15)' : undefined,
      }}
    >
      <div className="flex items-start sm:items-center justify-between gap-3 sm:gap-4">
        {/* Lado izquierdo: Drag Handle, Posición numérica y Badge de Tier */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Manija de arrastre */}
          <div
            className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-300 p-1 rounded transition-colors hidden sm:block"
            title="Arrastra para reordenar"
          >
            <GripVertical className="w-5 h-5" />
          </div>

          {/* Medalla de posición */}
          <div
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex flex-col items-center justify-center font-black transition-transform group-hover:scale-105 ${
              isTop3
                ? 'bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 text-slate-950 shadow-md shadow-amber-500/40 ring-2 ring-amber-300/60'
                : isTop10
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : tier.level === 'A'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : tier.level === 'B'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : tier.level === 'C'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}
          >
            <span className="text-[10px] uppercase font-bold opacity-80 leading-none">#</span>
            <span className="text-xl sm:text-2xl leading-none">{game.rank}</span>
          </div>

          {/* Insignia de Tier */}
          <div className="hidden lg:flex flex-col items-start">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider font-extrabold ${
                isTop10
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : tier.level === 'A'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : tier.level === 'B'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : tier.level === 'C'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {renderTierIcon()}
              {tier.level}-Tier
            </span>
          </div>
        </div>

        {/* Portada / Thumbnail del videojuego */}
        <GameCover
          title={game.title}
          coverUrl={game.coverUrl}
          size="md"
          className="transition-transform duration-300 group-hover:scale-105 group-hover:shadow-purple-500/20 shadow-md"
        />

        {/* Centro: Título, Plataforma, Géneros y Notas */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={`text-base sm:text-lg font-black truncate transition-colors ${
                isTop10
                  ? 'text-white group-hover:text-amber-300'
                  : 'text-slate-100 group-hover:text-purple-300'
              }`}
            >
              {game.title}
            </h3>

            {/* Plataforma */}
            {game.platform && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700/60">
                <Gamepad className="w-3 h-3 text-cyan-400" />
                {game.platform}
              </span>
            )}
          </div>

          {/* Chips de géneros */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {game.genres.map((genre) => (
              <button
                key={genre}
                type="button"
                onClick={() => onSelectGenre?.(genre)}
                className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-800/90 hover:bg-purple-900/40 text-slate-300 hover:text-purple-200 border border-slate-700/60 hover:border-purple-500/40 transition-colors"
                title={`Filtrar por ${genre}`}
              >
                {genre}
              </button>
            ))}
          </div>

          {/* Notas personales / impresiones */}
          {game.notes && (
            <div className="mt-2 text-xs text-slate-400 flex items-start gap-1.5 bg-slate-950/40 px-2.5 py-1.5 rounded-lg border border-slate-800/60">
              <MessageSquareQuote className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
              <p className={showFullNotes ? '' : 'line-clamp-1'}>
                {game.notes}
              </p>
              {game.notes.length > 80 && (
                <button
                  type="button"
                  onClick={() => setShowFullNotes(!showFullNotes)}
                  className="text-[11px] text-purple-400 hover:text-purple-300 ml-auto flex-shrink-0 font-medium underline"
                >
                  {showFullNotes ? 'Menos' : 'Más'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Lado derecho: Controles manuales (subir, bajar, editar, borrar) */}
        <div className="flex flex-col sm:flex-row items-center gap-1 flex-shrink-0">
          {/* Subir puesto (-1 rank) */}
          <button
            type="button"
            disabled={game.rank <= 1}
            onClick={() => onMoveUp(game.id)}
            className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
            title="Subir 1 posición (#1 más cerca)"
          >
            <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Bajar puesto (+1 rank) */}
          <button
            type="button"
            disabled={game.rank >= totalGames}
            onClick={() => onMoveDown(game.id)}
            className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
            title="Bajar 1 posición"
          >
            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Editar */}
          <button
            type="button"
            onClick={() => onEdit(game)}
            className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-purple-300 hover:bg-purple-950/40 transition-colors"
            title="Editar notas o detalles"
          >
            <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Eliminar */}
          <button
            type="button"
            onClick={() => onDelete(game.id)}
            className="p-1.5 sm:p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
            title="Eliminar de mi ranking"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
