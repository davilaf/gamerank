import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  X,
  LayoutList,
  LayoutGrid,
  Table,
  Plus,
  ArrowUpDown,
  Filter,
  Flame,
} from 'lucide-react';
import { Game, TierLevel } from '../../types/game';
import { GameCard } from './GameCard';
import { TierBoardView } from './TierBoardView';
import { CompactTableView } from './CompactTableView';
import { TIERS_CONFIG } from '../../data/seedGames';

interface RankingListProps {
  games: Game[];
  onMoveUp: (gameId: string) => void;
  onMoveDown: (gameId: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onEdit: (game: Game) => void;
  onDelete: (gameId: string) => void;
  onOpenAddModal: () => void;
  defaultView?: 'list' | 'tiers' | 'compact';
}

export function RankingList({
  games,
  onMoveUp,
  onMoveDown,
  onReorder,
  onEdit,
  onDelete,
  onOpenAddModal,
  defaultView = 'list',
}: RankingListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<TierLevel | 'ALL'>('ALL');
  const [currentView, setCurrentView] = useState<'list' | 'tiers' | 'compact'>(defaultView);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Extraer géneros únicos con sus conteos
  const genreCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    games.forEach((game) => {
      game.genres.forEach((genre) => {
        counts[genre] = (counts[genre] || 0) + 1;
      });
    });
    // Ordenar géneros por frecuencia
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [games]);

  // Filtrado reactivo
  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      // Filtro por búsqueda de texto
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = game.title.toLowerCase().includes(query);
        const matchesPlatform = (game.platform || '').toLowerCase().includes(query);
        const matchesGenres = game.genres.some((g) => g.toLowerCase().includes(query));
        const matchesNotes = (game.notes || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesPlatform && !matchesGenres && !matchesNotes) {
          return false;
        }
      }

      // Filtro por género
      if (selectedGenre && !game.genres.includes(selectedGenre)) {
        return false;
      }

      // Filtro por Tier
      if (selectedTier !== 'ALL') {
        const tierConfig = TIERS_CONFIG[selectedTier];
        if (game.rank < tierConfig.minRank || game.rank > tierConfig.maxRank) {
          return false;
        }
      }

      return true;
    });
  }, [games, searchQuery, selectedGenre, selectedTier]);

  // Manejo de Drag and Drop
  const handleDragStart = (_e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, _index: number) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    // Si estamos en vista filtrada, mapear a los índices reales de la lista completa
    const draggedGame = filteredGames[draggedIndex];
    const targetGame = filteredGames[dropIndex];

    const realFromIndex = games.findIndex((g) => g.id === draggedGame.id);
    const realToIndex = games.findIndex((g) => g.id === targetGame.id);

    if (realFromIndex !== -1 && realToIndex !== -1) {
      onReorder(realFromIndex, realToIndex);
    }

    setDraggedIndex(null);
  };

  const hasActiveFilters = Boolean(searchQuery || selectedGenre || selectedTier !== 'ALL');

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedGenre(null);
    setSelectedTier('ALL');
  };

  return (
    <div className="space-y-6">
      {/* Barra de herramientas superior: Buscador, Vistas y Filtros */}
      <div className="bg-slate-900/80 p-4 sm:p-5 rounded-2xl border border-slate-800 backdrop-blur-md shadow-xl">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Buscador */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por título, plataforma, género o notas..."
              className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-950 border border-slate-700/80 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Selectores de vista y botón Añadir */}
          <div className="flex items-center gap-2 justify-between lg:justify-end">
            {/* Switcher de Vistas */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentView('list')}
                className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  currentView === 'list'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Vista de Lista Detallada"
              >
                <LayoutList className="w-4 h-4" />
                <span className="hidden sm:inline">Lista</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentView('tiers')}
                className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  currentView === 'tiers'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Vista de Tablero por Tiers"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Tiers</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentView('compact')}
                className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  currentView === 'compact'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Vista Compacta"
              >
                <Table className="w-4 h-4" />
                <span className="hidden sm:inline">Tabla</span>
              </button>
            </div>

            {/* Añadir juego */}
            <button
              type="button"
              onClick={onOpenAddModal}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-purple-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir</span>
            </button>
          </div>
        </div>

        {/* Selector de Tiers (Pestañas horizontales de Tiers) */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px] mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Tier:
          </span>
          <button
            type="button"
            onClick={() => setSelectedTier('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap ${
              selectedTier === 'ALL'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white bg-slate-950/60'
            }`}
          >
            Todos ({games.length})
          </button>
          {(['S', 'A', 'B', 'C', 'D'] as TierLevel[]).map((level) => {
            const config = TIERS_CONFIG[level];
            const isSelected = selectedTier === level;
            return (
              <button
                key={level}
                type="button"
                onClick={() => setSelectedTier(level)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? `${config.badgeBg} shadow-sm ring-1 ring-white/20`
                    : 'text-slate-400 hover:text-slate-200 bg-slate-950/60 border border-slate-800'
                }`}
              >
                <span>{config.name}</span>
              </button>
            );
          })}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="ml-auto text-[11px] text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 px-2 py-1 rounded bg-purple-950/40 border border-purple-500/30 whitespace-nowrap"
            >
              <X className="w-3 h-3" />
              Limpiar Filtros
            </button>
          )}
        </div>

        {/* Carousel / Lista horizontal de géneros más populares */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-thin">
          <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px] mr-1 flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-500" /> Géneros:
          </span>
          {genreCounts.slice(0, 12).map(({ name, count }) => {
            const isSelected = selectedGenre === name;
            return (
              <button
                key={name}
                type="button"
                onClick={() => setSelectedGenre(isSelected ? null : name)}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all whitespace-nowrap flex items-center gap-1 text-[11px] ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-sm ring-1 ring-purple-400'
                    : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <span>{name}</span>
                <span className="text-[10px] opacity-75 font-mono">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Resumen de resultados */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Mostrando <strong className="text-slate-200">{filteredGames.length}</strong> de{' '}
          <strong className="text-slate-200">{games.length}</strong> videojuegos terminados
        </span>
        {currentView === 'list' && !hasActiveFilters && (
          <span className="text-[11px] text-slate-500 italic hidden sm:block">
            Arrastra las tarjetas o usa las flechas para ajustar el orden correlativo
          </span>
        )}
      </div>

      {/* Renderizado según la vista activa */}
      {filteredGames.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
          <p className="text-slate-400 text-base font-medium">
            No se encontraron videojuegos que coincidan con tus filtros.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors inline-flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Restablecer filtros
          </button>
        </div>
      ) : currentView === 'tiers' ? (
        <TierBoardView
          games={filteredGames}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onEdit={onEdit}
          onSelectGenre={(g) => setSelectedGenre(g)}
        />
      ) : currentView === 'compact' ? (
        <CompactTableView
          games={filteredGames}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onEdit={onEdit}
          onDelete={onDelete}
          onSelectGenre={(g) => setSelectedGenre(g)}
        />
      ) : (
        <div className="space-y-3">
          {filteredGames.map((game, index) => (
            <GameCard
              key={game.id}
              game={game}
              index={index}
              totalGames={games.length}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              onEdit={onEdit}
              onDelete={onDelete}
              onSelectGenre={(g) => setSelectedGenre(g)}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              isDragging={draggedIndex === index}
            />
          ))}
        </div>
      )}
    </div>
  );
}
