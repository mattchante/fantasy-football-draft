import { PLAYER_CARDS, getMvpEligibleCards } from '../../data/playerCards';
import { ROUND_THEMES } from '../../data/roundThemes';
import type { Position } from '../../types';
import type { RosterState } from '../../types';
import { startDraft, applyPick } from '../draftEngine';
import { calculatePPR, calculatePPG } from '../fantasyScoring';
import { getRosterCards, isRosterComplete } from '../roster';

const VALID_POSITIONS: Position[] = ['QB', 'RB', 'WR', 'TE'];
const VALID_CATEGORY_IDS = new Set(
  ROUND_THEMES.flatMap((theme) => theme.categoryIds),
);
const EXPECTED_CARD_COUNT = 350;
const AUTO_DRAFT_RUNS = 1000;

function computeNormalizedValues(): Map<string, number> {
  const byPosition = new Map<Position, typeof PLAYER_CARDS>();
  for (const card of PLAYER_CARDS) {
    const group = byPosition.get(card.position) ?? [];
    group.push(card);
    byPosition.set(card.position, group);
  }

  const result = new Map<string, number>();

  for (const [, group] of byPosition) {
    const sorted = [...group].sort((a, b) => a.fantasyPoints - b.fantasyPoints);
    sorted.forEach((card, index) => {
      const percentile = sorted.length === 1 ? 1 : index / (sorted.length - 1);
      const normalizedValue = Math.round((40 + percentile * 55) * 10) / 10;
      result.set(card.id, normalizedValue);
    });
  }

  return result;
}

function hasDuplicatePlayerIds(roster: RosterState): boolean {
  const playerIds = getRosterCards(roster).map(({ card }) => card.playerId);
  return new Set(playerIds).size !== playerIds.length;
}

export function validateDataset(): void {
  console.group('[Draft Cards] Dataset validation');

  let errors = 0;

  if (PLAYER_CARDS.length !== EXPECTED_CARD_COUNT) {
    console.error(`Expected ${EXPECTED_CARD_COUNT} cards, got ${PLAYER_CARDS.length}`);
    errors++;
  }

  const ids = new Set<string>();
  const playerSeasons = new Set<string>();

  for (const card of PLAYER_CARDS) {
    if (ids.has(card.id)) {
      console.error('Duplicate card id:', card.id);
      errors++;
    }
    ids.add(card.id);

    const playerSeasonKey = `${card.playerId}:${card.season}`;
    if (playerSeasons.has(playerSeasonKey)) {
      console.error('Duplicate player-season pair:', playerSeasonKey);
      errors++;
    }
    playerSeasons.add(playerSeasonKey);

    if (!card.id || !card.playerId || !card.name || !card.position || !card.team) {
      console.error('Missing identity fields:', card.id);
      errors++;
    }

    if (!VALID_POSITIONS.includes(card.position)) {
      console.error('Invalid position:', card.id, card.position);
      errors++;
    }

    if (!card.imageUrl) {
      console.error('Missing imageUrl:', card.id);
      errors++;
    }

    if (card.normalizedValue <= 0) {
      console.error('Missing normalizedValue:', card.id);
      errors++;
    }

    if (card.jerseyNumber == null || !Number.isInteger(card.jerseyNumber)) {
      console.error('Missing or invalid jerseyNumber:', card.id);
      errors++;
    } else if (card.jerseyNumber < 0 || card.jerseyNumber > 99) {
      console.error('Jersey number out of range:', card.id, card.jerseyNumber);
      errors++;
    }

    for (const [key, statValue] of Object.entries(card.stats)) {
      if (statValue === undefined || !Number.isFinite(statValue)) {
        console.error('Invalid stat value:', card.id, key, statValue);
        errors++;
        continue;
      }

      const allowsNegative = key === 'passYds' || key === 'rushYds' || key === 'recYds';
      if (!allowsNegative && statValue < 0) {
        console.error('Invalid stat value:', card.id, key, statValue);
        errors++;
      }
    }

    const computedFp = Math.round(calculatePPR(card.stats) * 10) / 10;
    if (Math.abs(computedFp - card.fantasyPoints) > 0.05) {
      console.error(`FP mismatch for ${card.id}: stored=${card.fantasyPoints}, computed=${computedFp}`);
      errors++;
    }

    const computedPpg = calculatePPG(card.stats, card.fantasyPoints);
    if (Math.abs(computedPpg - card.fantasyPointsPerGame) > 0.15) {
      console.error(`PPG mismatch for ${card.id}: stored=${card.fantasyPointsPerGame}, computed=${computedPpg}`);
      errors++;
    }

    for (const categoryId of card.categoryIds) {
      if (!VALID_CATEGORY_IDS.has(categoryId)) {
        console.error(`Invalid categoryId "${categoryId}" on ${card.id}`);
        errors++;
      }
    }
  }

  const expectedNormalized = computeNormalizedValues();
  for (const card of PLAYER_CARDS) {
    const expected = expectedNormalized.get(card.id);
    if (expected !== undefined && Math.abs(expected - card.normalizedValue) > 0.1) {
      console.error(
        `Normalized value mismatch for ${card.id}: stored=${card.normalizedValue}, expected=${expected}`,
      );
      errors++;
    }
  }

  for (const theme of ROUND_THEMES) {
    if (theme.isMvpRound) continue;
    const eligible = PLAYER_CARDS.filter((c) =>
      theme.categoryIds.some((cat) => c.categoryIds.includes(cat)),
    );
    if (eligible.length < 5) {
      console.error(`Theme "${theme.title}" has only ${eligible.length} eligible cards`);
      errors++;
    }
  }

  const mvpPool = getMvpEligibleCards();
  if (mvpPool.length < 15) {
    console.error(`MVP pool has only ${mvpPool.length} cards`);
    errors++;
  }

  let simFailures = 0;
  let duplicatePlayerFailures = 0;

  for (let i = 0; i < AUTO_DRAFT_RUNS; i++) {
    try {
      const { draftState, roster } = startDraft();
      let state = draftState;
      let currentRoster = roster;

      while (!state.isComplete && state.currentRound) {
        const pick = state.currentRound.cards[0];
        const result = applyPick(state, currentRoster, pick.id);
        state = result.draftState;
        currentRoster = result.roster;
      }

      if (!isRosterComplete(currentRoster)) {
        simFailures++;
      }

      if (hasDuplicatePlayerIds(currentRoster)) {
        duplicatePlayerFailures++;
      }
    } catch {
      simFailures++;
    }
  }

  if (simFailures > 0) {
    console.error(`${simFailures}/${AUTO_DRAFT_RUNS} auto-drafts failed`);
    errors++;
  } else {
    console.log(`${AUTO_DRAFT_RUNS}/${AUTO_DRAFT_RUNS} auto-drafts completed successfully`);
  }

  if (duplicatePlayerFailures > 0) {
    console.error(`${duplicatePlayerFailures}/${AUTO_DRAFT_RUNS} rosters had duplicate playerIds`);
    errors++;
  }

  console.log(
    `Cards: ${PLAYER_CARDS.length}, MVP eligible: ${mvpPool.length}, Themes: ${ROUND_THEMES.length}`,
  );

  if (errors === 0) {
    console.log('All validations passed');
  } else {
    console.error(`${errors} validation error(s)`);
  }

  console.groupEnd();
}
