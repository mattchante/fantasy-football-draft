import { MVP_ROUND_THEME, NORMAL_ROUND_THEMES } from '../data/roundThemes';
import { getMvpEligibleCards, PLAYER_CARDS } from '../data/playerCards';
import type {
  DraftState,
  GeneratedRound,
  PlayerCard,
  RosterState,
  RoundTheme,
} from '../types';
import {
  assignPlayerToRoster,
  createEmptyRoster,
  getRemainingNeeds,
  isNormalRosterComplete,
  isRosterComplete,
  NORMAL_PICKS,
} from './roster';
import { filterSafeCards, getPositionUrgency } from './rosterValidation';
import { createSeededRng, defaultRng, type Rng } from './random';

const CARDS_PER_ROUND = 3;
const OPEN_BOARD: RoundTheme = {
  id: 'open-board',
  title: 'Open Board',
  description:
    'The board adapts to your remaining slots. Find the missing piece.',
  categoryIds: [],
};

function shuffle<T>(array: T[], rng: Rng): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function sampleCards(
  cards: PlayerCard[],
  count: number,
  rng: Rng,
): PlayerCard[] {
  return shuffle(cards, rng).slice(0, Math.min(count, cards.length));
}

function getAvailableThemes(usedThemeIds: string[]): RoundTheme[] {
  const unused = NORMAL_ROUND_THEMES.filter(
    (t) => !usedThemeIds.includes(t.id),
  );
  return unused.length > 0 ? unused : NORMAL_ROUND_THEMES;
}

function isCardDraftable(
  card: PlayerCard,
  draftedCardIds: Set<string>,
  draftedPlayerIds: Set<string>,
): boolean {
  return !draftedCardIds.has(card.id) && !draftedPlayerIds.has(card.playerId);
}

function getThemeCandidates(
  theme: RoundTheme,
  roster: RosterState,
  draftedCardIds: Set<string>,
  draftedPlayerIds: Set<string>,
  offeredCardIds: Set<string>,
  picksRemaining: number,
): PlayerCard[] {
  const pool = PLAYER_CARDS.filter(
    (c) =>
      theme.categoryIds.some((cat) => c.categoryIds.includes(cat)) &&
      isCardDraftable(c, draftedCardIds, draftedPlayerIds),
  );

  const safe = filterSafeCards(pool, roster, picksRemaining);

  const fresh = safe.filter((c) => !offeredCardIds.has(c.id));
  if (fresh.length >= CARDS_PER_ROUND) return fresh;

  return safe;
}

function scoreTheme(
  theme: RoundTheme,
  roster: RosterState,
  draftedCardIds: Set<string>,
  draftedPlayerIds: Set<string>,
  offeredCardIds: Set<string>,
  picksRemaining: number,
  usedThemeIds: string[],
  rng: Rng,
): number {
  const candidates = getThemeCandidates(
    theme,
    roster,
    draftedCardIds,
    draftedPlayerIds,
    offeredCardIds,
    picksRemaining,
  );

  if (candidates.length < CARDS_PER_ROUND) return -1;

  let score = rng() * 10;

  if (!usedThemeIds.includes(theme.id)) score += 20;

  const urgency = getPositionUrgency(roster, picksRemaining);
  for (const card of candidates) {
    score += urgency[card.position] ?? 0;
  }

  const positions = new Set(candidates.map((c) => c.position));
  if (positions.size >= 2) score += 5;

  return score;
}

function selectTheme(
  roster: RosterState,
  draftedCardIds: Set<string>,
  draftedPlayerIds: Set<string>,
  offeredCardIds: Set<string>,
  usedThemeIds: string[],
  picksRemaining: number,
  rng: Rng,
): RoundTheme | null {
  const themes = getAvailableThemes(usedThemeIds);
  const scored = themes
    .map((theme) => ({
      theme,
      score: scoreTheme(
        theme,
        roster,
        draftedCardIds,
        draftedPlayerIds,
        offeredCardIds,
        picksRemaining,
        usedThemeIds,
        rng,
      ),
    }))
    .filter((t) => t.score >= 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) return null;

  const topScore = scored[0].score;
  const topThemes = scored.filter((t) => t.score >= topScore - 5);
  return topThemes[Math.floor(rng() * topThemes.length)].theme;
}

function buildMvpRound(
  roster: RosterState,
  draftedCardIds: Set<string>,
  draftedPlayerIds: Set<string>,
  offeredCardIds: Set<string>,
  roundNumber: number,
  rng: Rng,
): GeneratedRound | null {
  const pool = getMvpEligibleCards().filter((c) =>
    isCardDraftable(c, draftedCardIds, draftedPlayerIds),
  );
  const safe = filterSafeCards(pool, roster, 1, true);

  const fresh = safe.filter((c) => !offeredCardIds.has(c.id));
  const candidates = fresh.length >= CARDS_PER_ROUND ? fresh : safe;

  if (candidates.length < CARDS_PER_ROUND) {
    const fallback = pool.filter((c) =>
      isCardDraftable(c, draftedCardIds, draftedPlayerIds),
    );
    if (fallback.length < CARDS_PER_ROUND) return null;
    return {
      theme: MVP_ROUND_THEME,
      cards: sampleCards(fallback, CARDS_PER_ROUND, rng),
      roundNumber,
      isMvpRound: true,
    };
  }

  return {
    theme: MVP_ROUND_THEME,
    cards: sampleCards(candidates, CARDS_PER_ROUND, rng),
    roundNumber,
    isMvpRound: true,
  };
}

function buildNormalRound(
  roster: RosterState,
  draftedCardIds: Set<string>,
  draftedPlayerIds: Set<string>,
  offeredCardIds: Set<string>,
  usedThemeIds: string[],
  roundNumber: number,
  rng: Rng,
): GeneratedRound | null {
  const needs = getRemainingNeeds(roster);
  const theme = selectTheme(
    roster,
    draftedCardIds,
    draftedPlayerIds,
    offeredCardIds,
    usedThemeIds,
    needs.normalPicksRemaining,
    rng,
  );

  if (!theme) {
    const allSafe = filterSafeCards(
      PLAYER_CARDS.filter((c) =>
        isCardDraftable(c, draftedCardIds, draftedPlayerIds),
      ),
      roster,
      needs.normalPicksRemaining,
    );
    if (allSafe.length < CARDS_PER_ROUND) return null;

    return {
      theme: OPEN_BOARD,
      cards: sampleCards(allSafe, CARDS_PER_ROUND, rng),
      roundNumber,
      isMvpRound: false,
    };
  }

  let candidates = getThemeCandidates(
    theme,
    roster,
    draftedCardIds,
    draftedPlayerIds,
    offeredCardIds,
    needs.normalPicksRemaining,
  );

  if (candidates.length < CARDS_PER_ROUND) {
    const allSafe = filterSafeCards(
      PLAYER_CARDS.filter((c) =>
        isCardDraftable(c, draftedCardIds, draftedPlayerIds),
      ),
      roster,
      needs.normalPicksRemaining,
    );
    candidates = allSafe.filter((c) => !offeredCardIds.has(c.id));
    if (candidates.length < CARDS_PER_ROUND) {
      candidates = allSafe;
    }
  }

  if (candidates.length < CARDS_PER_ROUND) return null;

  return {
    theme,
    cards: sampleCards(candidates, CARDS_PER_ROUND, rng),
    roundNumber,
    isMvpRound: false,
  };
}

/**
 * Seeded drafts derive a fresh generator per board from the seed, the pick
 * number and the board kind. Every player sees the same opening board, and
 * identical picks always reproduce identical later boards.
 */
function getBoardRng(
  state: DraftState,
  roundNumber: number,
  kind: 'board' | 'redraw',
): Rng {
  return state.seed
    ? createSeededRng(`${state.seed}:${kind}:${roundNumber}`)
    : defaultRng;
}

export function createInitialDraftState(seed?: string): DraftState {
  return {
    ...(seed ? { seed } : {}),
    roundNumber: 1,
    picks: [],
    draftedCardIds: new Set(),
    draftedPlayerIds: new Set(),
    offeredCardIds: new Set(),
    usedThemeIds: [],
    currentRound: null,
    isComplete: false,
    redrawsRemaining: 1,
  };
}

export function generateNextRound(
  state: DraftState,
  roster: RosterState,
): GeneratedRound | null {
  if (isRosterComplete(roster)) return null;

  const roundNumber = state.picks.length + 1;

  if (isNormalRosterComplete(roster)) {
    return buildMvpRound(
      roster,
      state.draftedCardIds,
      state.draftedPlayerIds,
      state.offeredCardIds,
      roundNumber,
      getBoardRng(state, roundNumber, 'board'),
    );
  }

  return buildNormalRound(
    roster,
    state.draftedCardIds,
    state.draftedPlayerIds,
    state.offeredCardIds,
    state.usedThemeIds,
    roundNumber,
    getBoardRng(state, roundNumber, 'board'),
  );
}

export function startDraft(options: { seed?: string } = {}): {
  draftState: DraftState;
  roster: RosterState;
  currentRound: GeneratedRound;
} {
  const draftState = createInitialDraftState(options.seed);
  const roster = createEmptyRoster();
  const currentRound = generateNextRound(draftState, roster);

  if (!currentRound) {
    throw new Error('Failed to generate first round');
  }

  const offeredCardIds = new Set(currentRound.cards.map((c) => c.id));

  return {
    draftState: {
      ...draftState,
      currentRound,
      offeredCardIds,
    },
    roster,
    currentRound,
  };
}

export function applyPick(
  state: DraftState,
  roster: RosterState,
  cardId: string,
): {
  draftState: DraftState;
  roster: RosterState;
  currentRound: GeneratedRound | null;
} {
  const card = state.currentRound?.cards.find((c) => c.id === cardId);
  if (!card) throw new Error(`Card ${cardId} not in current round`);

  const isMvpPick = state.currentRound?.isMvpRound ?? false;
  const { roster: newRoster, slot } = assignPlayerToRoster(
    roster,
    card,
    isMvpPick,
  );

  const draftedCardIds = new Set(state.draftedCardIds);
  draftedCardIds.add(cardId);

  const draftedPlayerIds = new Set(state.draftedPlayerIds);
  draftedPlayerIds.add(card.playerId);

  const usedThemeIds =
    state.currentRound && !isMvpPick
      ? [...state.usedThemeIds, state.currentRound.theme.id]
      : state.usedThemeIds;

  const picks = [
    ...state.picks,
    { card, slot, roundNumber: state.picks.length + 1 },
  ];

  const newState: DraftState = {
    ...(state.seed ? { seed: state.seed } : {}),
    roundNumber: state.roundNumber + 1,
    picks,
    draftedCardIds,
    draftedPlayerIds,
    offeredCardIds: state.offeredCardIds,
    usedThemeIds,
    currentRound: null,
    isComplete: isRosterComplete(newRoster),
    redrawsRemaining: state.redrawsRemaining,
  };

  if (newState.isComplete) {
    return { draftState: newState, roster: newRoster, currentRound: null };
  }

  const nextRound = generateNextRound(newState, newRoster);
  if (!nextRound) {
    throw new Error('Failed to generate next round');
  }

  const offeredCardIds = new Set(newState.offeredCardIds);
  for (const c of nextRound.cards) {
    offeredCardIds.add(c.id);
  }

  return {
    draftState: {
      ...newState,
      currentRound: nextRound,
      offeredCardIds,
    },
    roster: newRoster,
    currentRound: nextRound,
  };
}

export { NORMAL_PICKS, CARDS_PER_ROUND };

/** Trade the entire board once. No repeats from the discarded board, even in a thin pool. */
export function redrawRound(
  state: DraftState,
  roster: RosterState,
): DraftState {
  if (
    state.isComplete ||
    !state.currentRound ||
    state.currentRound.isMvpRound ||
    state.redrawsRemaining < 1
  )
    return state;
  const excluded = new Set([
    ...state.draftedCardIds,
    ...state.currentRound.cards.map((card) => card.id),
  ]);
  const round = buildNormalRound(
    roster,
    excluded,
    state.draftedPlayerIds,
    state.offeredCardIds,
    [...state.usedThemeIds, state.currentRound.theme.id],
    state.roundNumber,
    getBoardRng(state, state.roundNumber, 'redraw'),
  );
  if (!round) return state;
  return {
    ...state,
    currentRound: round,
    redrawsRemaining: state.redrawsRemaining - 1,
    offeredCardIds: new Set([
      ...state.offeredCardIds,
      ...round.cards.map((card) => card.id),
    ]),
  };
}
