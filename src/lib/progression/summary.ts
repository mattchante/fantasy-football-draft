import type { PlayerCard } from '../../types';
import type {
  PersonalRecordsSummary,
  ProgressionData,
  VaultSummary,
} from './types';

export function isCardCollected(count: number): boolean {
  return count >= 1;
}

export function getPersonalRecords(progression: ProgressionData): PersonalRecordsSummary {
  const { bestScores, totalDrafts, totalScore } = progression;

  return {
    bestNormal: bestScores.normal ?? null,
    bestHard: bestScores.hard ?? null,
    totalDrafts,
    averageScore: totalDrafts > 0 ? Math.round(totalScore / totalDrafts) : null,
  };
}

export function getVaultSummary(
  progression: ProgressionData,
  allCards: PlayerCard[],
): VaultSummary {
  const totalAvailable = allCards.length;
  let uniqueCollected = 0;
  let totalSelections = 0;

  for (const card of allCards) {
    const count = progression.cardDraftCounts[card.id] ?? 0;
    totalSelections += count;
    if (count >= 1) uniqueCollected++;
  }

  const completionPercent =
    totalAvailable > 0 ? Math.round((uniqueCollected / totalAvailable) * 100) : 0;

  let mostDrafted: VaultSummary['mostDrafted'] = null;

  if (progression.totalDrafts > 0) {
    let bestCount = 0;
    let bestCardId = '';

    for (const card of allCards) {
      const count = progression.cardDraftCounts[card.id] ?? 0;
      if (count > bestCount || (count === bestCount && count > 0 && card.id < bestCardId)) {
        bestCount = count;
        bestCardId = card.id;
      }
    }

    if (bestCount > 0 && bestCardId) {
      const card = allCards.find((c) => c.id === bestCardId);
      if (card) {
        mostDrafted = {
          cardId: card.id,
          name: card.name,
          season: card.season,
          count: bestCount,
        };
      }
    }
  }

  return {
    uniqueCollected,
    totalAvailable,
    completionPercent,
    totalSelections,
    mostDrafted,
  };
}
