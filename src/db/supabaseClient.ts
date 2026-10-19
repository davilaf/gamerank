import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface CloudConfig {
  url: string;
  anonKey: string;
  enabled: boolean;
}

// Configuración por defecto de tu proyecto de Supabase
export const DEFAULT_SUPABASE_URL = 'https://codglqxzkelwzjyndpci.supabase.co';
export const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvZGdscXh6a2Vsd3pqeW5kcGNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1MjM1ODQsImV4cCI6MjEwMzA5OTU4NH0.kGdJIo1ZUWpzNlAZ_KeImj-Gd83scNlHEUZjCfKHcqI';

export const getStoredCloudConfig = (): CloudConfig => {
  try {
    const raw = localStorage.getItem('fd_pos_supabase_config');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.url && parsed.anonKey) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error leyendo config de Supabase:', e);
  }

  // Usar configuración predeterminada integrada
  return {
    url: (import.meta as any).env?.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL,
    anonKey: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY,
    enabled: true
  };
};

export const saveCloudConfig = (config: CloudConfig) => {
  localStorage.setItem('fd_pos_supabase_config', JSON.stringify(config));
  _cachedClient = null; // Reiniciar cliente
};

let _cachedClient: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (_cachedClient) return _cachedClient;

  const config = getStoredCloudConfig();
  if (!config.enabled || !config.url || !config.anonKey) {
    return null;
  }

  try {
    _cachedClient = createClient(config.url.trim(), config.anonKey.trim());
    return _cachedClient;
  } catch (err) {
    console.error('Error inicializando cliente de Supabase:', err);
    return null;
  }
};
