import type { PlayerCard, RemainingNeeds, RosterSlot, RosterState } from '../types';

export const ROSTER_SLOTS: RosterSlot[] = [
  'QB',
  'RB1',
  'RB2',
  'WR1',
  'WR2',
  'TE',
  'FLEX',
  'MVP',
];

export const NORMAL_PICKS = 7;
export const TOTAL_PICKS = 8;

export function createEmptyRoster(): RosterState {
  return {
    QB: null,
    RB1: null,
    RB2: null,
    WR1: null,
    WR2: null,
    TE: null,
    FLEX: null,
    MVP: null,
  };
}

export function countNormalPicks(roster: RosterState): number {
  let count = 0;
  for (const slot of ['QB', 'RB1', 'RB2', 'WR1', 'WR2', 'TE', 'FLEX'] as RosterSlot[]) {
    if (roster[slot]) count++;
  }
  return count;
}

export function getRemainingNeeds(roster: RosterState): RemainingNeeds {
  const normalPicksRemaining = NORMAL_PICKS - countNormalPicks(roster);

  return {
    qb: roster.QB ? 0 : 1,
    rb: (roster.RB1 ? 0 : 1) + (roster.RB2 ? 0 : 1),
    wr: (roster.WR1 ? 0 : 1) + (roster.WR2 ? 0 : 1),
    te: roster.TE ? 0 : 1,
    flex: roster.FLEX ? 0 : 1,
    mvp: roster.MVP ? 0 : 1,
    normalPicksRemaining,
  };
}

export function isRosterComplete(roster: RosterState): boolean {
  return ROSTER_SLOTS.every((slot) => roster[slot] !== null);
}

export function isNormalRosterComplete(roster: RosterState): boolean {
  return countNormalPicks(roster) === NORMAL_PICKS;
}

function assignNormalPick(roster: RosterState, card: PlayerCard): RosterSlot {
  switch (card.position) {
    case 'QB':
      if (!roster.QB) return 'QB';
      break;
    case 'RB':
      if (!roster.RB1) return 'RB1';
      if (!roster.RB2) return 'RB2';
      if (!roster.FLEX) return 'FLEX';
      break;
    case 'WR':
      if (!roster.WR1) return 'WR1';
      if (!roster.WR2) return 'WR2';
      if (!roster.FLEX) return 'FLEX';
      break;
    case 'TE':
      if (!roster.TE) return 'TE';
      if (!roster.FLEX) return 'FLEX';
      break;
  }
  throw new Error(`Cannot assign ${card.name} (${card.position}) to roster`);
}

export function assignPlayerToRoster(
  roster: RosterState,
  card: PlayerCard,
  isMvpPick = false,
): { roster: RosterState; slot: RosterSlot } {
  const newRoster = { ...roster };

  if (isMvpPick) {
    if (newRoster.MVP) throw new Error('MVP slot already filled');
    newRoster.MVP = card;
    return { roster: newRoster, slot: 'MVP' };
  }

  const slot = assignNormalPick(newRoster, card);
  newRoster[slot] = card;
  return { roster: newRoster, slot };
}

export function simulateAssign(
  roster: RosterState,
  card: PlayerCard,
  isMvpPick = false,
): RosterState {
  return assignPlayerToRoster(roster, card, isMvpPick).roster;
}

export function getRosterCards(roster: RosterState): { slot: RosterSlot; card: PlayerCard }[] {
  return ROSTER_SLOTS.filter((slot) => roster[slot] !== null).map((slot) => ({
    slot,
    card: roster[slot]!,
  }));
}
