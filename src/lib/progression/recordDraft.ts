import type { GameMode, RatingTier, RosterState } from '../../types';
import { getRosterCards } from '../roster';
import { getMissionProgress } from '../missions';
import type {
  CompletedDraftSnapshot,
  CompletionFeedback,
  HistoryRosterEntry,
  ProgressionData,
} from './types';
import { HISTORY_CAP } from './types';

export interface RecordCompletedDraftInput {
  progression: ProgressionData;
  mode: GameMode;
  rating: number;
  tier: RatingTier;
  roster: RosterState;
}

export interface RecordCompletedDraftResult {
  progression: ProgressionData;
  feedback: CompletionFeedback;
}

function buildHistoryRoster(roster: RosterState): HistoryRosterEntry[] {
  return getRosterCards(roster).map(({ slot, card }) => ({
    slot,
    cardId: card.id,
    name: card.name,
    position: card.position,
    team: card.team,
    season: card.season,
  }));
}

function computeFeedback(
  progression: ProgressionData,
  mode: GameMode,
  rating: number,
  cardIds: string[],
): CompletionFeedback {
  const previousBest = progression.bestScores[mode];
  const isPersonalBest = previousBest === undefined || rating > previousBest;

  const newCardIds = cardIds.filter(
    (id) => (progression.cardDraftCounts[id] ?? 0) === 0,
  );

  return { isPersonalBest, newCardIds };
}

export function recordCompletedDraft(
  input: RecordCompletedDraftInput,
): RecordCompletedDraftResult {
  const { progression, mode, rating, tier, roster } = input;
  const rosterEntries = buildHistoryRoster(roster);
  const cardIds = rosterEntries.map((entry) => entry.cardId);

  const feedback = computeFeedback(progression, mode, rating, cardIds);

  const updatedCounts = { ...progression.cardDraftCounts };
  for (const cardId of cardIds) {
    updatedCounts[cardId] = (updatedCounts[cardId] ?? 0) + 1;
  }

  const missionIds = getMissionProgress(roster)
    .filter((m) => m.complete)
    .map((m) => m.id);
  const missionWins = { ...progression.missionWins };
  missionIds.forEach((id) => {
    missionWins[id] = (missionWins[id] ?? 0) + 1;
  });

  const snapshot: CompletedDraftSnapshot = {
    missionIds,
    id: crypto.randomUUID(),
    completedAt: new Date().toISOString(),
    mode,
    rating,
    tierLabel: tier.label,
    tierColor: tier.color,
    roster: rosterEntries,
  };

  const updatedBestScores = { ...progression.bestScores };
  if (feedback.isPersonalBest) {
    updatedBestScores[mode] = rating;
  }

  const updated: ProgressionData = {
    version: 1,
    missionWins,
    totalDrafts: progression.totalDrafts + 1,
    totalScore: progression.totalScore + rating,
    bestScores: updatedBestScores,
    cardDraftCounts: updatedCounts,
    history: [snapshot, ...progression.history].slice(0, HISTORY_CAP),
  };

  return { progression: updated, feedback };
}
