import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  Swords,
  Flame,
  Gamepad,
  CheckCircle,
  HelpCircle,
  KeyRound,
  Loader2,
  RefreshCw,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { Game, Recommendation, UserSettings } from '../../types/game';
import { getRecommendations, fetchGeminiRecommendations } from '../../services/recommendations';
import { GameCover } from '../common/GameCover';

interface RecommendationsTabProps {
  finishedGames: Game[];
  settings: UserSettings;
  onStartDuelForRecommendation: (recommendation: Recommendation) => void;
  onOpenSettings: () => void;
}

export function RecommendationsTab({
  finishedGames,
  settings,
  onStartDuelForRecommendation,
  onOpenSettings,
}: RecommendationsTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isLoadingGemini, setIsLoadingGemini] = useState<boolean>(false);
  const [geminiError, setGeminiError] = useState<string | null>(null);
  const [geminiRecommendations, setGeminiRecommendations] = useState<Recommendation[]>([]);

  // Obtener recomendaciones curadas filtrando los juegos ya terminados
  const curatedRecommendations = getRecommendations(finishedGames);

  // Combinar recomendaciones de Gemini con curadas
  const allRecommendations = [...geminiRecommendations, ...curatedRecommendations];

  // Filtro por género o categoría
  const filteredRecommendations = allRecommendations.filter((rec) => {
    if (selectedCategory === 'ALL') return true;
    return rec.genres.some((g) => g.toLowerCase().includes(selectedCategory.toLowerCase()));
  });

  // Top 5 favoritos para mostrar de qué se alimentó el motor
  const topFavorites = finishedGames.slice(0, 5);

  // Llamada a Gemini API
  const handleFetchGemini = async () => {
    if (!settings.geminiApiKey) {
      onOpenSettings();
      return;
    }

    setIsLoadingGemini(true);
    setGeminiError(null);

    try {
      const results = await fetchGeminiRecommendations(settings.geminiApiKey, finishedGames);
      // Filtrar los que ya estén terminados por si acaso
      const normalizedTitles = new Set(finishedGames.map((g) => g.title.toLowerCase().trim()));
      const filtered = results.filter((r) => !normalizedTitles.has(r.title.toLowerCase().trim()));

      setGeminiRecommendations(filtered);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido al conectar con Gemini.';
      setGeminiError(errorMsg);
    } finally {
      setIsLoadingGemini(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Banner Hero del Motor de Recomendaciones */}
      <div className="relative rounded-3xl overflow-hidden border border-purple-500/30 bg-gradient-to-br from-slate-900 via-purple-950/40 to-slate-950 p-6 sm:p-8 shadow-2xl shadow-purple-950/40">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
            Motor Inteligente Basado en tu Top 25
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Nuevas aventuras hechas a tu medida
          </h2>

          <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
            Analizando tus 93 títulos terminados, detectamos una pasión arrolladora por{' '}
            <strong className="text-amber-300">Soulslikes exigentes</strong> (Sekiro, Elden Ring, Bloodborne),{' '}
            <strong className="text-purple-300">Metroidvanias profundos</strong> (Hollow Knight, Ender Lilies, Metroid Dread) y{' '}
            <strong className="text-cyan-300">Survival Horror de atmósfera densa</strong> (Resident Evil 2).
          </p>

          {/* Chips de juegos influyentes */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold">Tus 5 pilares:</span>
            {topFavorites.map((fav) => (
              <span
                key={fav.id}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-200 border border-slate-700/80 font-bold"
              >
                #{fav.rank} {fav.title}
              </span>
            ))}
          </div>

          {/* Botones de acción IA */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleFetchGemini}
              disabled={isLoadingGemini}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoadingGemini ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analizando con Gemini AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>
                    {settings.geminiApiKey
                      ? 'Reanalizar con Gemini AI'
                      : 'Conectar Gemini AI para recomendaciones en vivo'}
                  </span>
                </>
              )}
            </button>

            {!settings.geminiApiKey && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Configurar API Key</span>
              </button>
            )}
          </div>

          {geminiError && (
            <div className="mt-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs">
              {geminiError}
            </div>
          )}
        </div>
      </div>

      {/* Filtros de categorías */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px] mr-1">
          Filtrar por:
        </span>
        {[
          { id: 'ALL', label: 'Todos los recomendados' },
          { id: 'Soulslike', label: '⚔️ Soulslike' },
          { id: 'Metroidvania', label: '🗺️ Metroidvania' },
          { id: 'Survival Horror', label: '🧟 Survival Horror' },
          { id: 'Acción', label: '💥 Acción & Aventura' },
        ].map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
              selectedCategory === cat.id
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-1 ring-purple-400'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid de Tarjetas de Recomendación */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecommendations.map((rec) => (
          <div
            key={rec.id}
            className="group relative rounded-2xl border border-slate-800 hover:border-purple-500/50 bg-gradient-to-b from-slate-900 to-slate-950 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-purple-950/30 hover:-translate-y-1"
          >
            {/* Cabecera de la tarjeta: Portada, Título y Score de Afinidad */}
            <div>
              <div className="flex gap-3.5 items-start mb-3">
                <GameCover
                  title={rec.title}
                  coverUrl={rec.coverUrl}
                  size="md"
                  className="shadow-md rounded-xl flex-shrink-0 group-hover:scale-105 transition-transform"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-500/20 to-purple-500/20 text-amber-300 border border-amber-500/30">
                      <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      {rec.matchScore}% Match
                    </span>

                    {rec.source === 'gemini' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        <Sparkles className="w-2.5 h-2.5" />
                        Gemini AI
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-black text-white group-hover:text-purple-300 transition-colors leading-tight">
                    {rec.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 font-medium">
                    <Gamepad className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{rec.platform}</span>
                  </div>
                </div>
              </div>

              {/* Chips de géneros */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {rec.genres.map((g) => (
                  <span
                    key={g}
                    className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700/60"
                  >
                    {g}
                  </span>
                ))}
              </div>

              {/* Bloque destacado: "¿Por qué te gustará?" */}
              <div className="mt-4 p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs text-slate-300 leading-relaxed">
                <div className="font-bold text-purple-300 mb-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  ¿Por qué te gustará?
                </div>
                <p className="italic text-slate-300">{rec.whyYouWillLoveIt}</p>

                {rec.connectedWith && rec.connectedWith.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-purple-500/20 flex flex-wrap gap-1 items-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Conecta con:
                    </span>
                    {rec.connectedWith.map((c) => (
                      <span
                        key={c}
                        className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-purple-900/40 text-purple-200 border border-purple-500/30"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Botón de acción: Marcar como terminado e Iniciar Duelo */}
            <div className="mt-6 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => onStartDuelForRecommendation(rec)}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow-lg shadow-purple-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer group-hover:scale-[1.02]"
              >
                <Swords className="w-4 h-4" />
                <span>Marcar como terminado (Iniciar Duelo)</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
