import { getDraftGradeTier } from '../data/draftGrades';
import {
  MODE_LABELS,
  type DraftedPick,
  type DraftGradeTier,
  type GameMode,
  type PlayerCard,
} from '../types';
import { MVP_WEIGHT } from './teamRating';

/** A pick within this many value points of the board's best counts as close. */
const CLOSE_MARGIN = 10;

export type PickOutcome = 'best' | 'close' | 'miss';

export interface RoundReview {
  roundNumber: number;
  isMvp: boolean;
  pick: PlayerCard;
  best: PlayerCard;
  outcome: PickOutcome;
}

export interface DraftGradeResult {
  /** Share of each board's available value captured, 0–100. */
  accuracy: number;
  tier: DraftGradeTier;
  bestPicks: number;
  rounds: RoundReview[];
}

export function reviewPick(pick: DraftedPick): RoundReview {
  const board = pick.board.length > 0 ? pick.board : [pick.card];
  const best = board.reduce((top, card) =>
    card.normalizedValue > top.normalizedValue ? card : top,
  );
  const gap = best.normalizedValue - pick.card.normalizedValue;
  return {
    roundNumber: pick.roundNumber,
    isMvp: pick.slot === 'MVP',
    pick: pick.card,
    best,
    outcome: gap <= 0 ? 'best' : gap <= CLOSE_MARGIN ? 'close' : 'miss',
  };
}

/**
 * Accuracy compares each pick with the worst and best cards on its board.
 * Boards with a wide spread matter more than near-identical ones, and the MVP
 * board carries the same 10% weight it has in team strength.
 */
export function getDraftGrade(picks: DraftedPick[]): DraftGradeResult {
  let captured = 0;
  let available = 0;

  for (const pick of picks) {
    const values = (pick.board.length > 0 ? pick.board : [pick.card]).map(
      (card) => card.normalizedValue,
    );
    const weight = pick.slot === 'MVP' ? MVP_WEIGHT : 1;
    const worst = Math.min(...values);
    captured += weight * (pick.card.normalizedValue - worst);
    available += weight * (Math.max(...values) - worst);
  }

  const accuracy =
    available > 0 ? Math.round((captured / available) * 100) : 100;
  const rounds = picks.map(reviewPick);

  return {
    accuracy,
    tier: getDraftGradeTier(accuracy),
    bestPicks: rounds.filter((round) => round.outcome === 'best').length,
    rounds,
  };
}

const OUTCOME_EMOJI: Record<PickOutcome, string> = {
  best: '🟩',
  close: '🟨',
  miss: '🟥',
};

export function formatShareText(
  result: DraftGradeResult,
  mode: GameMode,
  teamStrength: number,
  teamTier: string,
): string {
  const squares = result.rounds
    .map((round) => (round.isMvp && round.outcome === 'best' ? '⭐' : OUTCOME_EMOJI[round.outcome]))
    .join('');
  return [
    `Draft Cards · ${MODE_LABELS[mode]}`,
    `${result.tier.grade} · ${result.tier.label} · ${result.accuracy}% accuracy`,
    squares,
    `Team strength ${teamStrength} · ${teamTier}`,
  ].join('\n');
}
