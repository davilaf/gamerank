import React, { useState } from 'react';
import { X, Key, Volume2, VolumeX, Sparkles, Check, LayoutList } from 'lucide-react';
import { UserSettings } from '../../types/game';

interface SettingsModalProps {
  isOpen: boolean;
  settings: UserSettings;
  onClose: () => void;
  onSaveSettings: (settings: UserSettings) => void;
}

export function SettingsModal({
  isOpen,
  settings: initialSettings,
  onClose,
  onSaveSettings,
}: SettingsModalProps) {
  const [geminiApiKey, setGeminiApiKey] = useState(initialSettings.geminiApiKey || '');
  const [rawgApiKey, setRawgApiKey] = useState(initialSettings.rawgApiKey || '');
  const [enableSounds, setEnableSounds] = useState(initialSettings.enableSounds);
  const [defaultView, setDefaultView] = useState<'list' | 'tiers' | 'compact'>(
    initialSettings.defaultView || 'list'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings({
      geminiApiKey: geminiApiKey.trim(),
      rawgApiKey: rawgApiKey.trim(),
      enableSounds,
      defaultView,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Configuración y APIs</span>
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
        <div className="p-6 space-y-5 text-xs sm:text-sm">
          {/* Gemini API Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Google Gemini API Key (Opcional)</span>
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-purple-400 hover:underline"
              >
                Obtener clave gratis &rarr;
              </a>
            </div>
            <p className="text-[11px] text-slate-400">
              Permite generar recomendaciones con Inteligencia Artificial analizando tus juegos favoritos en tiempo real.
            </p>
            <input
              type="password"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-xs"
            />
          </div>

          {/* RAWG API Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-200 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-cyan-400" />
                <span>RAWG API Key (Opcional)</span>
              </label>
              <a
                href="https://rawg.io/apidocs"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-cyan-400 hover:underline"
              >
                Registrarse en RAWG &rarr;
              </a>
            </div>
            <p className="text-[11px] text-slate-400">
              Para sincronizar carátulas oficiales y metadatos de videojuegos.
            </p>
            <input
              type="password"
              value={rawgApiKey}
              onChange={(e) => setRawgApiKey(e.target.value)}
              placeholder="Tu clave de RAWG..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-xs"
            />
          </div>

          {/* Sonidos */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                {enableSounds ? (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                )}
                <span>Efectos de Sonido en Duelos</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Choque de espadas y fanfarria al clasificar un nuevo juego.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEnableSounds(!enableSounds)}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                enableSounds ? 'bg-purple-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                  enableSounds ? 'left-6.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Vista por defecto */}
          <div className="pt-2 border-t border-slate-800">
            <label className="font-bold text-slate-200 block mb-2 flex items-center gap-1.5">
              <LayoutList className="w-4 h-4 text-indigo-400" />
              <span>Vista predeterminada del Ranking</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'list', label: 'Lista' },
                { id: 'tiers', label: 'Tablero Tiers' },
                { id: 'compact', label: 'Tabla' },
              ].map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setDefaultView(v.id as 'list' | 'tiers' | 'compact')}
                  className={`py-2 px-3 rounded-xl font-bold text-xs transition-all ${
                    defaultView === v.id
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Pie */}
        <div className="p-5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-md shadow-purple-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>¡Guardado!</span>
              </>
            ) : (
              <span>Guardar Configuración</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
