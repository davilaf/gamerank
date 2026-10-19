import { Game, UserSettings } from '../types/game';
import { SEED_GAMES } from '../data/seedGames';
import { getCoverUrlForTitle } from './covers';

const STORAGE_KEY_GAMES = 'gamerank_my_games_v1';
const STORAGE_KEY_SETTINGS = 'gamerank_user_settings_v1';

export const DEFAULT_SETTINGS: UserSettings = {
  geminiApiKey: '',
  rawgApiKey: '',
  enableSounds: true,
  defaultView: 'list',
};

export const storageService = {
  getGames(): Game[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_GAMES);
      if (!data) {
        // First run: save seed games
        this.saveGames(SEED_GAMES);
        return SEED_GAMES;
      }
      const parsed: Game[] = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        this.saveGames(SEED_GAMES);
        return SEED_GAMES;
      }
      // Ensure ranks are normalized 1..N
      return this.normalizeRanks(parsed);
    } catch (e) {
      console.error('Error loading games from storage:', e);
      return SEED_GAMES;
    }
  },

  saveGames(games: Game[]): void {
    try {
      const normalized = this.normalizeRanks(games);
      localStorage.setItem(STORAGE_KEY_GAMES, JSON.stringify(normalized));
    } catch (e) {
      console.error('Error saving games to storage:', e);
    }
  },

  resetToSeedData(): Game[] {
    try {
      localStorage.removeItem(STORAGE_KEY_GAMES);
      this.saveGames(SEED_GAMES);
      return SEED_GAMES;
    } catch (e) {
      console.error('Error resetting to seed games:', e);
      return SEED_GAMES;
    }
  },

  getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (!data) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch (e) {
      console.error('Error loading settings:', e);
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings:', e);
    }
  },

  normalizeRanks(games: Game[]): Game[] {
    return games.map((game, index) => ({
      ...game,
      rank: index + 1,
      coverUrl: game.coverUrl || getCoverUrlForTitle(game.title),
    }));
  },
};
