import type { RatingTier } from '../types';

export const RATING_TIERS: RatingTier[] = [
  { min: 44, max: 84, label: 'Disaster', color: '#ef4444' },
  { min: 85, max: 119, label: 'Fringe Team', color: '#f97316' },
  { min: 120, max: 149, label: 'Playoff Team', color: '#eab308' },
  { min: 150, max: 174, label: 'Contender', color: '#22c55e' },
  { min: 175, max: 194, label: 'Juggernaut', color: '#3b82f6' },
  { min: 195, max: 207, label: 'Legendary', color: '#a855f7' },
  { min: 208, max: 212, label: 'Broken', color: '#f5c842' },
];

export function getRatingTier(rating: number): RatingTier {
  const tier = RATING_TIERS.find((t) => rating >= t.min && rating <= t.max);
  return tier ?? RATING_TIERS[0];
}
