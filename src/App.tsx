import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Game, DuelState, Recommendation, UserSettings } from './types/game';
import { storageService } from './services/storage';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { RankingList } from './components/ranking/RankingList';
import { RecommendationsTab } from './components/recommendations/RecommendationsTab';
import { DuelModal } from './components/duel/DuelModal';
import { AddEditGameModal } from './components/game/AddEditGameModal';
import { ExportImportModal } from './components/export/ExportImportModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { StatsModal } from './components/stats/StatsModal';
import { CloudSyncModal } from './components/sync/CloudSyncModal';
import {
  initDuelState,
  insertGameAtRank,
  moveGameByOffset,
  reorderGames,
} from './utils/binarySearchDuel';
import { getRecommendations } from './services/recommendations';
import {
  getSyncCode,
  pushGamesToCloud,
  pullGamesFromCloud,
  subscribeToCloudChanges,
} from './services/cloudSync';

export function App() {
  const [games, setGames] = useState<Game[]>([]);
  const [settings, setSettings] = useState<UserSettings>(storageService.getSettings());
  const [activeTab, setActiveTab] = useState<'ranking' | 'recommendations' | 'stats'>('ranking');

  // Modales
  const [duelState, setDuelState] = useState<DuelState | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [gameToEdit, setGameToEdit] = useState<Game | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);

  // Debounce ref para subida a la nube
  const pushTimeoutRef = useRef<number | null>(null);

  // Mensaje flotante de notificación
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  }, []);

  // Cargar juegos al iniciar y sincronizar con la nube
  useEffect(() => {
    const loaded = storageService.getGames();
    setGames(loaded);

    // Conectar y sincronizar con la nube
    const syncCode = getSyncCode();
    const localLastModified = storageService.getLastModified();

    setIsCloudSyncing(true);
    pullGamesFromCloud(syncCode)
      .then((res) => {
        setIsCloudSyncing(false);
        if (res.success && res.games && res.games.length > 0) {
          const cloudTime = res.timestamp ? new Date(res.timestamp).getTime() : 0;
          const localTime = localLastModified ? new Date(localLastModified).getTime() : 0;

          // Comprobar si los juegos locales de este dispositivo tienen cambios únicos
          const hasLocalModifications =
            loaded.length !== res.games.length ||
            loaded.some((lg, idx) => {
              const rg = res.games![idx];
              return (
                !rg ||
                lg.id !== rg.id ||
                lg.title !== rg.title ||
                (lg.notes && lg.notes !== rg.notes) ||
                (lg.coverUrl && lg.coverUrl !== rg.coverUrl)
              );
            });

          // Si este dispositivo tiene cambios más recientes o modificaciones únicas,
          // CONSERVAR los cambios locales y subirlos a la nube (así nunca se pierden los cambios del móvil)
          if ((localTime > cloudTime && hasLocalModifications) || (localTime > 0 && hasLocalModifications && cloudTime === 0)) {
            pushGamesToCloud(loaded, syncCode);
            showToast('📱 Se conservaron y subieron a la nube los cambios de tu dispositivo');
          } else {
            const normalized = storageService.normalizeRanks(res.games);
            setGames(normalized);
            storageService.saveGames(normalized, false);
            showToast('☁️ Sincronizado con la nube');
          }
        } else if (res.success && !res.games && loaded.length > 0) {
          // Si la nube aún no tiene datos, subir la lista actual
          pushGamesToCloud(loaded, syncCode);
        }
      })
      .catch(() => setIsCloudSyncing(false));

    // Escuchar cambios en tiempo real desde otros dispositivos (ej: PC <-> Celular)
    const unsubscribe = subscribeToCloudChanges((remoteGames) => {
      const normalized = storageService.normalizeRanks(remoteGames);
      setGames(normalized);
      storageService.saveGames(normalized);
      showToast('⚡ ¡Actualizado en vivo desde tu otro dispositivo!');
    }, syncCode);

    return () => {
      unsubscribe();
    };
  }, [showToast]);

  // Guardar en LocalStorage y sincronizar automáticamente con la nube
  const updateAndSaveGames = useCallback((newGames: Game[]) => {
    const normalized = storageService.normalizeRanks(newGames);
    setGames(normalized);
    storageService.saveGames(normalized);

    // Auto-subida debounced a la nube (500ms)
    if (pushTimeoutRef.current) {
      clearTimeout(pushTimeoutRef.current);
    }
    pushTimeoutRef.current = window.setTimeout(() => {
      setIsCloudSyncing(true);
      pushGamesToCloud(normalized)
        .then(() => setIsCloudSyncing(false))
        .catch(() => setIsCloudSyncing(false));
    }, 500);
  }, []);

  // Guardar ajustes
  const handleSaveSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    storageService.saveSettings(newSettings);
    showToast('Ajustes guardados correctamente.');
  };

  // 1. Duelos 1 vs 1: Iniciar duelo
  const handleStartDuel = (gameData: Partial<Game>) => {
    setIsAddModalOpen(false);
    const initialDuel = initDuelState(gameData, games);
    setDuelState(initialDuel);
  };

  // 1.1 Iniciar duelo directamente desde una tarjeta de recomendación
  const handleStartDuelForRecommendation = (rec: Recommendation) => {
    const gameData: Partial<Game> = {
      title: rec.title,
      platform: rec.platform,
      genres: rec.genres,
      notes: `Recomendado por afinidad (${rec.matchScore}%). ${rec.whyYouWillLoveIt}`,
    };
    const initialDuel = initDuelState(gameData, games);
    setDuelState(initialDuel);
  };

  // 1.2 Finalizar duelo e insertar juego en el puesto calculado
  const handleFinishDuel = (newGame: Game, calculatedRank: number) => {
    const updated = insertGameAtRank(games, newGame, calculatedRank);
    updateAndSaveGames(updated);
    setDuelState(null);
    showToast(`¡"${newGame.title}" ha sido clasificado en el puesto #${calculatedRank}!`);
    setActiveTab('ranking');
  };

  // 2. Movimiento manual rápido (Subir / Bajar 1 posición)
  const handleMoveUp = (gameId: string) => {
    const updated = moveGameByOffset(games, gameId, -1);
    updateAndSaveGames(updated);
  };

  const handleMoveDown = (gameId: string) => {
    const updated = moveGameByOffset(games, gameId, 1);
    updateAndSaveGames(updated);
  };

  // 3. Reordenamiento por Drag and Drop
  const handleReorder = (fromIndex: number, toIndex: number) => {
    const updated = reorderGames(games, fromIndex, toIndex);
    updateAndSaveGames(updated);
    showToast('Orden del ranking actualizado.');
  };

  // 4. Edición o guardado manual de puesto
  const handleSaveManual = (game: Game, targetRank?: number) => {
    if (gameToEdit) {
      // Modificar juego existente
      const updated = games.map((g) => (g.id === game.id ? game : g));
      updateAndSaveGames(updated);
      showToast(`Juego "${game.title}" actualizado.`);
    } else {
      // Insertar nuevo juego en targetRank
      const rankToInsert = targetRank || games.length + 1;
      const updated = insertGameAtRank(games, game, rankToInsert);
      updateAndSaveGames(updated);
      showToast(`"${game.title}" añadido en el puesto #${rankToInsert}.`);
    }
    setIsAddModalOpen(false);
    setGameToEdit(null);
  };

  // 5. Eliminar un juego del ranking
  const handleDeleteGame = (gameId: string) => {
    const game = games.find((g) => g.id === gameId);
    if (!game) return;

    if (window.confirm(`¿Seguro que deseas eliminar "${game.title}" de tu ranking?`)) {
      const remaining = games.filter((g) => g.id !== gameId);
      updateAndSaveGames(remaining);
      showToast(`"${game.title}" eliminado del ranking.`);
    }
  };

  // 6. Importar juegos desde archivo
  const handleImportSuccess = (importedGames: Game[]) => {
    updateAndSaveGames(importedGames);
    showToast(`Se importaron ${importedGames.length} juegos exitosamente.`);
  };

  // 7. Resetear a los 93 juegos originales
  const handleResetToSeed = () => {
    const seed = storageService.resetToSeedData();
    setGames(seed);
    showToast('Se ha restaurado la lista inicial de los 93 videojuegos.');
  };

  const uncompletedRecommendations = getRecommendations(games);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Barra de navegación superior */}
      <Header
        activeTab={activeTab}
        totalGames={games.length}
        recommendationsCount={uncompletedRecommendations.length}
        onTabChange={(tab) => {
          if (tab === 'stats') {
            setIsStatsModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenAddModal={() => {
          setGameToEdit(null);
          setIsAddModalOpen(true);
        }}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        isCloudSyncing={isCloudSyncing}
      />

      {/* Contenedor principal con espacio para navegación móvil */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28 md:pb-8">
        {activeTab === 'ranking' && (
          <RankingList
            games={games}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            onReorder={handleReorder}
            onEdit={(game) => {
              setGameToEdit(game);
              setIsAddModalOpen(true);
            }}
            onDelete={handleDeleteGame}
            onOpenAddModal={() => {
              setGameToEdit(null);
              setIsAddModalOpen(true);
            }}
            defaultView={settings.defaultView}
          />
        )}

        {activeTab === 'recommendations' && (
          <RecommendationsTab
            finishedGames={games}
            settings={settings}
            onStartDuelForRecommendation={handleStartDuelForRecommendation}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
          />
        )}
      </main>

      {/* Pie de página */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 pb-24 md:pb-6 text-center text-xs text-slate-500">
        <p>
          GameRank &copy; 2026 &mdash; Tu ranking personal con inserción interactiva por Búsqueda Binaria.
        </p>
      </footer>

      {/* Barra de navegación inferior móvil para pulgar */}
      <BottomNav
        activeTab={activeTab}
        recommendationsCount={uncompletedRecommendations.length}
        onTabChange={(tab) => {
          if (tab === 'stats') {
            setIsStatsModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenAddModal={() => {
          setGameToEdit(null);
          setIsAddModalOpen(true);
        }}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        isCloudSyncing={isCloudSyncing}
      />

      {/* Modal de Sincronización en la Nube */}
      <CloudSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        games={games}
        onGamesUpdated={(updatedGames) => {
          updateAndSaveGames(updatedGames);
        }}
        showToast={showToast}
      />

      {/* Modal de Duelos 1 vs 1 */}
      {duelState && (
        <DuelModal
          duelState={duelState}
          existingGames={games}
          enableSounds={settings.enableSounds}
          onClose={() => setDuelState(null)}
          onFinishDuel={handleFinishDuel}
        />
      )}

      {/* Modal para añadir o editar juego */}
      <AddEditGameModal
        isOpen={isAddModalOpen}
        gameToEdit={gameToEdit}
        totalGames={games.length}
        onClose={() => {
          setIsAddModalOpen(false);
          setGameToEdit(null);
        }}
        onSaveManual={handleSaveManual}
        onStartDuel={handleStartDuel}
      />

      {/* Modal de Exportar / Importar / Reset */}
      <ExportImportModal
        isOpen={isExportModalOpen}
        games={games}
        onClose={() => setIsExportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
        onResetToSeed={handleResetToSeed}
      />

      {/* Modal de Estadísticas */}
      <StatsModal
        isOpen={isStatsModalOpen}
        games={games}
        onClose={() => setIsStatsModalOpen(false)}
      />

      {/* Modal de Configuración */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        settings={settings}
        onClose={() => setIsSettingsModalOpen(false)}
        onSaveSettings={handleSaveSettings}
      />

      {/* Notificación flotante (Toast) */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-purple-950/95 border border-purple-500/50 rounded-2xl text-purple-100 text-xs sm:text-sm font-bold shadow-2xl shadow-purple-950 backdrop-blur-md animate-fade-in flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
export default App;
