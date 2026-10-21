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
  achievementIds?: string[];
  /** Legacy side missions (retired). Kept in saves, no longer shown. */
  missionIds?: string[];
}

export interface AchievementRecord {
  count: number;
  firstEarnedAt: string;
}

export interface ProgressionData {
  version: 1;
  /** Legacy side-mission stamps (retired). Kept in saves, no longer shown. */
  missionWins?: Record<string, number>;
  achievements?: Record<string, AchievementRecord>;
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
  /** Achievements counted for this draft, in collection order. */
  earnedAchievementIds: string[];
  /** The subset unlocked for the first time. */
  newAchievementIds: string[];
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
