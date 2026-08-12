import cardIdAliases from '../../data/card-id-migration-aliases.json';
import type { ProgressionData } from './types';

const ALIASES = cardIdAliases.cardIdAliases as Record<string, string>;

export function migrateProgression(progression: ProgressionData): ProgressionData {
  const counts = { ...progression.cardDraftCounts };

  for (const [aliasId, canonicalId] of Object.entries(ALIASES)) {
    const aliasCount = counts[aliasId];
    if (aliasCount === undefined || aliasCount <= 0) continue;

    counts[canonicalId] = (counts[canonicalId] ?? 0) + aliasCount;
    delete counts[aliasId];
  }

  const history = progression.history.map((entry) => ({
    ...entry,
    roster: entry.roster.map((slot) => ({
      ...slot,
      cardId: ALIASES[slot.cardId] ?? slot.cardId,
    })),
  }));

  return {
    ...progression,
    cardDraftCounts: counts,
    history,
  };
}

export function getCardIdAliases(): Record<string, string> {
  return { ...ALIASES };
}
