const NAME_SUFFIXES = ['Jr.', 'Sr.', 'II', 'III', 'IV', 'V'] as const;

const SURNAME_PARTICLES = new Set([
  'St.', 'St', 'Van', 'De', 'La', 'Le', 'Du', 'Del', 'Di', 'Da', 'Mc', 'Mac',
]);

const TEAM_NAMES: Record<string, string> = {
  ARI: 'CARDINALS',
  ATL: 'FALCONS',
  BAL: 'RAVENS',
  BUF: 'BILLS',
  CAR: 'PANTHERS',
  CHI: 'BEARS',
  CIN: 'BENGALS',
  CLE: 'BROWNS',
  DAL: 'COWBOYS',
  DEN: 'BRONCOS',
  DET: 'LIONS',
  GB: 'PACKERS',
  HOU: 'TEXANS',
  IND: 'COLTS',
  JAX: 'JAGUARS',
  KC: 'CHIEFS',
  LAC: 'CHARGERS',
  LAR: 'RAMS',
  LV: 'RAIDERS',
  MIA: 'DOLPHINS',
  MIN: 'VIKINGS',
  NE: 'PATRIOTS',
  NO: 'SAINTS',
  NYG: 'GIANTS',
  NYJ: 'JETS',
  PHI: 'EAGLES',
  PIT: 'STEELERS',
  SEA: 'SEAHAWKS',
  SF: '49ERS',
  TB: 'BUCCANEERS',
  TEN: 'TITANS',
  WAS: 'COMMANDERS',
  SD: 'CHARGERS',
  STL: 'RAMS',
};

export interface ParsedPlayerName {
  firstName: string;
  lastName: string;
}

function isSuffix(token: string): boolean {
  return NAME_SUFFIXES.includes(token as (typeof NAME_SUFFIXES)[number]);
}

function isParticle(token: string): boolean {
  return SURNAME_PARTICLES.has(token);
}

export function parsePlayerName(name: string): ParsedPlayerName {
  const tokens = name.trim().split(/\s+/);
  if (tokens.length === 0) {
    return { firstName: '', lastName: '' };
  }
  if (tokens.length === 1) {
    return { firstName: tokens[0], lastName: '' };
  }

  const suffixes: string[] = [];
  while (tokens.length > 1 && isSuffix(tokens[tokens.length - 1])) {
    suffixes.unshift(tokens.pop()!);
  }

  const firstName = tokens[0];
  const remaining = tokens.slice(1);

  if (remaining.length === 0) {
    const suffixPart = suffixes.length > 0 ? ` ${suffixes.join(' ')}` : '';
    return { firstName, lastName: suffixPart.trim() || firstName };
  }

  const particleIndex = remaining.findIndex((token) => isParticle(token));
  let lastName: string;

  if (particleIndex >= 0) {
    lastName = remaining.slice(particleIndex).join(' ');
  } else {
    lastName = remaining.join(' ');
  }

  if (suffixes.length > 0) {
    lastName = `${lastName} ${suffixes.join(' ')}`.trim();
  }

  return { firstName, lastName };
}

export function getTeamDisplayName(abbr: string): string {
  return TEAM_NAMES[abbr.toUpperCase()] ?? abbr.toUpperCase();
}

export function formatSeason(season: number): string {
  return `${season} SEASON`;
}

export function isPlaceholderImageUrl(url: string): boolean {
  return url.includes('placehold.co') || url.includes('placeholder');
}

export interface ParsedHeadlineStat {
  value: string;
  label: string;
}

/**
 * Split "1,708 Rec Yds" into value + label for stat rows.
 */
export function parseHeadlineStat(stat: string): ParsedHeadlineStat {
  const match = stat.match(/^([\d,]+(?:\.\d+)?)\s+(.+)$/);
  if (match) {
    return { value: match[1], label: match[2].toUpperCase() };
  }
  return { value: stat, label: '' };
}
