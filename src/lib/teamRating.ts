import { getRatingTier } from '../data/ratingTiers';
import type { RosterState } from '../types';
import { getRosterCards } from './roster';

export const MVP_WEIGHT = 1.1;

export function calculateRawScore(roster: RosterState): number {
  const cards = getRosterCards(roster);
  let total = 0;

  for (const { slot, card } of cards) {
    const value = slot === 'MVP' ? card.normalizedValue * MVP_WEIGHT : card.normalizedValue;
    total += value;
  }

  return total;
}

/** Team strength is the uncapped weighted card total, rounded for display. */
export function calculateTeamRating(roster: RosterState): number {
  return Math.round(calculateRawScore(roster));
}

export function getTeamRatingResult(roster: RosterState) {
  const rating = calculateTeamRating(roster);
  const tier = getRatingTier(rating);
  const rawScore = calculateRawScore(roster);

  return { rating, tier, rawScore };
}
