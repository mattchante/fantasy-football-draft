import type { ProgressionData } from './types';
import { migrateProgression } from './migrateProgression';

export const STORAGE_KEY = 'draft-cards-progression-v1';

export function createEmptyProgression(): ProgressionData {
  return {
    version: 1,
    totalDrafts: 0,
    totalScore: 0,
    bestScores: {},
    cardDraftCounts: {},
    history: [],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function sanitizeNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function sanitizeOptionalNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  return undefined;
}

/** Keeps only finite per-mode numbers, so unset modes stay absent. */
function sanitizeModeNumbers(value: unknown): { normal?: number; hard?: number } {
  const raw = isRecord(value) ? value : {};
  const result: { normal?: number; hard?: number } = {};
  for (const mode of ['normal', 'hard'] as const) {
    const number = sanitizeOptionalNumber(raw[mode]);
    if (number !== undefined) result[mode] = number;
  }
  return result;
}

function sanitizeAchievements(value: unknown): ProgressionData['achievements'] {
  if (!isRecord(value)) return {};
  const result: NonNullable<ProgressionData['achievements']> = {};
  for (const [id, record] of Object.entries(value)) {
    if (
      isRecord(record) &&
      typeof record.count === 'number' &&
      Number.isFinite(record.count) &&
      record.count > 0 &&
      typeof record.firstEarnedAt === 'string'
    ) {
      result[id] = {
        count: Math.floor(record.count),
        firstEarnedAt: record.firstEarnedAt,
      };
    }
  }
  return result;
}

function sanitizeStringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function sanitizeCardDraftCounts(value: unknown): Record<string, number> {
  if (!isRecord(value)) return {};
  const result: Record<string, number> = {};
  for (const [key, count] of Object.entries(value)) {
    if (
      typeof key === 'string' &&
      typeof count === 'number' &&
      Number.isFinite(count) &&
      count > 0
    ) {
      result[key] = Math.floor(count);
    }
  }
  return result;
}

function sanitizeHistory(value: unknown): ProgressionData['history'] {
  if (!Array.isArray(value)) return [];
  const entries: ProgressionData['history'] = [];

  for (const item of value) {
    if (!isRecord(item)) continue;
    if (item.mode !== 'normal' && item.mode !== 'hard') continue;
    if (typeof item.id !== 'string' || typeof item.completedAt !== 'string')
      continue;
    if (!Array.isArray(item.roster)) continue;

    const roster = item.roster
      .filter(
        (r): r is ProgressionData['history'][number]['roster'][number] => {
          if (!isRecord(r)) return false;
          return (
            typeof r.slot === 'string' &&
            typeof r.cardId === 'string' &&
            typeof r.name === 'string' &&
            typeof r.position === 'string' &&
            typeof r.team === 'string' &&
            typeof r.season === 'number'
          );
        },
      )
      .map((r) => ({
        slot: r.slot as ProgressionData['history'][number]['roster'][number]['slot'],
        cardId: r.cardId,
        name: r.name,
        position:
          r.position as ProgressionData['history'][number]['roster'][number]['position'],
        team: r.team,
        season: r.season,
      }));

    if (roster.length !== 8) continue;

    entries.push({
      id: item.id,
      completedAt: item.completedAt,
      mode: item.mode,
      rating: sanitizeNumber(item.rating),
      tierLabel:
        typeof item.tierLabel === 'string' ? item.tierLabel : 'Unknown',
      tierColor:
        typeof item.tierColor === 'string' ? item.tierColor : '#94a3b8',
      ...(typeof item.grade === 'string' &&
      typeof item.gradeColor === 'string' &&
      typeof item.accuracy === 'number' &&
      Number.isFinite(item.accuracy)
        ? {
            grade: item.grade,
            gradeColor: item.gradeColor,
            accuracy: item.accuracy,
          }
        : {}),
      roster,
      ...(Array.isArray(item.achievementIds)
        ? { achievementIds: sanitizeStringList(item.achievementIds) }
        : {}),
      ...(Array.isArray(item.missionIds)
        ? { missionIds: sanitizeStringList(item.missionIds) }
        : {}),
    });
  }

  return entries.slice(0, 25);
}

function sanitizeProgression(raw: unknown): ProgressionData {
  if (!isRecord(raw) || raw.version !== 1) {
    return createEmptyProgression();
  }


  return {
    version: 1,
    ...(isRecord(raw.missionWins) && {
      missionWins: sanitizeCardDraftCounts(raw.missionWins),
    }),
    achievements: sanitizeAchievements(raw.achievements),
    totalDrafts: Math.max(0, Math.floor(sanitizeNumber(raw.totalDrafts))),
    totalScore: Math.max(0, sanitizeNumber(raw.totalScore)),
    bestScores: sanitizeModeNumbers(raw.bestScores),
    bestAccuracy: sanitizeModeNumbers(raw.bestAccuracy),
    totalAccuracy: Math.max(0, sanitizeNumber(raw.totalAccuracy)),
    gradedDrafts: Math.max(0, Math.floor(sanitizeNumber(raw.gradedDrafts))),
    cardDraftCounts: sanitizeCardDraftCounts(raw.cardDraftCounts),
    history: sanitizeHistory(raw.history),
  };
}

export function loadProgression(): ProgressionData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return createEmptyProgression();
    return migrateProgression(sanitizeProgression(JSON.parse(stored)));
  } catch {
    return createEmptyProgression();
  }
}

export function saveProgression(progression: ProgressionData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progression));
  } catch {
    // Continue with in-memory state if storage is unavailable
  }
}

export function resetProgressionStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage failures
  }
}
