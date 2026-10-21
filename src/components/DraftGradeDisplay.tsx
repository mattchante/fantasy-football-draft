import type { DraftGradeTier } from '../types';

interface DraftGradeDisplayProps {
  tier: DraftGradeTier;
  accuracy: number;
}

export function DraftGradeDisplay({ tier, accuracy }: DraftGradeDisplayProps) {
  return (
    <div className="text-center py-4">
      <p className="text-sm uppercase tracking-[0.3em] text-theme-muted mb-3">
        Draft Grade
      </p>
      <div
        className="font-display text-8xl md:text-9xl leading-none rating-glow"
        style={{ color: tier.color }}
      >
        {tier.grade}
      </div>
      <p className="mt-4">
        <span className="tier-badge" style={{ color: tier.color }}>
          {tier.label}
        </span>
      </p>
      <p className="grade-accuracy">{accuracy}% draft accuracy</p>
    </div>
  );
}
