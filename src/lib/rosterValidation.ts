import type { PlayerCard, RosterState } from '../types';
import { getRemainingNeeds, getRosterCards, simulateAssign } from './roster';

interface PositionCounts {
  qb: number;
  rb: number;
  wr: number;
  te: number;
}

function rosterHasPlayerId(roster: RosterState, playerId: string): boolean {
  return getRosterCards(roster).some(({ card }) => card.playerId === playerId);
}

function getFilledCounts(roster: RosterState): PositionCounts {
  const slots = [roster.QB, roster.RB1, roster.RB2, roster.WR1, roster.WR2, roster.TE, roster.FLEX];
  let qb = 0, rb = 0, wr = 0, te = 0;

  for (const card of slots) {
    if (!card) continue;
    switch (card.position) {
      case 'QB': qb++; break;
      case 'RB': rb++; break;
      case 'WR': wr++; break;
      case 'TE': te++; break;
    }
  }

  return { qb, rb, wr, te };
}

/**
 * Check if a roster state can still be completed with `picksRemaining` normal picks.
 * Requirements: 1 QB, 2 RB, 2 WR, 1 TE, 1 FLEX (7 total skill picks).
 * FLEX is filled by overflow RB/WR/TE after dedicated slots.
 */
export function canCompleteRoster(
  roster: RosterState,
  picksRemaining: number,
): boolean {
  const needs = getRemainingNeeds(roster);
  const minRequired = needs.qb + needs.rb + needs.wr + needs.te + needs.flex;

  if (minRequired > picksRemaining) return false;

  // Max possible: each pick can fill at most one dedicated slot + potentially flex
  // We need at least minRequired picks, and can't exceed picksRemaining
  if (picksRemaining < minRequired) return false;

  const counts = getFilledCounts(roster);
  const rbNeeded = Math.max(0, 2 - counts.rb);
  const wrNeeded = Math.max(0, 2 - counts.wr);
  const teNeeded = Math.max(0, 1 - counts.te);
  const qbNeeded = Math.max(0, 1 - counts.qb);

  const flexNeeded = roster.FLEX ? 0 : 1;
  const totalNeeded = qbNeeded + rbNeeded + wrNeeded + teNeeded + flexNeeded;

  if (totalNeeded > picksRemaining) return false;

  return true;
}

export function isSafePick(
  roster: RosterState,
  card: PlayerCard,
  picksRemaining: number,
  isMvpPick = false,
): boolean {
  if (rosterHasPlayerId(roster, card.playerId)) {
    return false;
  }

  if (isMvpPick) {
    return !roster.MVP;
  }

  if (picksRemaining <= 0) return false;

  try {
    const simulated = simulateAssign(roster, card, false);
    return canCompleteRoster(simulated, picksRemaining - 1);
  } catch {
    return false;
  }
}

export function filterSafeCards(
  cards: PlayerCard[],
  roster: RosterState,
  picksRemaining: number,
  isMvpPick = false,
): PlayerCard[] {
  return cards.filter((card) => isSafePick(roster, card, picksRemaining, isMvpPick));
}

export function getPositionUrgency(roster: RosterState, picksRemaining: number): Record<string, number> {
  const needs = getRemainingNeeds(roster);
  const urgency: Record<string, number> = {
    QB: 0,
    RB: 0,
    WR: 0,
    TE: 0,
  };

  if (needs.qb > 0 && picksRemaining <= needs.qb + needs.flex) {
    urgency.QB = 10;
  }
  if (needs.rb > 0 && picksRemaining <= needs.rb + needs.wr + needs.te + needs.flex) {
    urgency.RB = needs.rb * 3;
  }
  if (needs.wr > 0 && picksRemaining <= needs.wr + needs.rb + needs.te + needs.flex) {
    urgency.WR = needs.wr * 3;
  }
  if (needs.te > 0 && picksRemaining <= needs.te + needs.flex + 1) {
    urgency.TE = needs.te * 4;
  }

  return urgency;
}
