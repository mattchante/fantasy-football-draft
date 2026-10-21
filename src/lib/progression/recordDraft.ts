import type { DraftedPick, GameMode, RatingTier, RosterState } from '../../types';
import { getDraftGrade } from '../draftGrade';
import { getRosterCards } from '../roster';
import { PLAYER_CARDS } from '../../data/playerCards';
import { evaluateAchievements } from '../achievements';
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
): Pick<CompletionFeedback, 'isPersonalBest' | 'newCardIds'> {
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

  const completedAt = new Date().toISOString();
  const totalDrafts = progression.totalDrafts + 1;
  const achievements = { ...progression.achievements };
  const earnedAchievementIds: string[] = [];
  const newAchievementIds: string[] = [];
  for (const achievement of evaluateAchievements({
    picks,
    mode,
    totalDrafts,
    collectedCards: PLAYER_CARDS.filter((card) => updatedCounts[card.id] > 0)
      .length,
  })) {
    const existing = achievements[achievement.id];
    if (existing && !achievement.repeatable) continue;
    achievements[achievement.id] = existing
      ? { ...existing, count: existing.count + 1 }
      : { count: 1, firstEarnedAt: completedAt };
    earnedAchievementIds.push(achievement.id);
    if (!existing) newAchievementIds.push(achievement.id);
  }

  const snapshot: CompletedDraftSnapshot = {
    achievementIds: earnedAchievementIds,
    id: crypto.randomUUID(),
    completedAt,
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
    ...(progression.missionWins && { missionWins: progression.missionWins }),
    achievements,
    totalDrafts,
    totalScore: progression.totalScore + rating,
    bestScores: progression.bestScores,
    bestAccuracy,
    totalAccuracy: (progression.totalAccuracy ?? 0) + accuracy,
    gradedDrafts: (progression.gradedDrafts ?? 0) + 1,
    cardDraftCounts: updatedCounts,
    history: [snapshot, ...progression.history].slice(0, HISTORY_CAP),
  };

  return {
    progression: updated,
    feedback: { ...feedback, earnedAchievementIds, newAchievementIds },
  };
}
