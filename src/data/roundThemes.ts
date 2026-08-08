import type { RoundTheme } from '../types';

export const ROUND_THEMES: RoundTheme[] = [
  {
    id: 'field-generals',
    title: 'Field Generals',
    description: 'Commanders of the offense. Elite quarterbacks who move the chains and light up the scoreboard.',
    categoryIds: ['field-generals'],
  },
  {
    id: 'reliable-guys',
    title: 'Reliable Guys',
    description: 'Steady veterans you can count on week after week. No flash, all substance.',
    categoryIds: ['reliable-guys'],
  },
  {
    id: 'ppr-machines',
    title: 'PPR Machines',
    description: 'Reception factories built for full-PPR scoring. Targets are their love language.',
    categoryIds: ['ppr-machines'],
  },
  {
    id: 'bell-cows',
    title: 'Bell Cows',
    description: 'Workhorse backs who carry the load. Volume is king in fantasy.',
    categoryIds: ['bell-cows'],
  },
  {
    id: 'deep-threats',
    title: 'Deep Threats',
    description: 'Vertical weapons who stretch the field. One catch can change everything.',
    categoryIds: ['deep-threats'],
  },
  {
    id: 'touchdown-merchants',
    title: 'Touchdown Merchants',
    description: 'End zone specialists. They find paydirt when it matters most.',
    categoryIds: ['touchdown-merchants'],
  },
  {
    id: 'current-superstars',
    title: 'Current Superstars',
    description: 'The best of the modern NFL. Peak performance from the most recent season.',
    categoryIds: ['current-superstars'],
  },
  {
    id: 'old-school-workhorses',
    title: 'Old School Workhorses',
    description: 'Legendary seasons from running backs who defined an era.',
    categoryIds: ['old-school-workhorses'],
  },
  {
    id: 'mvp-showcase',
    title: 'MVP Showcase',
    description: 'The elite of the elite. One wildcard pick to crown your team\'s MVP.',
    categoryIds: ['mvp-showcase'],
    isMvpRound: true,
  },
];

export const NORMAL_ROUND_THEMES = ROUND_THEMES.filter((t) => !t.isMvpRound);

export const MVP_ROUND_THEME = ROUND_THEMES.find((t) => t.isMvpRound)!;
