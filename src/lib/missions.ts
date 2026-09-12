import type { RosterState } from '../types';
import { getTeamDisplayName } from './playerDisplay';
import { getRosterCards } from './roster';

export const MISSIONS = [
  {
    id: 'time-machine',
    title: 'Time Machine',
    description: 'Draft seasons from 3 different decades.',
    target: 3,
    symbol: '03',
  },
  {
    id: 'home-field',
    title: 'Home Field',
    description: 'Draft 3 players from the same NFL team.',
    target: 3,
    symbol: 'H',
  },
  {
    id: 'road-trip',
    title: 'Road Trip',
    description: 'Finish with 8 different NFL teams.',
    target: 8,
    symbol: '08',
  },
] as const;

export type MissionId = (typeof MISSIONS)[number]['id'];

export function getMissionProgress(roster: RosterState) {
  const cards = getRosterCards(roster).map(({ card }) => card);
  const teams = new Map<string, number>();
  cards.forEach((card) => {
    const team = getTeamDisplayName(card.team);
    teams.set(team, (teams.get(team) ?? 0) + 1);
  });
  const values = {
    'time-machine': new Set(cards.map((card) => Math.floor(card.season / 10)))
      .size,
    'home-field': Math.max(0, ...teams.values()),
    'road-trip': teams.size,
  };
  return MISSIONS.map((mission) => ({
    ...mission,
    value: Math.min(values[mission.id], mission.target),
    complete: values[mission.id] >= mission.target,
  }));
}
