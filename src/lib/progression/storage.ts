import type { ProgressionData } from './types';

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

function sanitizeCardDraftCounts(value: unknown): Record<string, number> {
  if (!isRecord(value)) return {};
  const result: Record<string, number> = {};
  for (const [key, count] of Object.entries(value)) {
    if (typeof key === 'string' && typeof count === 'number' && Number.isFinite(count) && count > 0) {
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
    if (typeof item.id !== 'string' || typeof item.completedAt !== 'string') continue;
    if (!Array.isArray(item.roster)) continue;

    const roster = item.roster
      .filter((r): r is ProgressionData['history'][number]['roster'][number] => {
        if (!isRecord(r)) return false;
        return (
          typeof r.slot === 'string' &&
          typeof r.cardId === 'string' &&
          typeof r.name === 'string' &&
          typeof r.position === 'string' &&
          typeof r.team === 'string' &&
          typeof r.season === 'number'
        );
      })
      .map((r) => ({
        slot: r.slot as ProgressionData['history'][number]['roster'][number]['slot'],
        cardId: r.cardId,
        name: r.name,
        position: r.position as ProgressionData['history'][number]['roster'][number]['position'],
        team: r.team,
        season: r.season,
      }));

    if (roster.length !== 8) continue;

    entries.push({
      id: item.id,
      completedAt: item.completedAt,
      mode: item.mode,
      rating: sanitizeNumber(item.rating),
      tierLabel: typeof item.tierLabel === 'string' ? item.tierLabel : 'Unknown',
      tierColor: typeof item.tierColor === 'string' ? item.tierColor : '#94a3b8',
      roster,
    });
  }

  return entries.slice(0, 25);
}

function sanitizeProgression(raw: unknown): ProgressionData {
  if (!isRecord(raw) || raw.version !== 1) {
    return createEmptyProgression();
  }

  const bestScoresRaw = isRecord(raw.bestScores) ? raw.bestScores : {};

  return {
    version: 1,
    totalDrafts: Math.max(0, Math.floor(sanitizeNumber(raw.totalDrafts))),
    totalScore: Math.max(0, sanitizeNumber(raw.totalScore)),
    bestScores: {
      normal: sanitizeOptionalNumber(bestScoresRaw.normal),
      hard: sanitizeOptionalNumber(bestScoresRaw.hard),
    },
    cardDraftCounts: sanitizeCardDraftCounts(raw.cardDraftCounts),
    history: sanitizeHistory(raw.history),
  };
}

export function loadProgression(): ProgressionData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return createEmptyProgression();
    return sanitizeProgression(JSON.parse(stored));
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
