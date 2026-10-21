import type { RatingTier } from '../types';

// Team strength tiers on the uncapped weighted card total (eight cards, 40–95
// each, MVP x1.1). Boundaries match the old 44–212 scale's tier breaks.
export const RATING_TIERS: RatingTier[] = [
  { min: 0, max: 467, label: 'Disaster', color: '#ef4444' },
  { min: 468, max: 526, label: 'Fringe Team', color: '#f97316' },
  { min: 527, max: 576, label: 'Playoff Team', color: '#eab308' },
  { min: 577, max: 618, label: 'Contender', color: '#22c55e' },
  { min: 619, max: 651, label: 'Juggernaut', color: '#3b82f6' },
  { min: 652, max: 673, label: 'Legendary', color: '#a855f7' },
  { min: 674, max: Infinity, label: 'Broken', color: '#f5c842' },
];

export function getRatingTier(rating: number): RatingTier {
  const tier = RATING_TIERS.find((t) => rating >= t.min && rating <= t.max);
  return tier ?? RATING_TIERS[0];
}
