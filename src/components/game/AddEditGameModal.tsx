import React, { useState, useEffect } from 'react';
import { X, Swords, Hash, Plus, Check, Sparkles, Dices, Wand2, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Game } from '../../types/game';
import { GameCover } from '../common/GameCover';
import { getCoverUrlForTitle } from '../../services/covers';
import {
  searchGameCoverAndInfo,
  generateSmartImpressions,
  POPULAR_SUGGESTED_GAMES,
} from '../../services/gameSearch';

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

  // Estados de retroalimentación para botones automáticos
  const [isSearchingCover, setIsSearchingCover] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  useEffect(() => {
    if (gameToEdit) {
      setTitle(gameToEdit.title);
      setPlatform(gameToEdit.platform || '');
      setGenres(gameToEdit.genres || []);
      setNotes(gameToEdit.notes || '');
      setCoverUrl(gameToEdit.coverUrl || getCoverUrlForTitle(gameToEdit.title) || '');
      setManualRank(gameToEdit.rank);
      setMode('manual');
      setFeedback(null);
    } else {
      setTitle('');
      setPlatform('Multiplataforma');
      setGenres(['Acción']);
      setNotes('');
      setCoverUrl('');
      setManualRank(totalGames + 1);
      setMode('choose');
      setFeedback(null);
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

  // 1. Botón: Buscar carátula automática (Local + RAWG API online)
  const handleSearchCover = async () => {
    if (!title.trim()) {
      setFeedback({
        type: 'error',
        text: 'Por favor, escribe primero el Título del Videojuego para buscar su carátula.',
      });
      return;
    }

    setIsSearchingCover(true);
    setFeedback({
      type: 'info',
      text: `Buscando carátula oficial para "${title.trim()}" en la red...`,
    });

    try {
      const result = await searchGameCoverAndInfo(title.trim());

      if (result && result.coverUrl) {
        setCoverUrl(result.coverUrl);
        // Si no se han modificado géneros o plataforma, enriquecer con los oficiales
        if (genres.length <= 1 && result.genres.length > 0) {
          setGenres(result.genres);
        }
        if ((!platform || platform === 'Multiplataforma') && result.platform) {
          setPlatform(result.platform);
        }
        setFeedback({
          type: 'success',
          text: `¡Carátula encontrada y aplicada con éxito!`,
        });
      } else {
        setFeedback({
          type: 'error',
          text: `No se encontró carátula automática para "${title.trim()}". Puedes pegar una URL de imagen directamente.`,
        });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        text: 'Error de conexión al buscar la carátula.',
      });
    } finally {
      setIsSearchingCover(false);
    }
  };

  // 2. Botón: Sugerir y autocompletar Título del Videojuego (+ portada y datos)
  const handleSuggestGame = () => {
    // Tomar un juego aleatorio de la lista curada de sugerencias populares
    const randomIndex = Math.floor(Math.random() * POPULAR_SUGGESTED_GAMES.length);
    const suggested = POPULAR_SUGGESTED_GAMES[randomIndex];

    setTitle(suggested.title);
    setPlatform(suggested.platform);
    setGenres(suggested.genres);
    setCoverUrl(suggested.coverUrl || getCoverUrlForTitle(suggested.title) || '');
    setNotes(suggested.notes);

    setFeedback({
      type: 'success',
      text: `¡Título cargado: "${suggested.title}" con carátula y notas listas!`,
    });
  };

  // 3. Botón: Generar Impresiones / Notas personales automáticas
  const handleGenerateNotes = () => {
    const generated = generateSmartImpressions(title, genres);
    setNotes(generated);
    setFeedback({
      type: 'success',
      text: '¡Impresión personal generada según el género! Puedes editarla a tu gusto.',
    });
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
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>{gameToEdit ? `Editar: ${gameToEdit.title}` : 'Añadir Nuevo Juego Terminado'}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mensaje de retroalimentación dinámico */}
        {feedback && (
          <div
            className={`mx-6 mt-4 p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 transition-all ${
              feedback.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                : feedback.type === 'error'
                ? 'bg-rose-950/60 border-rose-500/40 text-rose-200'
                : 'bg-purple-950/60 border-purple-500/40 text-purple-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : feedback.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              ) : (
                <RefreshCw className="w-4 h-4 text-purple-400 animate-spin flex-shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Formulario */}
        <div className="p-6 space-y-4 text-xs sm:text-sm">
          {/* Título */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase text-slate-400">
                Título del Videojuego *
              </label>
              <button
                type="button"
                onClick={handleSuggestGame}
                className="text-[11px] text-amber-300 hover:text-amber-200 font-semibold flex items-center gap-1.5 cursor-pointer bg-amber-500/15 hover:bg-amber-500/25 px-2.5 py-1 rounded-lg border border-amber-500/30 transition-all"
                title="Autocompletar con un juego popular recomendado"
              >
                <Dices className="w-3.5 h-3.5 text-amber-400" />
                <span>🎲 Llenar con juego sugerido</span>
              </button>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ej. Lies of P, Black Myth: Wukong, Silent Hill 2..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              autoFocus
            />
          </div>

          {/* Carátula / Portada con vista previa y búsqueda online */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase text-slate-400">
                Carátula / Portada (Thumbnail)
              </label>
              <button
                type="button"
                onClick={handleSearchCover}
                disabled={isSearchingCover}
                className="text-[11px] text-purple-300 hover:text-purple-200 font-semibold flex items-center gap-1.5 cursor-pointer bg-purple-500/15 hover:bg-purple-500/25 px-2.5 py-1 rounded-lg border border-purple-500/30 transition-all disabled:opacity-50"
                title="Busca la carátula oficial en línea por el título"
              >
                {isSearchingCover ? (
                  <>
                    <RefreshCw className="w-3 h-3 text-purple-400 animate-spin" />
                    <span>Buscando en la red...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Buscar carátula automática</span>
                  </>
                )}
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
                  Se busca en internet automáticamente o puedes pegar cualquier enlace de imagen directo.
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

          {/* Impresiones / Notas personales */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase text-slate-400">
                Impresiones / Notas personales
              </label>
              <button
                type="button"
                onClick={handleGenerateNotes}
                className="text-[11px] text-cyan-300 hover:text-cyan-200 font-semibold flex items-center gap-1.5 cursor-pointer bg-cyan-500/15 hover:bg-cyan-500/25 px-2.5 py-1 rounded-lg border border-cyan-500/30 transition-all"
                title="Generar reseña personal automática según el género"
              >
                <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>✨ Llenar notas / reseña</span>
              </button>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="¿Qué te pareció? ¿Cuál fue tu jefe favorito o momento cumbre? (O pulsa el botón ✨ para autocompletar)"
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
