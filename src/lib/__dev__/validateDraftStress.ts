import { startDraft, applyPick } from '../draftEngine';
import { getRosterCards, isRosterComplete } from '../roster';
import { getTeamRatingResult } from '../teamRating';
import { getDraftGrade } from '../draftGrade';

const STRESS_RUNS = 1000;

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const index = Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * p));
  return sorted[index];
}

export function validateDraftStress(): void {
  console.group('[Draft Cards] Draft stress test');

  let failures = 0;
  let duplicatePlayerFailures = 0;
  const ratings: number[] = [];
  const accuracies: number[] = [];

  for (let i = 0; i < STRESS_RUNS; i++) {
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
        failures++;
        continue;
      }

      const playerIds = getRosterCards(currentRoster).map(({ card }) => card.playerId);
      if (new Set(playerIds).size !== playerIds.length) {
        duplicatePlayerFailures++;
      }

      const { rating } = getTeamRatingResult(currentRoster);
      ratings.push(rating);
      accuracies.push(getDraftGrade(state.picks).accuracy);
    } catch {
      failures++;
    }
  }

  ratings.sort((a, b) => a - b);
  accuracies.sort((a, b) => a - b);

  console.log(`Runs: ${STRESS_RUNS}`);
  console.log(`Failures: ${failures}`);
  console.log(`Duplicate playerId rosters: ${duplicatePlayerFailures}`);
  console.log(
    `Team strength min/median/p95/max: ${ratings[0] ?? 0}/${percentile(ratings, 0.5)}/${percentile(ratings, 0.95)}/${ratings[ratings.length - 1] ?? 0}`,
  );
  console.log(
    `First-card accuracy p10/median/p90: ${percentile(accuracies, 0.1)}/${percentile(accuracies, 0.5)}/${percentile(accuracies, 0.9)}`,
  );

  if (failures > 0 || duplicatePlayerFailures > 0) {
    throw new Error('validateDraftStress: failures detected');
  }

  console.log('Draft stress test passed');
  console.groupEnd();
}
