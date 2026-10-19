import React, { useState, useEffect } from 'react';
import { X, Swords, Hash, Plus, Check, Sparkles } from 'lucide-react';
import { Game } from '../../types/game';
import { GameCover } from '../common/GameCover';
import { getCoverUrlForTitle } from '../../services/covers';

interface AddEditGameModalProps {
  isOpen: boolean;
  gameToEdit: Game | null;
  totalGames: number;
  onClose: () => void;
  onSaveManual: (game: Game, targetRank?: number) => void;
  onStartDuel: (gameData: Partial<Game>) => void;
}

const COMMON_GENRES = [
  'Soulslike',
  'Metroidvania',
  'Survival Horror',
  'Acción',
  'Aventura',
  'Plataformas',
  'Acción RPG',
  'Roguelite',
  'Hack and Slash',
  'Beat em up',
  'Sigilo',
  'Shooter',
  'Fantasía Oscura',
  'Mundo Abierto',
  'Terror',
  'Ciencia Ficción',
  'Puzles',
  'Deportes',
];

const COMMON_PLATFORMS = [
  'PC / PlayStation / Xbox',
  'PC / PlayStation 5 / Xbox Series',
  'PlayStation',
  'Nintendo Switch',
  'PC',
  'Xbox',
  'Multiplataforma',
];

export function AddEditGameModal({
  isOpen,
  gameToEdit,
  totalGames,
  onClose,
  onSaveManual,
  onStartDuel,
}: AddEditGameModalProps) {
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [newGenreInput, setNewGenreInput] = useState('');
  const [notes, setNotes] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [manualRank, setManualRank] = useState<number>(1);
  const [mode, setMode] = useState<'choose' | 'manual'>('choose');

  useEffect(() => {
    if (gameToEdit) {
      setTitle(gameToEdit.title);
      setPlatform(gameToEdit.platform || '');
      setGenres(gameToEdit.genres || []);
      setNotes(gameToEdit.notes || '');
      setCoverUrl(gameToEdit.coverUrl || getCoverUrlForTitle(gameToEdit.title) || '');
      setManualRank(gameToEdit.rank);
      setMode('manual');
    } else {
      setTitle('');
      setPlatform('Multiplataforma');
      setGenres(['Acción']);
      setNotes('');
      setCoverUrl('');
      setManualRank(totalGames + 1);
      setMode('choose');
    }
  }, [gameToEdit, totalGames, isOpen]);

  if (!isOpen) return null;

  const toggleGenre = (genre: string) => {
    if (genres.includes(genre)) {
      setGenres(genres.filter((g) => g !== genre));
    } else {
      setGenres([...genres, genre]);
    }
  };

  const handleAddCustomGenre = () => {
    if (newGenreInput.trim() && !genres.includes(newGenreInput.trim())) {
      setGenres([...genres, newGenreInput.trim()]);
      setNewGenreInput('');
    }
  };

  const handleLaunchDuel = () => {
    if (!title.trim()) return;
    onStartDuel({
      title: title.trim(),
      platform: platform.trim() || 'Multiplataforma',
      genres: genres.length > 0 ? genres : ['Acción'],
      notes: notes.trim(),
      coverUrl: coverUrl.trim() || getCoverUrlForTitle(title.trim()),
    });
  };

  const handleSaveDirect = () => {
    if (!title.trim()) return;
    const finalGame: Game = {
      id: gameToEdit ? gameToEdit.id : `game-${Date.now()}`,
      rank: gameToEdit ? gameToEdit.rank : manualRank,
      title: title.trim(),
      platform: platform.trim() || 'Multiplataforma',
      genres: genres.length > 0 ? genres : ['Acción'],
      notes: notes.trim(),
      coverUrl: coverUrl.trim() || getCoverUrlForTitle(title.trim()),
      finishedDate: gameToEdit?.finishedDate || new Date().toISOString().split('T')[0],
    };
    onSaveManual(finalGame, gameToEdit ? undefined : manualRank);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <h3 className="text-lg font-bold text-white">
            {gameToEdit ? `Editar: ${gameToEdit.title}` : 'Añadir Nuevo Juego Terminado'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <div className="p-6 space-y-4 text-xs sm:text-sm">
          {/* Título */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
              Título del Videojuego *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ej. Lies of P, Armored Core VI, Blasphemous 2..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              autoFocus
            />
          </div>

          {/* Carátula / Portada con vista previa */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase text-slate-400">
                Carátula / Portada (Thumbnail)
              </label>
              <button
                type="button"
                onClick={() => {
                  const auto = getCoverUrlForTitle(title);
                  if (auto) setCoverUrl(auto);
                }}
                className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                Buscar carátula automática
              </button>
            </div>
            <div className="flex gap-3 items-center p-2 rounded-xl bg-slate-950 border border-slate-800">
              <GameCover
                title={title || 'Juego'}
                coverUrl={coverUrl || getCoverUrlForTitle(title)}
                size="sm"
                rounded="rounded-lg"
              />
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="https://... o clic en Buscar carátula automática"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 text-xs font-mono truncate"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Se detecta automáticamente por el título (o puedes pegar cualquier URL de imagen)
                </span>
              </div>
            </div>
          </div>

          {/* Plataforma */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
              Plataforma
            </label>
            <input
              type="text"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              placeholder="ej. PC / PS5, Nintendo Switch, etc."
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs"
            />
            {/* Sugerencias de plataforma */}
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {COMMON_PLATFORMS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlatform(p)}
                  className={`text-[10px] px-2 py-0.5 rounded font-medium transition-colors ${
                    platform === p
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Géneros / Tags */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
              Géneros y Etiquetas
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-slate-950 rounded-xl border border-slate-800">
              {COMMON_GENRES.map((genre) => {
                const isSelected = genres.includes(genre);
                return (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => toggleGenre(genre)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                      isSelected
                        ? 'bg-purple-600 text-white shadow-sm ring-1 ring-purple-400'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{genre}</span>
                  </button>
                );
              })}
            </div>

            {/* Añadir género personalizado */}
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={newGenreInput}
                onChange={(e) => setNewGenreInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomGenre();
                  }
                }}
                placeholder="Añadir otro género personalizado..."
                className="flex-1 px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={handleAddCustomGenre}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
              >
                + Añadir
              </button>
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
              Impresiones / Notas personales
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="¿Qué te pareció? ¿Cuál fue tu jefe favorito o momento cumbre?"
              rows={2}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs"
            />
          </div>

          {/* Si es edición o modo manual: selector de puesto */}
          {(gameToEdit || mode === 'manual') && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Posición en el Ranking</span>
                <span className="text-[11px] text-slate-400">
                  Entre el 1 y el {gameToEdit ? totalGames : totalGames + 1}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-purple-400">#</span>
                <input
                  type="number"
                  min={1}
                  max={gameToEdit ? totalGames : totalGames + 1}
                  value={manualRank}
                  onChange={(e) => setManualRank(parseInt(e.target.value) || 1)}
                  className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-white font-black text-center focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Acciones del pie */}
        <div className="p-5 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-end gap-2.5">
          {!gameToEdit && mode === 'choose' ? (
            <>
              <button
                type="button"
                onClick={() => setMode('manual')}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <Hash className="w-3.5 h-3.5" />
                <span>Puesto manual</span>
              </button>

              <button
                type="button"
                disabled={!title.trim()}
                onClick={handleLaunchDuel}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
              >
                <Swords className="w-4 h-4 animate-pulse" />
                <span>⚔️ Iniciar Duelos 1 vs 1 (Recomendado)</span>
              </button>
            </>
          ) : (
            <>
              {!gameToEdit && (
                <button
                  type="button"
                  onClick={() => setMode('choose')}
                  className="w-full sm:w-auto px-3 py-2 text-xs text-slate-400 hover:text-slate-200"
                >
                  Volver al modo Duelos
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={!title.trim()}
                onClick={handleSaveDirect}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-40"
              >
                {gameToEdit ? 'Guardar Cambios' : `Insertar en el Puesto #${manualRank}`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
