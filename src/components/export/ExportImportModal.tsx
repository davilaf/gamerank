import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  FileText,
  FileCode,
  Upload,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Download,
} from 'lucide-react';
import { Game } from '../../types/game';
import { exportImportService } from '../../services/exportImport';

interface ExportImportModalProps {
  isOpen: boolean;
  games: Game[];
  onClose: () => void;
  onImportSuccess: (importedGames: Game[]) => void;
  onResetToSeed: () => void;
}

export function ExportImportModal({
  isOpen,
  games,
  onClose,
  onImportSuccess,
  onResetToSeed,
}: ExportImportModalProps) {
  const [activeSubTab, setActiveSubTab] = useState<'export' | 'import' | 'reset'>('export');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<Game[] | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const handleExportExcel = () => {
    exportImportService.exportToExcel(games);
  };

  const handleExportCSV = () => {
    exportImportService.exportToCSV(games);
  };

  const handleExportJSON = () => {
    exportImportService.exportToJSON(games);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setImportError(null);

    try {
      const parsed = await exportImportService.parseImportedFile(file);
      setImportPreview(parsed);
    } catch (err: unknown) {
      setImportError(err instanceof Error ? err.message : 'Error al procesar el archivo.');
      setImportPreview(null);
    }
  };

  const handleApplyImport = () => {
    if (!importPreview || importPreview.length === 0) return;
    onImportSuccess(importPreview);
    onClose();
  };

  const handleExecuteReset = () => {
    onResetToSeed();
    setShowResetConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">Copias de Seguridad y Exportación</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas secundarias */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 pt-3 text-xs font-bold gap-4">
          <button
            type="button"
            onClick={() => setActiveSubTab('export')}
            className={`pb-3 border-b-2 transition-colors ${
              activeSubTab === 'export'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Exportar Lista
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('import')}
            className={`pb-3 border-b-2 transition-colors ${
              activeSubTab === 'import'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Importar Archivo
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('reset')}
            className={`pb-3 border-b-2 transition-colors ${
              activeSubTab === 'reset'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Restaurar Original (93)
          </button>
        </div>

        {/* Contenido según pestaña */}
        <div className="p-6 text-xs sm:text-sm">
          {activeSubTab === 'export' && (
            <div className="space-y-4">
              <p className="text-slate-300">
                Descarga tu ranking completo ({games.length} videojuegos) en el formato que prefieras:
              </p>

              {/* Botón Excel */}
              <button
                type="button"
                onClick={handleExportExcel}
                className="w-full p-4 rounded-xl bg-slate-950 hover:bg-emerald-950/20 border border-slate-800 hover:border-emerald-500/50 flex items-center justify-between transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 group-hover:scale-105 transition-transform">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-white group-hover:text-emerald-300">
                      Exportar a Microsoft Excel (.xlsx)
                    </h4>
                    <p className="text-xs text-slate-400">
                      Incluye puesto, tier, título, plataformas, géneros y notas en tabla estilizada.
                    </p>
                  </div>
                </div>
                <Download className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
              </button>

              {/* Botón CSV */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="w-full p-4 rounded-xl bg-slate-950 hover:bg-blue-950/20 border border-slate-800 hover:border-blue-500/50 flex items-center justify-between transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 group-hover:scale-105 transition-transform">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-white group-hover:text-blue-300">
                      Exportar a CSV (Compatible Excel & Google Sheets)
                    </h4>
                    <p className="text-xs text-slate-400">
                      Formato delimitado con codificación UTF-8 con BOM.
                    </p>
                  </div>
                </div>
                <Download className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors" />
              </button>

              {/* Botón JSON */}
              <button
                type="button"
                onClick={handleExportJSON}
                className="w-full p-4 rounded-xl bg-slate-950 hover:bg-purple-950/20 border border-slate-800 hover:border-purple-500/50 flex items-center justify-between transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 group-hover:scale-105 transition-transform">
                    <FileCode className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-white group-hover:text-purple-300">
                      Copia de Seguridad Completa (.json)
                    </h4>
                    <p className="text-xs text-slate-400">
                      Ideal para migrar o restaurar todos tus datos intactos.
                    </p>
                  </div>
                </div>
                <Download className="w-5 h-5 text-slate-500 group-hover:text-purple-400 transition-colors" />
              </button>
            </div>
          )}

          {activeSubTab === 'import' && (
            <div className="space-y-4">
              <p className="text-slate-300">
                Sube un archivo de respaldo previo en formato <strong>.json</strong> o <strong>.csv</strong> para restaurar tu ranking:
              </p>

              <label className="block p-8 border-2 border-dashed border-slate-700 hover:border-purple-500 rounded-2xl text-center bg-slate-950/60 cursor-pointer transition-colors group">
                <Upload className="w-8 h-8 text-slate-400 group-hover:text-purple-400 mx-auto mb-2 transition-colors" />
                <span className="text-xs font-bold text-white block">
                  {importFile ? importFile.name : 'Haz clic para seleccionar o arrastra un archivo'}
                </span>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Archivos soportados: .json, .csv
                </span>
                <input
                  type="file"
                  accept=".json,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {importError && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs">
                  {importError}
                </div>
              )}

              {importPreview && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" />
                      Archivo válido detectado
                    </span>
                    <span className="text-slate-300 font-bold">
                      {importPreview.length} juegos reconocidos
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400">
                    Primeros títulos: {importPreview.slice(0, 3).map((g) => `#${g.rank} ${g.title}`).join(', ')}...
                  </div>

                  <button
                    type="button"
                    onClick={handleApplyImport}
                    className="w-full mt-3 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-colors"
                  >
                    Confirmar e Importar {importPreview.length} Juegos
                  </button>
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'reset' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-400" />
                <div>
                  <h4 className="font-bold text-amber-300">Restauración de Fábrica</h4>
                  <p className="mt-1 leading-relaxed text-amber-200/90">
                    Esta acción restablecerá tu ranking exactamente a la lista inicial de los 93 videojuegos
                    (del #1 <em>Sekiro</em> al #93 <em>Aborigenus</em>) con sus géneros y notas originales.
                  </p>
                </div>
              </div>

              {!showResetConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="w-full py-3 rounded-xl bg-red-950/60 hover:bg-red-900/60 border border-red-500/40 text-red-200 font-bold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4 text-red-400" />
                  <span>Restablecer a la lista inicial de 93 juegos</span>
                </button>
              ) : (
                <div className="p-4 rounded-xl bg-slate-950 border border-red-500/50 space-y-3">
                  <p className="text-xs text-white font-bold text-center">
                    ¿Estás completamente seguro de restaurar los 93 juegos originales?
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowResetConfirm(false)}
                      className="flex-1 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold text-xs"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleExecuteReset}
                      className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
                    >
                      Sí, Restaurar 93 Juegos
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
