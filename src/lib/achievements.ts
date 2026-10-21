import { PLAYER_CARDS } from '../data/playerCards';
import type { DraftedPick, GameMode, PlayerCard } from '../types';
import { getDraftGrade, type RoundReview } from './draftGrade';
import type { ProgressionData } from './progression/types';

export type AchievementRarity = 'common' | 'rare' | 'legendary';

export type AchievementCategory =
  | 'board'
  | 'knowledge'
  | 'hard'
  | 'milestone';

export interface DraftContext {
  picks: DraftedPick[];
  mode: GameMode;
  /** Totals after this draft is recorded. */
  totalDrafts: number;
  collectedCards: number;
}

interface EvaluationInput extends DraftContext {
  accuracy: number;
  rounds: RoundReview[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  /** Milestones unlock once; everything else can be earned again. */
  repeatable: boolean;
  earned: (input: EvaluationInput) => boolean;
  /** Lifetime progress toward a milestone, shown while locked. */
  progress?: (input: Pick<DraftContext, 'totalDrafts' | 'collectedCards'>) => {
    value: number;
    target: number;
  };
}

export const ACHIEVEMENT_CATEGORIES: { id: AchievementCategory; title: string }[] = [
  { id: 'board', title: 'Board Reading' },
  { id: 'knowledge', title: 'Football Knowledge' },
  { id: 'hard', title: 'Hard Mode' },
  { id: 'milestone', title: 'Milestones' },
];

export const RARITY_LABELS: Record<AchievementRarity, string> = {
  common: 'Common',
  rare: 'Rare',
  legendary: 'Legendary',
};

const PRE_MODERN_SEASON = 2010;

function isRookieSeason(card: PlayerCard): boolean {
  return card.flavorTag.includes('Rookie') || card.badges.includes('OROY');
}

function bestRounds(rounds: RoundReview[]): RoundReview[] {
  return rounds.filter((round) => round.outcome === 'best');
}

function longestBestStreak(rounds: RoundReview[]): number {
  let longest = 0;
  let current = 0;
  for (const round of rounds) {
    current = round.outcome === 'best' ? current + 1 : 0;
    longest = Math.max(longest, current);
  }
  return longest;
}

function milestone(
  key: 'totalDrafts' | 'collectedCards',
  target: number,
): Pick<Achievement, 'earned' | 'progress' | 'repeatable'> {
  return {
    repeatable: false,
    earned: (input) => input[key] >= target,
    progress: (input) => ({ value: Math.min(input[key], target), target }),
  };
}

export const ACHIEVEMENTS: Achievement[] = [
  // Board reading
  {
    id: 'eagle-eye',
    title: 'Eagle Eye',
    description: 'Take the best card on 3 boards in a row.',
    category: 'board',
    rarity: 'common',
    repeatable: true,
    earned: ({ rounds }) => longestBestStreak(rounds) >= 3,
  },
  {
    id: 'mvp-instinct',
    title: 'MVP Instinct',
    description: 'Take the best card on the MVP board.',
    category: 'board',
    rarity: 'common',
    repeatable: true,
    earned: ({ rounds }) =>
      rounds.some((round) => round.isMvp && round.outcome === 'best'),
  },
  {
    id: 'clean-sheet',
    title: 'Clean Sheet',
    description: 'Finish a draft without a single missed pick.',
    category: 'board',
    rarity: 'rare',
    repeatable: true,
    earned: ({ rounds }) => rounds.every((round) => round.outcome !== 'miss'),
  },
  {
    id: 'comeback-kid',
    title: 'Comeback Kid',
    description: 'Miss in round 1, then still finish with a B+ or better.',
    category: 'board',
    rarity: 'rare',
    repeatable: true,
    earned: ({ rounds, accuracy }) =>
      rounds[0]?.outcome === 'miss' && accuracy >= 82,
  },
  {
    id: 'front-office',
    title: 'Front Office',
    description: 'Earn an A- or better.',
    category: 'board',
    rarity: 'rare',
    repeatable: true,
    earned: ({ accuracy }) => accuracy >= 87,
  },
  {
    id: 'war-room-genius',
    title: 'War Room Genius',
    description: 'Earn an A+.',
    category: 'board',
    rarity: 'legendary',
    repeatable: true,
    earned: ({ accuracy }) => accuracy >= 97,
  },
  {
    id: 'perfect-board',
    title: 'Perfect Board',
    description: 'Take the best card on all 8 boards.',
    category: 'board',
    rarity: 'legendary',
    repeatable: true,
    earned: ({ rounds }) =>
      rounds.length > 0 && rounds.every((round) => round.outcome === 'best'),
  },

  // Football knowledge
  {
    id: 'old-school',
    title: 'Old School',
    description: 'Take the best card on a board with a pre-2010 season.',
    category: 'knowledge',
    rarity: 'common',
    repeatable: true,
    earned: ({ rounds }) =>
      bestRounds(rounds).some((round) => round.pick.season < PRE_MODERN_SEASON),
  },
  {
    id: 'sleeper-hit',
    title: 'Sleeper Hit',
    description:
      'Twice in one draft, pass on a Legend for a non-Legend that was the better season.',
    category: 'knowledge',
    rarity: 'common',
    repeatable: true,
    earned: ({ picks, rounds }) =>
      rounds.filter(
        (round, i) =>
          round.outcome === 'best' &&
          round.pick.status !== 'legend' &&
          picks[i].board.some((card) => card.status === 'legend'),
      ).length >= 2,
  },
  {
    id: 'rookie-scout',
    title: 'Rookie Scout',
    description: 'Take the best card on a board with a rookie season.',
    category: 'knowledge',
    rarity: 'rare',
    repeatable: true,
    earned: ({ rounds }) =>
      bestRounds(rounds).some((round) => isRookieSeason(round.pick)),
  },
  {
    id: 'history-buff',
    title: 'History Buff',
    description: 'Take the best card with pre-2010 seasons on 3 boards in one draft.',
    category: 'knowledge',
    rarity: 'rare',
    repeatable: true,
    earned: ({ rounds }) =>
      bestRounds(rounds).filter(
        (round) => round.pick.season < PRE_MODERN_SEASON,
      ).length >= 3,
  },

  // Hard mode
  {
    id: 'film-room',
    title: 'Film Room',
    description: 'Earn a B or better in Hard mode.',
    category: 'hard',
    rarity: 'rare',
    repeatable: true,
    earned: ({ mode, accuracy }) => mode === 'hard' && accuracy >= 76,
  },
  {
    id: 'blindfolded',
    title: 'Blindfolded',
    description: 'Earn an A- or better in Hard mode.',
    category: 'hard',
    rarity: 'legendary',
    repeatable: true,
    earned: ({ mode, accuracy }) => mode === 'hard' && accuracy >= 87,
  },
  {
    id: 'no-peeking',
    title: 'No Peeking',
    description: 'Finish a Hard mode draft without a single missed pick.',
    category: 'hard',
    rarity: 'legendary',
    repeatable: true,
    earned: ({ mode, rounds }) =>
      mode === 'hard' && rounds.every((round) => round.outcome !== 'miss'),
  },

  // Milestones
  {
    id: 'rookie-gm',
    title: 'Rookie GM',
    description: 'Complete your first draft.',
    category: 'milestone',
    rarity: 'common',
    ...milestone('totalDrafts', 1),
  },
  {
    id: 'seasoned-gm',
    title: 'Seasoned GM',
    description: 'Complete 25 drafts.',
    category: 'milestone',
    rarity: 'rare',
    ...milestone('totalDrafts', 25),
  },
  {
    id: 'franchise-icon',
    title: 'Franchise Icon',
    description: 'Complete 100 drafts.',
    category: 'milestone',
    rarity: 'legendary',
    ...milestone('totalDrafts', 100),
  },
  {
    id: 'collector',
    title: 'Collector',
    description: 'Collect 50 seasons in the Card Vault.',
    category: 'milestone',
    rarity: 'common',
    ...milestone('collectedCards', 50),
  },
  {
    id: 'archivist',
    title: 'Archivist',
    description: 'Collect 150 seasons in the Card Vault.',
    category: 'milestone',
    rarity: 'rare',
    ...milestone('collectedCards', 150),
  },
  {
    id: 'completionist',
    title: 'Completionist',
    description: `Collect all ${PLAYER_CARDS.length} seasons in the Card Vault.`,
    category: 'milestone',
    rarity: 'legendary',
    ...milestone('collectedCards', PLAYER_CARDS.length),
  },
];

const BY_ID = new Map(ACHIEVEMENTS.map((achievement) => [achievement.id, achievement]));

export function getAchievement(id: string): Achievement | undefined {
  return BY_ID.get(id);
}

export interface CollectionEntry {
  achievement: Achievement;
  count: number;
  firstEarnedAt?: string;
  progress?: { value: number; target: number };
}

/** The full collection book, locked and unlocked, from saved progress. */
export function getCollectionBook(
  progression: Pick<
    ProgressionData,
    'achievements' | 'totalDrafts' | 'cardDraftCounts'
  >,
): CollectionEntry[] {
  const lifetime = {
    totalDrafts: progression.totalDrafts,
    collectedCards: PLAYER_CARDS.filter(
      (card) => (progression.cardDraftCounts[card.id] ?? 0) > 0,
    ).length,
  };
  return ACHIEVEMENTS.map((achievement) => {
    const record = progression.achievements?.[achievement.id];
    return {
      achievement,
      count: record?.count ?? 0,
      firstEarnedAt: record?.firstEarnedAt,
      progress: record ? undefined : achievement.progress?.(lifetime),
    };
  });
}

/** Every achievement this completed draft satisfies, in collection order. */
export function evaluateAchievements(context: DraftContext): Achievement[] {
  const { accuracy, rounds } = getDraftGrade(context.picks);
  const input: EvaluationInput = { ...context, accuracy, rounds };
  return ACHIEVEMENTS.filter((achievement) => achievement.earned(input));
}
