import type { DraftedPick, GameMode, RatingTier, RosterState } from '../../types';
import { getDraftGrade } from '../draftGrade';
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
  picks: DraftedPick[];
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
  accuracy: number,
  cardIds: string[],
): CompletionFeedback {
  const previousBest = progression.bestAccuracy?.[mode];
  const isPersonalBest = previousBest === undefined || accuracy > previousBest;

  const newCardIds = cardIds.filter(
    (id) => (progression.cardDraftCounts[id] ?? 0) === 0,
  );

  return { isPersonalBest, newCardIds };
}

export function recordCompletedDraft(
  input: RecordCompletedDraftInput,
): RecordCompletedDraftResult {
  const { progression, mode, rating, tier, roster, picks } = input;
  const rosterEntries = buildHistoryRoster(roster);
  const cardIds = rosterEntries.map((entry) => entry.cardId);
  const { accuracy, tier: gradeTier } = getDraftGrade(picks);

  const feedback = computeFeedback(progression, mode, accuracy, cardIds);

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
    grade: gradeTier.grade,
    gradeColor: gradeTier.color,
    accuracy,
    roster: rosterEntries,
  };

  const bestAccuracy = { ...progression.bestAccuracy };
  if (feedback.isPersonalBest) {
    bestAccuracy[mode] = accuracy;
  }

  const updated: ProgressionData = {
    version: 1,
    missionWins,
    totalDrafts: progression.totalDrafts + 1,
    totalScore: progression.totalScore + rating,
    bestScores: progression.bestScores,
    bestAccuracy,
    totalAccuracy: (progression.totalAccuracy ?? 0) + accuracy,
    gradedDrafts: (progression.gradedDrafts ?? 0) + 1,
    cardDraftCounts: updatedCounts,
    history: [snapshot, ...progression.history].slice(0, HISTORY_CAP),
  };

  return { progression: updated, feedback };
}
