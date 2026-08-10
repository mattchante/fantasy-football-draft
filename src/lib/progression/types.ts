import type { GameMode, Position, RosterSlot } from '../../types';

export interface HistoryRosterEntry {
  slot: RosterSlot;
  cardId: string;
  name: string;
  position: Position;
  team: string;
  season: number;
}

export interface CompletedDraftSnapshot {
  id: string;
  completedAt: string;
  mode: GameMode;
  rating: number;
  tierLabel: string;
  tierColor: string;
  roster: HistoryRosterEntry[];
}

export interface ProgressionData {
  version: 1;
  totalDrafts: number;
  totalScore: number;
  bestScores: {
    normal?: number;
    hard?: number;
  };
  cardDraftCounts: Record<string, number>;
  history: CompletedDraftSnapshot[];
}

export interface CompletionFeedback {
  isPersonalBest: boolean;
  newCardIds: string[];
}

export interface PersonalRecordsSummary {
  bestNormal: number | null;
  bestHard: number | null;
  totalDrafts: number;
  averageScore: number | null;
}

export interface MostDraftedCard {
  cardId: string;
  name: string;
  season: number;
  count: number;
}

export interface VaultSummary {
  uniqueCollected: number;
  totalAvailable: number;
  completionPercent: number;
  totalSelections: number;
  mostDrafted: MostDraftedCard | null;
}

export const HISTORY_CAP = 25;
