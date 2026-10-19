import { applyPick, redrawRound, startDraft } from '../draftEngine';
import { createSeededRng } from '../random';
import { getTeamRatingResult } from '../teamRating';
import type { DraftState, GameMode, RosterState } from '../../types';

/** The Daily Challenge always uses Hard rules: identity and season only. */
export const DAILY_MODE: GameMode = 'hard';
/** Challenge #1. Numbers count calendar days from here. */
export const DAILY_EPOCH = '2026-10-19';
const PAR_SAMPLES = 25;
const PAR_PERCENTILE = 0.75;
const DAY_MS = 86_400_000;

export type DailyAction = { type: 'pick'; cardId: string } | { type: 'redraw' };

/** How the chosen card ranked by value on its board: 0 best, 2 worst. */
export type PickGrade = 0 | 1 | 2;

/** Local calendar date, so a day's challenge starts at the player's midnight. */
export function getDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function dayIndex(dateKey: string): number {
  const [y, m, d] = dateKey.split('-').map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / DAY_MS);
}

export function isValidDateKey(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function addDays(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d) + days * DAY_MS)
    .toISOString()
    .slice(0, 10);
}

export function getChallengeNumber(dateKey: string): number {
  return dayIndex(dateKey) - dayIndex(DAILY_EPOCH) + 1;
}

export function getDailySeed(dateKey: string): string {
  return `draft-cards-daily:${dateKey}`;
}

export function formatDateKey(
  dateKey: string,
  style: 'short' | 'long' = 'long',
): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: style === 'long' ? 'short' : undefined,
    month: 'short',
    day: 'numeric',
    year: style === 'long' ? 'numeric' : undefined,
  });
}

/** Milliseconds until the player's next local midnight. */
export function msUntilNextChallenge(now: Date = new Date()): number {
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return next.getTime() - now.getTime();
}

export function startDailyDraft(dateKey: string) {
  return startDraft({ seed: getDailySeed(dateKey) });
}

/**
 * Par is the 75th-percentile rating of 25 blind drafts (random picks, no
 * redraw) through the same seeded boards. Everyone gets the same number, and
 * guessing alone clears it only about a quarter of the time.
 */
const parCache = new Map<string, number>();
export function getDailyPar(dateKey: string): number {
  const cached = parCache.get(dateKey);
  if (cached !== undefined) return cached;
  const rng = createSeededRng(`${getDailySeed(dateKey)}:par`);
  const ratings: number[] = [];
  for (let i = 0; i < PAR_SAMPLES; i++) {
    let { draftState, roster } = startDailyDraft(dateKey);
    while (!draftState.isComplete) {
      const cards = draftState.currentRound!.cards;
      const card = cards[Math.floor(rng() * cards.length)];
      ({ draftState, roster } = applyPick(draftState, roster, card.id));
    }
    ratings.push(getTeamRatingResult(roster).rating);
  }
  ratings.sort((a, b) => a - b);
  const par = ratings[Math.floor(ratings.length * PAR_PERCENTILE)];
  parCache.set(dateKey, par);
  return par;
}

export function gradePick(state: DraftState, cardId: string): PickGrade {
  const cards = state.currentRound?.cards ?? [];
  const chosen = cards.find((card) => card.id === cardId);
  if (!chosen) return 2;
  const better = cards.filter(
    (card) => card.normalizedValue > chosen.normalizedValue,
  ).length;
  return Math.min(better, 2) as PickGrade;
}

/** Which action turned `prev` into `next`, so the daily can be saved as it is played. */
export function deriveDailyAction(
  prev: DraftState,
  next: DraftState,
): DailyAction | null {
  if (next.picks.length === prev.picks.length + 1) {
    return { type: 'pick', cardId: next.picks.at(-1)!.card.id };
  }
  if (next.redrawsRemaining === prev.redrawsRemaining - 1) {
    return { type: 'redraw' };
  }
  return null;
}

export interface DailyReplay {
  draftState: DraftState;
  roster: RosterState;
  grades: PickGrade[];
  redrawRound: number | null;
}

/**
 * Rebuild a daily draft from its saved actions. Boards are deterministic, so
 * this restores an unfinished challenge exactly and prevents a re-roll.
 * Returns null if the actions no longer apply (for example, a dataset change).
 */
export function replayDaily(
  dateKey: string,
  actions: DailyAction[],
): DailyReplay | null {
  try {
    let { draftState, roster } = startDailyDraft(dateKey);
    const grades: PickGrade[] = [];
    let redrawRoundNumber: number | null = null;
    for (const action of actions) {
      if (draftState.isComplete) return null;
      if (action.type === 'redraw') {
        const next = redrawRound(draftState, roster);
        if (next === draftState) return null;
        redrawRoundNumber = draftState.roundNumber;
        draftState = next;
      } else {
        grades.push(gradePick(draftState, action.cardId));
        ({ draftState, roster } = applyPick(
          draftState,
          roster,
          action.cardId,
        ));
      }
    }
    return { draftState, roster, grades, redrawRound: redrawRoundNumber };
  } catch {
    return null;
  }
}
