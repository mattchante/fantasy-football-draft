import { PLAYER_CARDS, getMvpEligibleCards } from '../../data/playerCards';
import { ROUND_THEMES } from '../../data/roundThemes';
import { startDraft, applyPick } from '../draftEngine';
import { isRosterComplete } from '../roster';
import { calculatePPR } from '../fantasyScoring';

export function validateDataset(): void {
  console.group('[Draft Cards] Dataset validation');

  let errors = 0;

  for (const card of PLAYER_CARDS) {
    if (!card.id || !card.name || !card.position) {
      console.error('Invalid card:', card.id);
      errors++;
    }
    if (card.normalizedValue <= 0) {
      console.error('Missing normalizedValue:', card.id);
      errors++;
    }
    if (!card.imageUrl) {
      console.error('Missing imageUrl:', card.id);
      errors++;
    }
    const computed = Math.round(calculatePPR(card.stats) * 10) / 10;
    if (Math.abs(computed - card.fantasyPoints) > 1) {
      console.warn(`FP mismatch for ${card.id}: stored=${card.fantasyPoints}, computed=${computed}`);
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
  for (let i = 0; i < 100; i++) {
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
    } catch {
      simFailures++;
    }
  }

  if (simFailures > 0) {
    console.error(`${simFailures}/100 auto-drafts failed`);
    errors++;
  } else {
    console.log('100/100 auto-drafts completed successfully');
  }

  console.log(`Cards: ${PLAYER_CARDS.length}, MVP eligible: ${mvpPool.length}, Themes: ${ROUND_THEMES.length}`);

  if (errors === 0) {
    console.log('All validations passed');
  } else {
    console.error(`${errors} validation error(s)`);
  }

  console.groupEnd();
}
