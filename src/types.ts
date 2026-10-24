export type Position = 'QB' | 'RB' | 'WR' | 'TE';

export type RosterSlot =
  | 'QB'
  | 'RB1'
  | 'RB2'
  | 'WR1'
  | 'WR2'
  | 'TE'
  | 'FLEX'
  | 'MVP';

export type PlayerStatus = 'current' | 'legend' | 'special';

export interface PlayerStats {
  passYds?: number;
  passTD?: number;
  interceptions?: number;
  rushYds?: number;
  rushTD?: number;
  receptions?: number;
  recYds?: number;
  recTD?: number;
  games?: number;
}

export interface PlayerCard {
  id: string;
  playerId: string;
  name: string;
  position: Position;
  team: string;
  status: PlayerStatus;
  season: number;
  imageUrl: string;
  stats: PlayerStats;
  fantasyPoints: number;
  fantasyPointsPerGame: number;
  normalizedValue: number;
  headlineStats: string[];
  flavorTag: string;
  badges: string[];
  categoryIds: string[];
  mvpEligible: boolean;
  jerseyNumber?: number;
}

export interface RoundTheme {
  id: string;
  title: string;
  description: string;
  categoryIds: string[];
  isMvpRound?: boolean;
}

export interface GeneratedRound {
  theme: RoundTheme;
  cards: PlayerCard[];
  roundNumber: number;
  isMvpRound: boolean;
}

export interface DraftedPick {
  card: PlayerCard;
  slot: RosterSlot;
  roundNumber: number;
  /** Every card offered on the final board for this pick, including the pick. */
  board: PlayerCard[];
}

export interface DraftState {
  roundNumber: number;
  picks: DraftedPick[];
  draftedCardIds: Set<string>;
  draftedPlayerIds: Set<string>;
  offeredCardIds: Set<string>;
  usedThemeIds: string[];
  currentRound: GeneratedRound | null;
  isComplete: boolean;
  redrawsRemaining: number;
}

export type RosterState = Record<RosterSlot, PlayerCard | null>;

export interface RemainingNeeds {
  qb: number;
  rb: number;
  wr: number;
  te: number;
  flex: number;
  mvp: number;
  normalPicksRemaining: number;
}

export interface RatingTier {
  min: number;
  max: number;
  label: string;
  color: string;
}

export interface DraftGradeTier {
  min: number;
  grade: string;
  label: string;
  color: string;
}

export type GamePhase =
  | 'home'
  | 'draft'
  | 'reveal'
  | 'history'
  | 'vault'
  | 'achievements';

/**
 * Saved drafts keep these original ids: 'normal' is shown as Easy (box
 * scores) and 'hard' as Normal (no stats). Use MODE_LABELS for display.
 */
export type GameMode = 'normal' | 'hard';

export const MODE_LABELS: Record<GameMode, string> = {
  normal: 'Easy',
  hard: 'Normal',
};

export type CardInfoLevel = 'full' | 'scouting' | 'identity';

export interface CompletionFeedback {
  isPersonalBest: boolean;
  newCardIds: string[];
  /** Achievements counted for this draft, in collection order. */
  earnedAchievementIds: string[];
  /** The subset unlocked for the first time. */
  newAchievementIds: string[];
}
