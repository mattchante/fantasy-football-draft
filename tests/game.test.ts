import assert from 'node:assert/strict';
import { startDraft, applyPick, redrawRound } from '../src/lib/draftEngine';
import {
  getRosterCards,
  isRosterComplete,
  createEmptyRoster,
} from '../src/lib/roster';
import {
  getTeamRatingResult,
  calculateRawScore,
  MVP_WEIGHT,
} from '../src/lib/teamRating';
import { getMissionProgress } from '../src/lib/missions';
import { PLAYER_CARDS } from '../src/data/playerCards';
import {
  createEmptyProgression,
  loadProgression,
  saveProgression,
  STORAGE_KEY,
} from '../src/lib/progression/storage';
import { recordCompletedDraft } from '../src/lib/progression/recordDraft';
import { validateDataset } from '../src/lib/__dev__/validateDataset';
import { validateDraftStress } from '../src/lib/__dev__/validateDraftStress';
import { validateProgression } from '../src/lib/__dev__/validateProgression';
import { validateProgressionMigration } from '../src/lib/__dev__/validateProgressionMigration';

// Deterministic random sequence makes failures reproducible.
let seed = 415;
Math.random = () => {
  seed = (Math.imul(1664525, seed) + 1013904223) | 0;
  return (seed >>> 0) / 4294967296;
};
const stored = new Map<string, string>();
let writes = 0;
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key: string) => stored.get(key) ?? null,
    setItem: (key: string, value: string) => {
      writes++;
      stored.set(key, value);
    },
    removeItem: (key: string) => stored.delete(key),
  },
});

validateDataset();
validateDraftStress();
validateProgression();
validateProgressionMigration();
assert.equal(
  writes,
  0,
  'Validation and progression computation must not mutate player storage',
);

let progression = createEmptyProgression();
const ratings: number[] = [];
let openBoards = 0;
for (let run = 0; run < 1000; run++) {
  let { draftState: state, roster } = startDraft();
  const redrawAt = (run % 7) + 1;
  while (!state.isComplete) {
    const round = state.currentRound!;
    assert.equal(round.cards.length, 3);
    assert.equal(new Set(round.cards.map((card) => card.id)).size, 3);
    if (round.theme.id === 'open-board') openBoards++;
    else
      assert.ok(
        round.cards.every((card) =>
          round.theme.categoryIds.some((id) => card.categoryIds.includes(id)),
        ),
        'Theme must describe every offered card',
      );
    if (state.roundNumber === redrawAt) {
      const oldIds = new Set(round.cards.map((card) => card.id));
      const oldPicks = state.picks;
      state = redrawRound(state, roster);
      assert.equal(state.redrawsRemaining, 0);
      assert.equal(state.picks, oldPicks);
      assert.equal(state.roundNumber, redrawAt);
      assert.ok(
        state.currentRound!.cards.every((card) => !oldIds.has(card.id)),
        'Redraw must replace all three cards',
      );
      assert.equal(
        redrawRound(state, roster),
        state,
        'Second redraw is forbidden',
      );
    }
    if (state.currentRound!.isMvpRound) {
      assert.equal(
        redrawRound({ ...state, redrawsRemaining: 1 }, roster).currentRound,
        state.currentRound,
        'MVP redraw is forbidden',
      );
    }
    const choices = state.currentRound!.cards;
    // Alternate high-value, random, and mission-aware strategies.
    const pick =
      run % 3 === 0
        ? [...choices].sort((a, b) => b.normalizedValue - a.normalizedValue)[0]
        : run % 3 === 1
          ? choices[Math.floor(Math.random() * 3)]
          : (choices.find(
              (card) =>
                !getRosterCards(roster).some(
                  (pick) => pick.card.team === card.team,
                ),
            ) ?? choices[0]);
    ({ draftState: state, roster } = applyPick(state, roster, pick.id));
  }
  assert.ok(isRosterComplete(roster));
  const cards = getRosterCards(roster);
  assert.equal(new Set(cards.map((p) => p.card.playerId)).size, 8);
  assert.equal(redrawRound(state, roster), state);
  const { rating, tier } = getTeamRatingResult(roster);
  const expectedRaw = cards.reduce(
    (sum, p) =>
      sum + p.card.normalizedValue * (p.slot === 'MVP' ? MVP_WEIGHT : 1),
    0,
  );
  assert.ok(Math.abs(expectedRaw - calculateRawScore(roster)) < 1e-8);
  assert.equal(
    rating,
    Math.round(
      Math.max(44, Math.min(212, 44 + ((expectedRaw - 400) / 280) * 168)),
    ),
  );
  ratings.push(rating);
  const record = recordCompletedDraft({
    progression,
    mode: run % 2 ? 'hard' : 'normal',
    rating,
    tier,
    roster,
  });
  progression = record.progression;
  assert.equal(
    progression.history[0].missionIds?.length,
    getMissionProgress(roster).filter((m) => m.complete).length,
  );
}
assert.equal(writes, 0);
assert.equal(progression.totalDrafts, 1000);
assert.equal(progression.history.length, 25);
assert.equal(
  Object.values(progression.cardDraftCounts).reduce((a, b) => a + b, 0),
  8000,
);
const missionRoster = createEmptyRoster();
const template = PLAYER_CARDS[0];
const slots = Object.keys(missionRoster) as (keyof typeof missionRoster)[];
slots.forEach((slot, i) => {
  missionRoster[slot] = {
    ...template,
    team: `TEAM${i}`,
    season: [1998, 2001, 2010, 2020][i % 4],
  };
});
assert.deepEqual(
  getMissionProgress(missionRoster).map((m) => m.complete),
  [true, false, true],
);
missionRoster.QB!.team = 'SAME';
missionRoster.RB1!.team = 'SAME';
missionRoster.RB2!.team = 'SAME';
assert.deepEqual(
  getMissionProgress(missionRoster).map((m) => m.complete),
  [true, true, false],
);
missionRoster.QB!.team = 'LAR';
missionRoster.RB1!.team = 'STL';
missionRoster.RB2!.team = 'LAR';
assert.equal(
  getMissionProgress(missionRoster)[1].complete,
  true,
  'Relocated franchises count as the same team',
);
assert.equal(getMissionProgress(missionRoster)[2].value, 6);
assert.ok(
  Object.values(progression.missionWins ?? {}).some((count) => count > 25),
  'Lifetime mission awards survive the history cap',
);
saveProgression(progression);
assert.deepEqual(
  loadProgression(),
  progression,
  'Progression round-trip includes missions, both modes and history',
);
stored.set(STORAGE_KEY, '{bad-json');
assert.equal(loadProgression().totalDrafts, 0);
stored.set(
  STORAGE_KEY,
  JSON.stringify({
    version: 1,
    totalDrafts: 3,
    totalScore: 400,
    bestScores: { normal: 150 },
    cardDraftCounts: {},
    history: [],
  }),
);
assert.equal(
  loadProgression().totalDrafts,
  3,
  'Old saves load without mission fields',
);
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  get() {
    throw new Error('Storage blocked');
  },
});
assert.equal(loadProgression().totalDrafts, 0);
assert.doesNotThrow(() => saveProgression(progression));
console.log(
  `PASS: 1,000 redraw drafts across all seven legal redraw rounds; ${openBoards} honest fallback boards; ratings ${Math.min(...ratings)}–${Math.max(...ratings)}. Mission, scoring, persistence, migration and storage isolation checks passed.`,
);
