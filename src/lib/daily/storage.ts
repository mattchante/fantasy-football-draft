import {
  addDays,
  isValidDateKey,
  type DailyAction,
  type PickGrade,
} from './challenge';

export const DAILY_STORAGE_KEY = 'draft-cards-daily-v1';
const RESULTS_CAP = 60;

export interface DailyResult {
  dateKey: string;
  number: number;
  rating: number;
  tierLabel: string;
  tierColor: string;
  par: number;
  won: boolean;
  grades: PickGrade[];
  redrawRound: number | null;
  /** Streak after this result, captured for the share card. */
  streak: number;
}

export interface DailyData {
  version: 1;
  currentStreak: number;
  bestStreak: number;
  lastWonDate?: string;
  played: number;
  wins: number;
  /** Newest first. Locks each completed day and feeds the share card. */
  results: DailyResult[];
  inProgress?: { dateKey: string; actions: DailyAction[] };
}

export type DailyStatus = 'ready' | 'in-progress' | 'won' | 'lost';

export function createEmptyDaily(): DailyData {
  return {
    version: 1,
    currentStreak: 0,
    bestStreak: 0,
    played: 0,
    wins: 0,
    results: [],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function count(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? Math.floor(value)
    : 0;
}

function sanitizeActions(value: unknown): DailyAction[] | null {
  if (!Array.isArray(value)) return null;
  const actions: DailyAction[] = [];
  for (const item of value) {
    if (!isRecord(item)) return null;
    if (item.type === 'redraw') actions.push({ type: 'redraw' });
    else if (item.type === 'pick' && typeof item.cardId === 'string')
      actions.push({ type: 'pick', cardId: item.cardId });
    else return null;
  }
  return actions;
}

function sanitizeResult(item: unknown): DailyResult | null {
  if (!isRecord(item) || !isValidDateKey(item.dateKey)) return null;
  if (typeof item.rating !== 'number' || typeof item.par !== 'number')
    return null;
  const grades = Array.isArray(item.grades)
    ? item.grades.filter((g): g is PickGrade => g === 0 || g === 1 || g === 2)
    : [];
  return {
    dateKey: item.dateKey,
    number: count(item.number),
    rating: item.rating,
    tierLabel: typeof item.tierLabel === 'string' ? item.tierLabel : 'Unknown',
    tierColor:
      typeof item.tierColor === 'string' ? item.tierColor : '#94a3b8',
    par: item.par,
    won: item.won === true,
    grades,
    redrawRound: typeof item.redrawRound === 'number' ? item.redrawRound : null,
    streak: count(item.streak),
  };
}

function sanitizeDaily(raw: unknown): DailyData {
  if (!isRecord(raw) || raw.version !== 1) return createEmptyDaily();
  const results = Array.isArray(raw.results)
    ? raw.results
        .map(sanitizeResult)
        .filter((r): r is DailyResult => r !== null)
        .slice(0, RESULTS_CAP)
    : [];
  const progress = isRecord(raw.inProgress) ? raw.inProgress : null;
  const actions = progress ? sanitizeActions(progress.actions) : null;
  return {
    version: 1,
    currentStreak: count(raw.currentStreak),
    bestStreak: count(raw.bestStreak),
    lastWonDate: isValidDateKey(raw.lastWonDate) ? raw.lastWonDate : undefined,
    played: count(raw.played),
    wins: count(raw.wins),
    results,
    inProgress:
      progress && actions && isValidDateKey(progress.dateKey)
        ? { dateKey: progress.dateKey, actions }
        : undefined,
  };
}

export function loadDaily(): DailyData {
  try {
    const stored = localStorage.getItem(DAILY_STORAGE_KEY);
    return stored ? sanitizeDaily(JSON.parse(stored)) : createEmptyDaily();
  } catch {
    return createEmptyDaily();
  }
}

export function saveDaily(daily: DailyData): void {
  try {
    localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify(daily));
  } catch {
    // Continue in memory if storage is unavailable
  }
}

export function resetDailyStorage(): void {
  try {
    localStorage.removeItem(DAILY_STORAGE_KEY);
  } catch {
    // Ignore storage failures
  }
}

export function getDailyResult(
  daily: DailyData,
  dateKey: string,
): DailyResult | undefined {
  return daily.results.find((r) => r.dateKey === dateKey);
}

export function getDailyStatus(daily: DailyData, dateKey: string): DailyStatus {
  const result = getDailyResult(daily, dateKey);
  if (result) return result.won ? 'won' : 'lost';
  if (daily.inProgress?.dateKey === dateKey) return 'in-progress';
  return 'ready';
}

/** A streak survives until a loss or a full missed day. */
export function getActiveStreak(daily: DailyData, today: string): number {
  if (!daily.lastWonDate) return 0;
  return daily.lastWonDate === today || daily.lastWonDate === addDays(today, -1)
    ? daily.currentStreak
    : 0;
}

export function setDailyProgress(
  daily: DailyData,
  dateKey: string,
  actions: DailyAction[],
): DailyData {
  return { ...daily, inProgress: { dateKey, actions } };
}

export function recordDailyResult(
  daily: DailyData,
  result: Omit<DailyResult, 'streak'>,
): { daily: DailyData; result: DailyResult } {
  const existing = getDailyResult(daily, result.dateKey);
  if (existing) return { daily, result: existing };

  const continues =
    daily.lastWonDate !== undefined &&
    daily.lastWonDate === addDays(result.dateKey, -1);
  const currentStreak = result.won
    ? (continues ? daily.currentStreak : 0) + 1
    : 0;
  const saved: DailyResult = { ...result, streak: currentStreak };

  return {
    result: saved,
    daily: {
      version: 1,
      currentStreak,
      bestStreak: Math.max(daily.bestStreak, currentStreak),
      lastWonDate: result.won ? result.dateKey : daily.lastWonDate,
      played: daily.played + 1,
      wins: daily.wins + (result.won ? 1 : 0),
      results: [saved, ...daily.results].slice(0, RESULTS_CAP),
      inProgress: undefined,
    },
  };
}
