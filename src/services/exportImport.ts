import * as XLSX from 'xlsx';
import { Game } from '../types/game';
import { getTierForRank } from '../data/seedGames';
import { getCoverUrlForTitle } from './covers';

export interface GameRankBackupPayload {
  version: string;
  exportDate: string;
  totalGames: number;
  games: Game[];
}

export const exportImportService = {
  /**
   * Exporta la lista actual a un archivo Excel (.xlsx) con todas las columnas, incluyendo carátulas y diseño limpio.
   */
  exportToExcel(games: Game[], filename = 'GameRank_Mis_Videojuegos.xlsx'): void {
    const rows = games.map((game) => {
      const tier = getTierForRank(game.rank);
      return {
        Puesto: game.rank,
        Tier: `${tier.level} - ${tier.label}`,
        Título: game.title,
        Plataforma: game.platform || 'Multiplataforma',
        Géneros: game.genres.join(', '),
        Notas: game.notes || '',
        'Carátula (URL)': game.coverUrl || getCoverUrlForTitle(game.title) || '',
        'Fecha Terminado': game.finishedDate || '',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Ajustar anchos de columna automáticos
    worksheet['!cols'] = [
      { wch: 8 },  // Puesto
      { wch: 20 }, // Tier
      { wch: 38 }, // Título
      { wch: 28 }, // Plataforma
      { wch: 35 }, // Géneros
      { wch: 55 }, // Notas
      { wch: 60 }, // Carátula (URL)
      { wch: 16 }, // Fecha
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Mi Ranking');

    XLSX.writeFile(workbook, filename);
  },

  /**
   * Exporta a archivo CSV con BOM UTF-8 y columna de carátula para compatibilidad universal con Excel y Google Sheets.
   */
  exportToCSV(games: Game[], filename = 'GameRank_Mis_Videojuegos.csv'): void {
    const headers = ['Puesto', 'Tier', 'Titulo', 'Plataforma', 'Generos', 'Notas', 'Caratula_URL', 'Fecha_Terminado'];

    const escapeCsv = (str: string | number) => {
      const stringValue = String(str ?? '');
      if (stringValue.includes(';') || stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const csvRows = [
      headers.join(';'), // Punto y coma habitual en Excel en español
      ...games.map((game) => {
        const tier = getTierForRank(game.rank);
        const cover = game.coverUrl || getCoverUrlForTitle(game.title) || '';
        return [
          game.rank,
          escapeCsv(tier.level),
          escapeCsv(game.title),
          escapeCsv(game.platform || 'Multiplataforma'),
          escapeCsv(game.genres.join(', ')),
          escapeCsv(game.notes || ''),
          escapeCsv(cover),
          escapeCsv(game.finishedDate || ''),
        ].join(';');
      }),
    ];

    const csvContent = '\uFEFF' + csvRows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Exporta respaldo completo en formato JSON con metadatos y carátulas
   */
  exportToJSON(games: Game[], filename = 'GameRank_Respaldo_Completo.json'): void {
    const payload: GameRankBackupPayload = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      totalGames: games.length,
      games: games.map((g) => ({
        ...g,
        coverUrl: g.coverUrl || getCoverUrlForTitle(g.title) || '',
      })),
    };

    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Parsea un archivo JSON o CSV importado y retorna la lista normalizada de juegos, recuperando carátulas y notas.
   */
  async parseImportedFile(file: File): Promise<Game[]> {
    const text = await file.text();

    if (file.name.endsWith('.json')) {
      let parsed = JSON.parse(text);

      // Compatibilidad con formato envoltorio { version, games } o arreglo directo [...]
      let rawList: any[] = [];
      if (Array.isArray(parsed)) {
        rawList = parsed;
      } else if (parsed && Array.isArray(parsed.games)) {
        rawList = parsed.games;
      } else {
        throw new Error('El archivo JSON no contiene una lista de videojuegos válida.');
      }

      if (rawList.length === 0) {
        throw new Error('El archivo JSON no tiene juegos registrados.');
      }

      return rawList.map((item, idx) => {
        const title = String(item.title || item.Título || item.Titulo || 'Sin título').trim();
        const detectedCover =
          item.coverUrl ||
          item.cover_url ||
          item['Carátula (URL)'] ||
          item['Caratula_URL'] ||
          item['Carátula'] ||
          item['Portada'] ||
          getCoverUrlForTitle(title) ||
          '';

        return {
          id: item.id || `imported-${Date.now()}-${idx}`,
          rank: idx + 1,
          title,
          platform: item.platform || item.Plataforma || 'Multiplataforma',
          genres: Array.isArray(item.genres)
            ? item.genres
            : typeof item.genres === 'string'
            ? item.genres.split(',').map((g: string) => g.trim()).filter(Boolean)
            : ['Acción'],
          notes: item.notes || item.Notas || '',
          coverUrl: detectedCover,
          finishedDate: item.finishedDate || item['Fecha Terminado'] || item['Fecha_Terminado'] || '',
        };
      });
    }

    if (file.name.endsWith('.csv')) {
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length <= 1) {
        throw new Error('El archivo CSV está vacío o solo contiene cabeceras.');
      }

      // Detectar separador (; o ,)
      const firstLine = lines[0];
      const delimiter = firstLine.includes(';') ? ';' : ',';

      const games: Game[] = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(delimiter);
        if (parts.length >= 2) {
          const rawTitle = parts[2] || parts[1] || `Juego ${i}`;
          const cleanTitle = rawTitle.replace(/^"|"$/g, '').trim();
          const cleanPlatform = (parts[3] || '').replace(/^"|"$/g, '').trim();
          const cleanGenres = (parts[4] || '')
            .replace(/^"|"$/g, '')
            .split(',')
            .map((g) => g.trim())
            .filter(Boolean);
          const cleanNotes = (parts[5] || '').replace(/^"|"$/g, '').trim();
          const cleanCover = (parts[6] || '').replace(/^"|"$/g, '').trim();

          if (cleanTitle) {
            games.push({
              id: `imported-csv-${Date.now()}-${i}`,
              rank: games.length + 1,
              title: cleanTitle,
              platform: cleanPlatform || 'Multiplataforma',
              genres: cleanGenres.length ? cleanGenres : ['Acción'],
              notes: cleanNotes,
              coverUrl: cleanCover || getCoverUrlForTitle(cleanTitle) || '',
            });
          }
        }
      }

      if (games.length === 0) {
        throw new Error('No se pudieron extraer filas válidas del archivo CSV.');
      }

      return games;
    }

    throw new Error('Formato no soportado. Por favor sube un archivo .json o .csv.');
  },
};
