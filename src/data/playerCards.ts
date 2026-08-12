import type { PlayerCard, PlayerStats, PlayerStatus, Position } from '../types';
import enrichedCards from './draft-cards-enriched-350.json';

interface EnrichedCard {
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
  jerseyNumber: number | null;
}

function toPlayerCard(raw: EnrichedCard): PlayerCard {
  return {
    id: raw.id,
    playerId: raw.playerId,
    name: raw.name,
    position: raw.position,
    team: raw.team,
    status: raw.status,
    season: raw.season,
    imageUrl: raw.imageUrl,
    stats: raw.stats,
    fantasyPoints: raw.fantasyPoints,
    fantasyPointsPerGame: raw.fantasyPointsPerGame,
    normalizedValue: raw.normalizedValue,
    headlineStats: raw.headlineStats,
    flavorTag: raw.flavorTag,
    badges: raw.badges,
    categoryIds: raw.categoryIds,
    mvpEligible: raw.mvpEligible,
    jerseyNumber: raw.jerseyNumber ?? undefined,
  };
}

export const PLAYER_CARDS: PlayerCard[] = (enrichedCards as EnrichedCard[]).map(toPlayerCard);

export const PLAYER_CARD_MAP: Map<string, PlayerCard> = new Map(
  PLAYER_CARDS.map((c) => [c.id, c]),
);

export function getCardById(id: string): PlayerCard | undefined {
  return PLAYER_CARD_MAP.get(id);
}

export function getMvpEligibleCards(): PlayerCard[] {
  return PLAYER_CARDS.filter((c) => c.mvpEligible);
}

export function getCardsByCategory(categoryId: string): PlayerCard[] {
  return PLAYER_CARDS.filter((c) => c.categoryIds.includes(categoryId));
}
