import { Game, DuelStep, DuelState } from '../types/game';

/**
 * Calcula el número estimado de rondas de búsqueda binaria para una lista de N elementos:
 * ceil(log2(N + 1))
 */
export function estimateTotalRounds(totalGames: number): number {
  if (totalGames <= 0) return 1;
  return Math.ceil(Math.log2(totalGames + 1));
}

/**
 * Crea el estado inicial para el duelo de inserción binaria de un nuevo juego
 */
export function initDuelState(newGame: Partial<Game>, existingGames: Game[]): DuelState {
  if (existingGames.length === 0) {
    return {
      isActive: true,
      newGame,
      low: 0,
      high: -1,
      history: [],
      currentStep: null,
      isComplete: true,
      calculatedRank: 1,
    };
  }

  const low = 0;
  const high = existingGames.length - 1;
  const mid = Math.floor((low + high) / 2);
  const totalEstimatedRounds = estimateTotalRounds(existingGames.length);

  const initialStep: DuelStep = {
    low,
    high,
    mid,
    comparedGame: existingGames[mid],
    round: 1,
    totalEstimatedRounds,
  };

  return {
    isActive: true,
    newGame,
    low,
    high,
    history: [],
    currentStep: initialStep,
    isComplete: false,
    calculatedRank: null,
  };
}

/**
 * Avanza el estado del duelo según la decisión del usuario:
 * - winner === 'new': El usuario disfrutó más el juego nuevo.
 *   Por tanto, el juego nuevo debe posicionarse en un rango más alto (menor índice, hacia rank 1).
 *   high = mid - 1.
 * - winner === 'existing': El usuario prefirió el juego existente.
 *   Por tanto, el juego nuevo debe posicionarse en un rango inferior (mayor índice, hacia rank N).
 *   low = mid + 1.
 */
export function stepDuel(
  currentState: DuelState,
  winner: 'new' | 'existing',
  existingGames: Game[]
): DuelState {
  if (!currentState.currentStep || currentState.isComplete) {
    return currentState;
  }

  const { low, high, mid } = currentState.currentStep;
  let newLow = low;
  let newHigh = high;

  if (winner === 'new') {
    newHigh = mid - 1;
  } else {
    newLow = mid + 1;
  }

  // Guardar el paso actual en el historial para permitir deshacer
  const newHistory = [...currentState.history, currentState.currentStep];

  // Si low > high, la búsqueda binaria ha concluido exactamente
  if (newLow > newHigh) {
    const finalInsertionIndex = newLow; // 0..existingGames.length
    const calculatedRank = finalInsertionIndex + 1;

    return {
      ...currentState,
      low: newLow,
      high: newHigh,
      history: newHistory,
      currentStep: null,
      isComplete: true,
      calculatedRank,
    };
  }

  // Siguiente paso
  const nextMid = Math.floor((newLow + newHigh) / 2);
  const nextStep: DuelStep = {
    low: newLow,
    high: newHigh,
    mid: nextMid,
    comparedGame: existingGames[nextMid],
    round: newHistory.length + 1,
    totalEstimatedRounds: currentState.currentStep.totalEstimatedRounds,
  };

  return {
    ...currentState,
    low: newLow,
    high: newHigh,
    history: newHistory,
    currentStep: nextStep,
    isComplete: false,
    calculatedRank: null,
  };
}

/**
 * Deshace la última decisión del duelo
 */
export function undoDuelStep(currentState: DuelState): DuelState {
  if (currentState.history.length === 0) {
    return currentState;
  }

  const prevStep = currentState.history[currentState.history.length - 1];
  const newHistory = currentState.history.slice(0, -1);

  return {
    ...currentState,
    low: prevStep.low,
    high: prevStep.high,
    history: newHistory,
    currentStep: prevStep,
    isComplete: false,
    calculatedRank: null,
  };
}

/**
 * Inserta un juego en una posición específica de la lista y recalcula todos los rangos correlativos
 */
export function insertGameAtRank(games: Game[], newGame: Game, targetRank: number): Game[] {
  // Asegurar límites válidos (1 a games.length + 1)
  const clampedRank = Math.max(1, Math.min(targetRank, games.length + 1));
  const insertIndex = clampedRank - 1;

  const newList = [...games];
  newList.splice(insertIndex, 0, newGame);

  // Recalcular correlativos 1..N
  return newList.map((game, index) => ({
    ...game,
    rank: index + 1,
  }));
}

/**
 * Mueve un juego una posición hacia arriba o hacia abajo
 */
export function moveGameByOffset(games: Game[], gameId: string, offset: -1 | 1): Game[] {
  const index = games.findIndex((g) => g.id === gameId);
  if (index === -1) return games;

  const targetIndex = index + offset;
  if (targetIndex < 0 || targetIndex >= games.length) return games;

  const newList = [...games];
  const [removed] = newList.splice(index, 1);
  newList.splice(targetIndex, 0, removed);

  return newList.map((game, idx) => ({
    ...game,
    rank: idx + 1,
  }));
}

/**
 * Reordena mediante Drag and Drop: mueve un elemento de fromIndex a toIndex
 */
export function reorderGames(games: Game[], fromIndex: number, toIndex: number): Game[] {
  if (fromIndex === toIndex) return games;
  if (fromIndex < 0 || fromIndex >= games.length) return games;
  if (toIndex < 0 || toIndex >= games.length) return games;

  const newList = [...games];
  const [moved] = newList.splice(fromIndex, 1);
  newList.splice(toIndex, 0, moved);

  return newList.map((game, index) => ({
    ...game,
    rank: index + 1,
  }));
}
