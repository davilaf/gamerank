export type TierLevel = 'S' | 'A' | 'B' | 'C' | 'D';

export interface TierInfo {
  level: TierLevel;
  name: string;
  minRank: number;
  maxRank: number;
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
  badgeBg: string;
  label: string;
  description: string;
}

export interface Game {
  id: string;
  rank: number; // 1 to N correlative
  title: string;
  platform?: string;
  genres: string[];
  notes?: string;
  finishedDate?: string;
  coverUrl?: string;
  rating?: number; // 1-10
}

export interface DuelStep {
  low: number;
  high: number;
  mid: number;
  comparedGame: Game;
  round: number;
  totalEstimatedRounds: number;
}

export interface DuelState {
  isActive: boolean;
  newGame: Partial<Game>;
  low: number;
  high: number;
  history: DuelStep[];
  currentStep: DuelStep | null;
  isComplete: boolean;
  calculatedRank: number | null;
}

export interface Recommendation {
  id: string;
  title: string;
  genres: string[];
  platform: string;
  matchScore: number; // 0-100%
  whyYouWillLoveIt: string;
  connectedWith: string[]; // titles from user's top games
  coverUrl?: string;
  synopsis?: string;
  source?: 'curated' | 'gemini';
}

export interface UserSettings {
  geminiApiKey?: string;
  rawgApiKey?: string;
  enableSounds: boolean;
  defaultView: 'list' | 'tiers' | 'compact';
}

export interface FilterOptions {
  searchQuery: string;
  selectedGenres: string[];
  selectedTier: TierLevel | 'ALL';
  selectedPlatform: string | 'ALL';
  sortBy: 'rank-asc' | 'rank-desc' | 'title-asc' | 'title-desc';
}
