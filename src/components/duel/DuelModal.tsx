import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Swords, Trophy, Undo2, X, ArrowLeft, ArrowRight, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import { Game, DuelState } from '../../types/game';
import { stepDuel, undoDuelStep } from '../../utils/binarySearchDuel';
import { getTierForRank } from '../../data/seedGames';
import { soundEffects } from '../../utils/audio';
import { GameCover } from '../common/GameCover';

interface DuelModalProps {
  duelState: DuelState;
  existingGames: Game[];
  enableSounds: boolean;
  onClose: () => void;
  onFinishDuel: (newGame: Game, calculatedRank: number) => void;
}

export function DuelModal({
  duelState: initialDuelState,
  existingGames,
  enableSounds,
  onClose,
  onFinishDuel,
}: DuelModalProps) {
  const [state, setState] = useState<DuelState>(initialDuelState);
  const [notes, setNotes] = useState<string>(initialDuelState.newGame.notes || '');
  const [selectedWinnerCard, setSelectedWinnerCard] = useState<'new' | 'existing' | null>(null);

  // Efecto de confeti y sonido al completar
  useEffect(() => {
    if (state.isComplete && state.calculatedRank !== null) {
      if (enableSounds) soundEffects.playVictory();
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#a855f7', '#3b82f6', '#10b981'],
        });
      } catch {
        // ignore
      }
    }
  }, [state.isComplete, state.calculatedRank, enableSounds]);

  // Manejador de elección
  const handleChoose = useCallback(
    (winner: 'new' | 'existing') => {
      if (state.isComplete) return;

      if (enableSounds) soundEffects.playClash();
      setSelectedWinnerCard(winner);

      setTimeout(() => {
        setSelectedWinnerCard(null);
        setState((prev) => stepDuel(prev, winner, existingGames));
      }, 250);
    },
    [state.isComplete, enableSounds, existingGames]
  );

  // Manejador de deshacer
  const handleUndo = () => {
    if (state.history.length === 0) return;
    if (enableSounds) soundEffects.playClick();
    setState((prev) => undoDuelStep(prev));
  };

  // Atajos de teclado: 1 o Flecha Izq para nuevo, 2 o Flecha Der para existente, Z para deshacer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state.isComplete) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === '1' || e.key === 'ArrowLeft') {
        e.preventDefault();
        handleChoose('new');
      } else if (e.key === '2' || e.key === 'ArrowRight') {
        e.preventDefault();
        handleChoose('existing');
      } else if ((e.key === 'z' || e.key === 'Z') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleUndo();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleChoose, state.isComplete, onClose]);

  const currentStep = state.currentStep;
  const newGameTitle = state.newGame.title || 'Nuevo Juego';
  const newGameGenres = state.newGame.genres || ['Acción'];
  const newGamePlatform = state.newGame.platform || 'Multiplataforma';

  // Progreso estimado
  const roundNumber = currentStep ? currentStep.round : state.history.length + 1;
  const totalEst = currentStep ? currentStep.totalEstimatedRounds : 7;
  const progressPercent = Math.min(100, Math.round(((roundNumber - 1) / totalEst) * 100));

  // Contexto de juegos vecinos tras completar
  const finalRank = state.calculatedRank ?? 1;
  const assignedTier = getTierForRank(finalRank);
  const gameAbove = finalRank > 1 ? existingGames[finalRank - 2] : null;
  const gameBelow = finalRank <= existingGames.length ? existingGames[finalRank - 1] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl shadow-purple-950/50 my-auto flex flex-col">
        {/* Cabecera del modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-lg shadow-purple-600/30">
              <Swords className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                Sistema de Duelos 1 vs 1
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                  Búsqueda Binaria
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Determina la posición exacta comparando únicamente ~{totalEst} veces
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {state.history.length > 0 && !state.isComplete && (
              <button
                type="button"
                onClick={handleUndo}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
                title="Deshacer última decisión (Ctrl+Z)"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Deshacer</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra de progreso de rondas */}
        {!state.isComplete && (
          <div className="px-6 pt-4 pb-2 bg-slate-900/50">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold text-purple-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                Ronda {roundNumber} de ~{totalEst}
              </span>
              <span>
                Acotando rango: puestos #{state.low + 1} a #{state.high + 1}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 transition-all duration-300 ease-out rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* CUERPO DEL DUELO: Pantalla interactiva 1 vs 1 */}
        {!state.isComplete && currentStep && (
          <div className="p-6 sm:p-8 flex flex-col items-center">
            <div className="text-center mb-6">
              <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                ENFRENTAMIENTO DIRECTO
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 mt-1">
                ¿Cuál disfrutaste más?
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Haz clic en tu preferido o usa las teclas <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-purple-300 font-mono text-xs">1</kbd> o <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-cyan-300 font-mono text-xs">2</kbd>
              </p>
            </div>

            {/* Arena de tarjetas: Opción A vs Opción B */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full relative">
              {/* Tarjeta A: Juego Nuevo */}
              <button
                type="button"
                onClick={() => handleChoose('new')}
                className={`group relative text-left p-4 sm:p-7 rounded-2xl transition-all duration-200 cursor-pointer flex flex-col justify-between border-2 bg-gradient-to-b from-slate-850 to-slate-900 ${
                  selectedWinnerCard === 'new'
                    ? 'border-purple-400 ring-4 ring-purple-500/40 scale-[1.02] shadow-2xl shadow-purple-600/50'
                    : 'border-purple-500/30 hover:border-purple-400/80 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/20'
                }`}
              >
                <div className="absolute top-4 right-4 flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  <span className="hidden sm:inline">Tecla</span> [ 1 ] <ArrowLeft className="w-3 h-3" />
                </div>

                <div className="flex gap-3 sm:gap-4 items-start">
                  <GameCover
                    title={newGameTitle}
                    coverUrl={state.newGame.coverUrl}
                    size="lg"
                    className="shadow-xl ring-1 ring-purple-500/40 rounded-xl flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40 mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                      Nuevo Aspirante
                    </div>
                    <h4 className="text-xl sm:text-2xl font-black text-white group-hover:text-purple-200 transition-colors leading-tight">
                      {newGameTitle}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 font-medium">{newGamePlatform}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap gap-1.5">
                  {newGameGenres.map((genre) => (
                    <span
                      key={genre}
                      className="px-2 py-0.5 text-xs rounded-md bg-slate-800 text-slate-300 border border-slate-700/60"
                    >
                      {genre}
                    </span>
                  ))}
                </div>

                <div className="mt-5 w-full py-2.5 px-4 rounded-xl bg-purple-600 group-hover:bg-purple-500 text-white font-bold text-center text-sm shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Elegir {newGameTitle}
                </div>
              </button>

              {/* Insignia VS central */}
              <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-slate-950 border-2 border-slate-700 items-center justify-center shadow-xl">
                <span className="text-xs font-black text-amber-400 italic">VS</span>
              </div>

              {/* Tarjeta B: Juego Existente en mid */}
              <button
                type="button"
                onClick={() => handleChoose('existing')}
                className={`group relative text-left p-4 sm:p-7 rounded-2xl transition-all duration-200 cursor-pointer flex flex-col justify-between border-2 bg-gradient-to-b from-slate-850 to-slate-900 ${
                  selectedWinnerCard === 'existing'
                    ? 'border-cyan-400 ring-4 ring-cyan-500/40 scale-[1.02] shadow-2xl shadow-cyan-600/50'
                    : 'border-cyan-500/30 hover:border-cyan-400/80 hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/20'
                }`}
              >
                <div className="absolute top-4 right-4 flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  <span className="hidden sm:inline">Tecla</span> [ 2 ] <ArrowRight className="w-3 h-3" />
                </div>

                <div className="flex gap-3 sm:gap-4 items-start">
                  <GameCover
                    title={currentStep.comparedGame.title}
                    coverUrl={currentStep.comparedGame.coverUrl}
                    size="lg"
                    className="shadow-xl ring-1 ring-cyan-500/40 rounded-xl flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 mb-2">
                      <Trophy className="w-3.5 h-3.5 text-cyan-300" />
                      Puesto #{currentStep.comparedGame.rank} Actual
                    </div>
                    <h4 className="text-xl sm:text-2xl font-black text-white group-hover:text-cyan-200 transition-colors leading-tight">
                      {currentStep.comparedGame.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 font-medium">
                      {currentStep.comparedGame.platform || 'Multiplataforma'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap gap-1.5">
                  {currentStep.comparedGame.genres.map((genre) => (
                    <span
                      key={genre}
                      className="px-2 py-0.5 text-xs rounded-md bg-slate-800 text-slate-300 border border-slate-700/60"
                    >
                      {genre}
                    </span>
                  ))}
                </div>

                <div className="mt-5 w-full py-2.5 px-4 rounded-xl bg-cyan-600 group-hover:bg-cyan-500 text-slate-950 font-bold text-center text-sm shadow-lg shadow-cyan-500/30 transition-all flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  Elegir {currentStep.comparedGame.title}
                </div>
              </button>
            </div>
          </div>
        )}

        {/* PANTALLA FINAL: Clasificación completada con éxito */}
        {state.isComplete && (
          <div className="p-6 sm:p-10 flex flex-col items-center text-center animate-fade-in">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 shadow-2xl shadow-amber-500/40 mb-4 animate-bounce">
              <Trophy className="w-10 h-10" />
            </div>

            <span className="text-xs uppercase tracking-widest text-amber-400 font-black">
              ¡CLASIFICACIÓN COMPLETADA!
            </span>
            <h3 className="text-3xl sm:text-4xl font-black text-white mt-1">
              {newGameTitle}
            </h3>
            <p className="text-slate-400 text-sm mt-1 max-w-md">
              Tras {state.history.length} duelos directos, tu preferencia matemática ha sido determinada:
            </p>

            {/* Puesto obtenido y Tier */}
            <div className="my-6 p-6 rounded-2xl bg-slate-800/80 border border-slate-700 w-full max-w-md flex flex-col items-center">
              <div className="text-xs text-slate-400 uppercase font-semibold">Posición Exacta</div>
              <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-200 my-1">
                Puesto #{finalRank}
              </div>
              <div
                className={`mt-2 px-3 py-1 rounded-full text-xs font-bold border ${assignedTier.badgeBg}`}
              >
                {assignedTier.level}-Tier: {assignedTier.label}
              </div>

              {/* Vecinos en el ranking */}
              <div className="mt-5 w-full pt-4 border-t border-slate-700/80 text-left text-xs space-y-1.5">
                {gameAbove && (
                  <div className="text-slate-400 flex items-center justify-between">
                    <span>Justo por debajo de:</span>
                    <span className="text-slate-200 font-semibold truncate max-w-[200px]">
                      #{gameAbove.rank} {gameAbove.title}
                    </span>
                  </div>
                )}
                {gameBelow && (
                  <div className="text-slate-400 flex items-center justify-between">
                    <span>Justo por encima de:</span>
                    <span className="text-slate-200 font-semibold truncate max-w-[200px]">
                      #{finalRank + 1} {gameBelow.title}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Notas opcionales antes de guardar */}
            <div className="w-full max-w-md text-left mb-6">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Impresiones o notas personales (opcional):
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="¿Qué fue lo que más te cautivó? ¿Dificultad, jefes, historia...?"
                rows={2}
                className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Botón de inserción definitiva */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
              <button
                type="button"
                onClick={() => {
                  const finalGame: Game = {
                    id: state.newGame.id || `game-${Date.now()}`,
                    rank: finalRank,
                    title: newGameTitle,
                    platform: newGamePlatform,
                    genres: newGameGenres,
                    notes: notes.trim() || state.newGame.notes || '',
                    finishedDate: new Date().toISOString().split('T')[0],
                  };
                  onFinishDuel(finalGame, finalRank);
                }}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-extrabold text-sm shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Confirmar e Insertar en el Puesto #{finalRank}</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleUndo}
                className="w-full sm:w-auto py-3 px-4 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              >
                Volver a comparar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
