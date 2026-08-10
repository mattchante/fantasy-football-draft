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
}

export interface DraftState {
  roundNumber: number;
  picks: DraftedPick[];
  draftedCardIds: Set<string>;
  offeredCardIds: Set<string>;
  usedThemeIds: string[];
  currentRound: GeneratedRound | null;
  isComplete: boolean;
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

export type GamePhase = 'home' | 'draft' | 'reveal' | 'history' | 'vault';

export type GameMode = 'normal' | 'hard';

export type CardInfoLevel = 'full' | 'identity';

export interface CompletionFeedback {
  isPersonalBest: boolean;
  newCardIds: string[];
}
