import type { RatingTier } from '../types';

interface TeamRatingProps {
  rating: number;
  tier: RatingTier;
}

export function TeamRating({ rating, tier }: TeamRatingProps) {
  return (
    <div className="text-center py-4">
      <p className="text-sm uppercase tracking-[0.3em] text-theme-muted mb-3">
        Team Rating
      </p>
      <div
        className="font-display text-8xl md:text-9xl leading-none rating-glow"
        style={{ color: tier.color }}
      >
        {rating}
      </div>
      <p className="mt-4">
        <span className="tier-badge" style={{ color: tier.color }}>
          {tier.label}
        </span>
      </p>
    </div>
  );
}
