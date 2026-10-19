import React, { useState } from 'react';
import {
  Cloud,
  CloudCheck,
  RefreshCw,
  Copy,
  Check,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  X,
  ArrowUpCircle,
  ArrowDownCircle,
} from 'lucide-react';
import {
  getSyncCode,
  setSyncCode,
  pushGamesToCloud,
  pullGamesFromCloud,
  getLastSyncedAt,
} from '../../services/cloudSync';
import { Game } from '../../types/game';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: Game[];
  onGamesUpdated: (newGames: Game[]) => void;
  showToast: (msg: string) => void;
}

export function CloudSyncModal({
  isOpen,
  onClose,
  games,
  onGamesUpdated,
  showToast,
}: CloudSyncModalProps) {
  const [currentCode, setCurrentCodeState] = useState<string>(getSyncCode());
  const [inputCode, setInputCode] = useState<string>(getSyncCode());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [lastSync, setLastSync] = useState<string | null>(getLastSyncedAt());

  if (!isOpen) return null;

  // Generar enlace completo con el código
  const syncUrl = `${window.location.origin}${window.location.pathname}?sync=${encodeURIComponent(
    currentCode
  )}`;

  const handleSaveCode = async () => {
    if (!inputCode.trim()) return;
    const clean = setSyncCode(inputCode);
    setCurrentCodeState(clean);
    showToast(`Bóveda cambiada a "${clean}". Descargando datos...`);
    setIsSyncing(true);
    const res = await pullGamesFromCloud(clean);
    setIsSyncing(false);
    if (res.success && res.games && res.games.length > 0) {
      onGamesUpdated(res.games);
      setLastSync(res.timestamp || new Date().toISOString());
      showToast(`¡Se cargaron ${res.games.length} juegos desde la nube!`);
    } else {
      showToast('Bóveda lista. Puedes subir tus juegos actuales.');
    }
  };

  const handleManualPush = async () => {
    setIsSyncing(true);
    const res = await pushGamesToCloud(games, currentCode);
    setIsSyncing(false);
    if (res.success) {
      setLastSync(res.timestamp || new Date().toISOString());
      showToast('¡Tus cambios se subieron con éxito a la nube!');
    } else {
      showToast(`Error al subir: ${res.error || 'Intenta de nuevo'}`);
    }
  };

  const handleManualPull = async () => {
    setIsSyncing(true);
    const res = await pullGamesFromCloud(currentCode);
    setIsSyncing(false);
    if (res.success && res.games && res.games.length > 0) {
      onGamesUpdated(res.games);
      setLastSync(res.timestamp || new Date().toISOString());
      showToast(`¡Se descargaron ${res.games.length} juegos de la nube!`);
    } else if (res.success && !res.games) {
      showToast('No hay datos guardados aún en esta bóveda. Prueba subir primero.');
    } else {
      showToast(`Error al descargar: ${res.error || 'Intenta de nuevo'}`);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(syncUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
    showToast('¡Enlace de sincronización copiado al portapapeles!');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
    showToast('Código copiado');
  };

  const formatLastSync = (iso: string | null) => {
    if (!iso) return 'Nunca sincronizado';
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' - ' + d.toLocaleDateString();
    } catch {
      return iso;
    }
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    syncUrl
  )}&bgcolor=111827&color=c084fc&margin=2`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-surface-card border border-white/10 rounded-2xl shadow-2xl p-6 text-white max-h-[90vh] overflow-y-auto">
        {/* Encabezado */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Cloud className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Sincronización en la Nube
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  En Tiempo Real
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                Mantén tus fotos, duelos y ranking idénticos en PC y Celular.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Estado actual */}
        <div className="my-5 p-4 rounded-xl bg-gradient-to-r from-purple-950/40 via-surface-hover to-indigo-950/40 border border-purple-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
            <div>
              <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Bóveda Conectada: <span className="text-purple-300 font-mono">{currentCode}</span>
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                Última sincronización: {formatLastSync(lastSync)}
              </div>
            </div>
          </div>
          {isSyncing && (
            <RefreshCw className="w-5 h-5 text-purple-400 animate-spin" />
          )}
        </div>

        {/* Acciones Rápidas de Subida / Descarga */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={handleManualPush}
            disabled={isSyncing}
            className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm transition-all shadow-lg shadow-purple-600/20 disabled:opacity-50"
          >
            <ArrowUpCircle className="w-5 h-5" />
            <span>Subir a la nube</span>
          </button>

          <button
            onClick={handleManualPull}
            disabled={isSyncing}
            className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-surface-hover hover:bg-white/10 text-white font-medium text-sm border border-white/10 transition-all disabled:opacity-50"
          >
            <ArrowDownCircle className="w-5 h-5 text-emerald-400" />
            <span>Descargar en este equipo</span>
          </button>
        </div>

        {/* Conectar Celular (Enlace y QR) */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
          <div className="flex items-center space-x-2 text-sm font-semibold text-white mb-2">
            <Smartphone className="w-4 h-4 text-purple-400" />
            <span>¿Cómo sincronizar tu teléfono celular?</span>
          </div>
          <p className="text-xs text-gray-300 mb-4 leading-relaxed">
            Abre este enlace en tu celular o escanea el código QR con la cámara. Ambos dispositivos compartirán la misma bóveda automáticamente:
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 bg-surface-card p-3 rounded-lg border border-white/10">
            {/* Código QR */}
            <div className="bg-gray-900 p-2 rounded-lg border border-purple-500/30 flex-shrink-0">
              <img
                src={qrImageUrl}
                alt="Código QR de sincronización"
                className="w-28 h-28 object-contain rounded"
              />
              <span className="block text-[10px] text-center text-gray-400 mt-1">Escanear con móvil</span>
            </div>

            {/* Enlace y botón copiar */}
            <div className="flex-1 w-full flex flex-col justify-between">
              <div className="text-xs text-gray-400 mb-1">Enlace directo con código incluido:</div>
              <div className="p-2 rounded bg-black/40 border border-white/10 font-mono text-[11px] text-purple-200 truncate select-all mb-2">
                {syncUrl}
              </div>
              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-medium transition-colors"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? '¡Enlace copiado!' : 'Copiar enlace para enviar por WhatsApp'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Cambiar Bóveda / Código de Sincronización */}
        <div className="border-t border-white/10 pt-4">
          <label className="block text-xs font-medium text-gray-400 mb-1.5">
            Personalizar Código de Bóveda (por si quieres respaldos separados):
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="ej: mi-ranking-secreto"
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 font-mono"
            />
            <button
              onClick={handleSaveCode}
              disabled={inputCode === currentCode || !inputCode.trim()}
              className="px-3.5 py-2 rounded-lg bg-surface-hover hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-colors disabled:opacity-40"
            >
              Cambiar
            </button>
          </div>
        </div>

        {/* Pie */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
