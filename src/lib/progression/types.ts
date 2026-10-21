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
  /** Draft grade fields; absent on drafts completed before grading existed. */
  grade?: string;
  gradeColor?: string;
  accuracy?: number;
  roster: HistoryRosterEntry[];
  missionIds?: string[];
}

export interface ProgressionData {
  version: 1;
  missionWins?: Record<string, number>;
  totalDrafts: number;
  totalScore: number;
  /** Legacy team-rating bests (old 44–212 scale). Kept, no longer shown. */
  bestScores: {
    normal?: number;
    hard?: number;
  };
  /** Best draft accuracy (0–100) per mode. */
  bestAccuracy?: {
    normal?: number;
    hard?: number;
  };
  totalAccuracy?: number;
  gradedDrafts?: number;
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
  averageAccuracy: number | null;
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
