import type { PlayerStats } from '../types';

export const SCORING_RULES = {
  passYdsPerPoint: 25,
  passTD: 4,
  interception: -2,
  rushYdsPerPoint: 10,
  rushTD: 6,
  reception: 1,
  recYdsPerPoint: 10,
  recTD: 6,
} as const;

export function calculatePPR(stats: PlayerStats): number {
  const {
    passYds = 0,
    passTD = 0,
    interceptions = 0,
    rushYds = 0,
    rushTD = 0,
    receptions = 0,
    recYds = 0,
    recTD = 0,
  } = stats;

  return (
    passYds / SCORING_RULES.passYdsPerPoint +
    passTD * SCORING_RULES.passTD +
    interceptions * SCORING_RULES.interception +
    rushYds / SCORING_RULES.rushYdsPerPoint +
    rushTD * SCORING_RULES.rushTD +
    receptions * SCORING_RULES.reception +
    recYds / SCORING_RULES.recYdsPerPoint +
    recTD * SCORING_RULES.recTD
  );
}

export function calculatePPG(stats: PlayerStats, fantasyPoints: number): number {
  const games = stats.games ?? 17;
  return Math.round((fantasyPoints / games) * 10) / 10;
}
