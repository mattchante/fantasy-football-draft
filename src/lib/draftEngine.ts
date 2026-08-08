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

const CARDS_PER_ROUND = 3;

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function sampleCards(cards: PlayerCard[], count: number): PlayerCard[] {
  return shuffle(cards).slice(0, Math.min(count, cards.length));
}

function getAvailableThemes(usedThemeIds: string[]): RoundTheme[] {
  const unused = NORMAL_ROUND_THEMES.filter((t) => !usedThemeIds.includes(t.id));
  return unused.length > 0 ? unused : NORMAL_ROUND_THEMES;
}

function getThemeCandidates(
  theme: RoundTheme,
  roster: RosterState,
  draftedCardIds: Set<string>,
  offeredCardIds: Set<string>,
  picksRemaining: number,
): PlayerCard[] {
  const pool = PLAYER_CARDS.filter(
    (c) =>
      theme.categoryIds.some((cat) => c.categoryIds.includes(cat)) &&
      !draftedCardIds.has(c.id),
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
  offeredCardIds: Set<string>,
  picksRemaining: number,
  usedThemeIds: string[],
): number {
  const candidates = getThemeCandidates(
    theme,
    roster,
    draftedCardIds,
    offeredCardIds,
    picksRemaining,
  );

  if (candidates.length < CARDS_PER_ROUND) return -1;

  let score = Math.random() * 10;

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
  offeredCardIds: Set<string>,
  usedThemeIds: string[],
  picksRemaining: number,
): RoundTheme | null {
  const themes = getAvailableThemes(usedThemeIds);
  const scored = themes
    .map((theme) => ({
      theme,
      score: scoreTheme(
        theme,
        roster,
        draftedCardIds,
        offeredCardIds,
        picksRemaining,
        usedThemeIds,
      ),
    }))
    .filter((t) => t.score >= 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) return null;

  const topScore = scored[0].score;
  const topThemes = scored.filter((t) => t.score >= topScore - 5);
  return topThemes[Math.floor(Math.random() * topThemes.length)].theme;
}

function buildMvpRound(
  roster: RosterState,
  draftedCardIds: Set<string>,
  offeredCardIds: Set<string>,
  roundNumber: number,
): GeneratedRound | null {
  const pool = getMvpEligibleCards().filter((c) => !draftedCardIds.has(c.id));
  const safe = filterSafeCards(pool, roster, 1, true);

  const fresh = safe.filter((c) => !offeredCardIds.has(c.id));
  const candidates = fresh.length >= CARDS_PER_ROUND ? fresh : safe;

  if (candidates.length < CARDS_PER_ROUND) {
    const fallback = pool.filter((c) => !draftedCardIds.has(c.id));
    if (fallback.length < CARDS_PER_ROUND) return null;
    return {
      theme: MVP_ROUND_THEME,
      cards: sampleCards(fallback, CARDS_PER_ROUND),
      roundNumber,
      isMvpRound: true,
    };
  }

  return {
    theme: MVP_ROUND_THEME,
    cards: sampleCards(candidates, CARDS_PER_ROUND),
    roundNumber,
    isMvpRound: true,
  };
}

function buildNormalRound(
  roster: RosterState,
  draftedCardIds: Set<string>,
  offeredCardIds: Set<string>,
  usedThemeIds: string[],
  roundNumber: number,
): GeneratedRound | null {
  const needs = getRemainingNeeds(roster);
  const theme = selectTheme(
    roster,
    draftedCardIds,
    offeredCardIds,
    usedThemeIds,
    needs.normalPicksRemaining,
  );

  if (!theme) {
    const allSafe = filterSafeCards(
      PLAYER_CARDS.filter((c) => !draftedCardIds.has(c.id)),
      roster,
      needs.normalPicksRemaining,
    );
    if (allSafe.length < CARDS_PER_ROUND) return null;

    return {
      theme: NORMAL_ROUND_THEMES[0],
      cards: sampleCards(allSafe, CARDS_PER_ROUND),
      roundNumber,
      isMvpRound: false,
    };
  }

  let candidates = getThemeCandidates(
    theme,
    roster,
    draftedCardIds,
    offeredCardIds,
    needs.normalPicksRemaining,
  );

  if (candidates.length < CARDS_PER_ROUND) {
    const allSafe = filterSafeCards(
      PLAYER_CARDS.filter((c) => !draftedCardIds.has(c.id)),
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
    cards: sampleCards(candidates, CARDS_PER_ROUND),
    roundNumber,
    isMvpRound: false,
  };
}

export function createInitialDraftState(): DraftState {
  return {
    roundNumber: 1,
    picks: [],
    draftedCardIds: new Set(),
    offeredCardIds: new Set(),
    usedThemeIds: [],
    currentRound: null,
    isComplete: false,
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
      state.offeredCardIds,
      roundNumber,
    );
  }

  return buildNormalRound(
    roster,
    state.draftedCardIds,
    state.offeredCardIds,
    state.usedThemeIds,
    roundNumber,
  );
}

export function startDraft(): {
  draftState: DraftState;
  roster: RosterState;
  currentRound: GeneratedRound;
} {
  const draftState = createInitialDraftState();
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
  const { roster: newRoster, slot } = assignPlayerToRoster(roster, card, isMvpPick);

  const draftedCardIds = new Set(state.draftedCardIds);
  draftedCardIds.add(cardId);

  const usedThemeIds = state.currentRound && !isMvpPick
    ? [...state.usedThemeIds, state.currentRound.theme.id]
    : state.usedThemeIds;

  const picks = [
    ...state.picks,
    { card, slot, roundNumber: state.picks.length + 1 },
  ];

  const newState: DraftState = {
    roundNumber: state.roundNumber + 1,
    picks,
    draftedCardIds,
    offeredCardIds: state.offeredCardIds,
    usedThemeIds,
    currentRound: null,
    isComplete: isRosterComplete(newRoster),
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
