import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Game } from '../types/game';

const DEFAULT_SUPABASE_URL = 'https://codglqxzkelwzjyndpci.supabase.co';
const DEFAULT_SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvZGdscXh6a2Vsd3pqeW5kcGNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1MjM1ODQsImV4cCI6MjEwMzA5OTU4NH0.kGdJIo1ZUWpzNlAZ_KeImj-Gd83scNlHEUZjCfKHcqI';

const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const SUPABASE_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY;

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

const STORAGE_SYNC_KEY = 'gamerank_sync_code';
const STORAGE_LAST_SYNCED_KEY = 'gamerank_last_synced_at';
export const DEFAULT_SYNC_CODE = 'mi-ranking';

export type SyncState = 'synced' | 'syncing' | 'offline' | 'error';

/**
 * Obtiene el código de sincronización actual o el por defecto
 */
export function getSyncCode(): string {
  // Comprobar primero si viene en la URL como ?sync=CODIGO
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const syncParam = urlParams.get('sync');
    if (syncParam && syncParam.trim()) {
      const clean = syncParam.trim().toLowerCase();
      localStorage.setItem(STORAGE_SYNC_KEY, clean);
      return clean;
    }
  } catch (e) {
    // ignorar en SSR
  }

  const stored = localStorage.getItem(STORAGE_SYNC_KEY);
  if (stored && stored.trim()) {
    return stored.trim();
  }
  localStorage.setItem(STORAGE_SYNC_KEY, DEFAULT_SYNC_CODE);
  return DEFAULT_SYNC_CODE;
}

/**
 * Guarda un nuevo código de sincronización
 */
export function setSyncCode(code: string): string {
  const clean = (code || DEFAULT_SYNC_CODE).trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
  const finalCode = clean || DEFAULT_SYNC_CODE;
  localStorage.setItem(STORAGE_SYNC_KEY, finalCode);
  return finalCode;
}

export function getLastSyncedAt(): string | null {
  return localStorage.getItem(STORAGE_LAST_SYNCED_KEY);
}

export function setLastSyncedAt(timestamp: string): void {
  localStorage.setItem(STORAGE_LAST_SYNCED_KEY, timestamp);
}

/**
 * ID interno en la base de datos para la bóveda
 */
function getVaultRowId(code: string): string {
  return `gamerank_vault_${code}`;
}

/**
 * Sube la lista completa de juegos a la nube (Supabase)
 */
export async function pushGamesToCloud(
  games: Game[],
  customCode?: string
): Promise<{ success: boolean; timestamp?: string; error?: string }> {
  try {
    const code = customCode || getSyncCode();
    const rowId = getVaultRowId(code);
    const nowIso = new Date().toISOString();

    const payload = {
      id: rowId,
      name: JSON.stringify(games),
      color: '#6366f1',
      icon: nowIso, // Usamos icon como timestamp ISO de última actualización
    };

    const { error } = await supabase.from('categories').upsert(payload, { onConflict: 'id' });

    if (error) {
      console.error('[CloudSync] Error al subir a la nube:', error.message);
      return { success: false, error: error.message };
    }

    setLastSyncedAt(nowIso);
    return { success: true, timestamp: nowIso };
  } catch (err: any) {
    console.error('[CloudSync] Error inesperado en push:', err);
    return { success: false, error: err?.message || 'Error de conexión' };
  }
}

/**
 * Descarga la lista completa de juegos de la nube (Supabase)
 */
export async function pullGamesFromCloud(
  customCode?: string
): Promise<{ success: boolean; games?: Game[]; timestamp?: string; error?: string }> {
  try {
    const code = customCode || getSyncCode();
    const rowId = getVaultRowId(code);

    const { data, error } = await supabase
      .from('categories')
      .select('id, name, icon')
      .eq('id', rowId)
      .maybeSingle();

    if (error) {
      console.error('[CloudSync] Error al descargar de la nube:', error.message);
      return { success: false, error: error.message };
    }

    if (!data || !data.name) {
      // No hay datos aún para esta bóveda en la nube
      return { success: true, games: undefined, timestamp: undefined };
    }

    const parsedGames = JSON.parse(data.name) as Game[];
    if (Array.isArray(parsedGames) && parsedGames.length > 0) {
      const timestamp = data.icon || new Date().toISOString();
      setLastSyncedAt(timestamp);
      return { success: true, games: parsedGames, timestamp };
    }

    return { success: true, games: undefined };
  } catch (err: any) {
    console.error('[CloudSync] Error inesperado en pull:', err);
    return { success: false, error: err?.message || 'Error al procesar datos' };
  }
}

/**
 * Escucha cambios en tiempo real en la nube para actualizar el teléfono o PC automáticamente
 */
export function subscribeToCloudChanges(
  onUpdate: (remoteGames: Game[], timestamp: string) => void,
  customCode?: string
): () => void {
  const code = customCode || getSyncCode();
  const rowId = getVaultRowId(code);

  const channel = supabase
    .channel(`realtime-gamerank-${code}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'categories',
        filter: `id=eq.${rowId}`,
      },
      (payload) => {
        try {
          const newRecord = payload.new as { id?: string; name?: string; icon?: string } | undefined;
          if (newRecord && newRecord.name) {
            const parsed = JSON.parse(newRecord.name) as Game[];
            if (Array.isArray(parsed) && parsed.length > 0) {
              const ts = newRecord.icon || new Date().toISOString();
              setLastSyncedAt(ts);
              onUpdate(parsed, ts);
            }
          }
        } catch (e) {
          console.error('[CloudSync Realtime] Error parseando datos remotos:', e);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
