import type { RatingTier } from '../types';

interface TeamRatingProps {
  rating: number;
  tier: RatingTier;
}

export function TeamRating({ rating, tier }: TeamRatingProps) {
  return (
    <div className="text-center">
      <p className="text-sm uppercase tracking-[0.3em] text-slate-400 mb-2">
        Team Rating
      </p>
      <div
        className="font-display text-8xl md:text-9xl leading-none"
        style={{ color: tier.color }}
      >
        {rating}
      </div>
      <p
        className="mt-3 text-2xl font-bold uppercase tracking-wider"
        style={{ color: tier.color }}
      >
        {tier.label}
      </p>
    </div>
  );
}
