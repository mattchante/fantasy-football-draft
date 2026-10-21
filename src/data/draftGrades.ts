import type { DraftGradeTier } from '../types';

// Calibrated by simulation: random picks average ~51% accuracy, a box-score
// formula ~77%, formula plus flavor tags ~84%. An A takes real football knowledge.
export const DRAFT_GRADES: DraftGradeTier[] = [
  { min: 97, grade: 'A+', label: 'War Room Genius', color: '#f5c842' },
  { min: 92, grade: 'A', label: 'Draft Savant', color: '#a855f7' },
  { min: 87, grade: 'A-', label: 'Draft Savant', color: '#a855f7' },
  { min: 82, grade: 'B+', label: 'Sharp Scout', color: '#3b82f6' },
  { min: 76, grade: 'B', label: 'Sharp Scout', color: '#3b82f6' },
  { min: 70, grade: 'B-', label: 'Sharp Scout', color: '#3b82f6' },
  { min: 64, grade: 'C+', label: 'Coin-Flip GM', color: '#22c55e' },
  { min: 56, grade: 'C', label: 'Coin-Flip GM', color: '#22c55e' },
  { min: 48, grade: 'C-', label: 'Coin-Flip GM', color: '#22c55e' },
  { min: 35, grade: 'D', label: 'Reach City', color: '#f97316' },
  { min: 0, grade: 'F', label: 'Fired at the Podium', color: '#ef4444' },
];

export function getDraftGradeTier(accuracy: number): DraftGradeTier {
  return (
    DRAFT_GRADES.find((tier) => accuracy >= tier.min) ??
    DRAFT_GRADES[DRAFT_GRADES.length - 1]
  );
}

/** "B+ · 83%", or an em dash when there is no graded draft yet. */
export function formatGradeScore(accuracy: number | null | undefined): string {
  if (accuracy === null || accuracy === undefined) return '—';
  return `${getDraftGradeTier(accuracy).grade} · ${accuracy}%`;
}
