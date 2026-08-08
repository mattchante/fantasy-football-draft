import { getRatingTier } from '../data/ratingTiers';
import type { RosterState } from '../types';
import { getRosterCards } from './roster';

export const MVP_WEIGHT = 1.1;

// Calibrated against curated dataset: raw scores typically range ~450–700
const MIN_EXPECTED = 400;
const MAX_EXPECTED = 680;

export function calculateRawScore(roster: RosterState): number {
  const cards = getRosterCards(roster);
  let total = 0;

  for (const { slot, card } of cards) {
    const value = slot === 'MVP' ? card.normalizedValue * MVP_WEIGHT : card.normalizedValue;
    total += value;
  }

  return total;
}

export function calculateTeamRating(roster: RosterState): number {
  const rawScore = calculateRawScore(roster);
  const rating = 44 + ((rawScore - MIN_EXPECTED) / (MAX_EXPECTED - MIN_EXPECTED)) * 168;
  return Math.round(Math.max(44, Math.min(212, rating)));
}

export function getTeamRatingResult(roster: RosterState) {
  const rating = calculateTeamRating(roster);
  const tier = getRatingTier(rating);
  const rawScore = calculateRawScore(roster);

  return { rating, tier, rawScore };
}
