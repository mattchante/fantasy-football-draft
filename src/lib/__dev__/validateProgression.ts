import { PLAYER_CARDS } from '../../data/playerCards';
import { createEmptyProgression, recordCompletedDraft } from '../progression';
import { getTeamRatingResult } from '../teamRating';
import { startDraft, applyPick } from '../draftEngine';
import { HISTORY_CAP } from '../progression/types';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`validateProgression: ${message}`);
  }
}

function runAutoDraft(mode: 'normal' | 'hard' = 'normal') {
  let { draftState, roster } = startDraft();
  while (!draftState.isComplete && draftState.currentRound) {
    const card = draftState.currentRound.cards[0];
    const result = applyPick(draftState, roster, card.id);
    draftState = result.draftState;
    roster = result.roster;
  }
  const { rating, tier } = getTeamRatingResult(roster);
  return { draftState, roster, rating, tier, mode };
}

export function validateProgression(): void {
  let progression = createEmptyProgression();

  const records = progression;
  assert(records.totalDrafts === 0, 'fresh totalDrafts should be 0');
  assert(records.history.length === 0, 'fresh history should be empty');

  const first = runAutoDraft('normal');
  assert(first.draftState.isComplete && first.draftState.picks.length === 8, 'auto draft should complete');

  const firstRecord = recordCompletedDraft({
    progression,
    mode: first.mode,
    rating: first.rating,
    tier: first.tier,
    roster: first.roster,
  });
  progression = firstRecord.progression;

  assert(progression.totalDrafts === 1, 'first completion increments totalDrafts');
  assert(progression.history.length === 1, 'first completion adds history entry');
  assert(firstRecord.feedback.isPersonalBest, 'first draft should be personal best');
  assert(firstRecord.feedback.newCardIds.length === 8, 'first draft should have 8 new cards');

  for (let i = 0; i < 25; i++) {
    const run = runAutoDraft('normal');
    const result = recordCompletedDraft({
      progression,
      mode: run.mode,
      rating: run.rating,
      tier: run.tier,
      roster: run.roster,
    });
    progression = result.progression;
  }

  assert(progression.history.length === HISTORY_CAP, `history should cap at ${HISTORY_CAP}`);
  assert(progression.totalDrafts === 26, 'totalDrafts should continue past history cap');

  const avg = Math.round(progression.totalScore / progression.totalDrafts);
  assert(avg >= 44 && avg <= 212, 'average score should be in valid range');

  const cardIds = Object.keys(progression.cardDraftCounts);
  assert(cardIds.length > 0, 'cardDraftCounts should have entries');

  const vaultCards = PLAYER_CARDS.length;
  assert(vaultCards > 0, 'PLAYER_CARDS should exist');

  console.log('validateProgression: all checks passed');
}
