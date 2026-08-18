import type { ThemeDefinition, ThemeId } from './types';

export const DEFAULT_THEME_ID: ThemeId = 'gridiron';

export const STORAGE_KEY = 'draft-cards-theme-v1';

export const THEMES: ThemeDefinition[] = [
  {
    id: 'gridiron',
    name: 'Gridiron',
    description: 'Dark field green & broadcast lights',
    swatches: ['#080c0a', '#22c55e', '#141a16'],
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    description: 'Crisp black, white & charcoal',
    swatches: ['#0a0a0a', '#f5f5f5', '#525252'],
  },
  {
    id: 'ice',
    name: 'Ice',
    description: 'Midnight navy & cool cyan',
    swatches: ['#0a0e1a', '#22d3ee', '#1e293b'],
  },
  {
    id: 'crimson',
    name: 'Crimson',
    description: 'Deep burgundy stadium night',
    swatches: ['#0c0608', '#dc2626', '#3f1018'],
  },
  {
    id: 'royal',
    name: 'Royal',
    description: 'Indigo, purple & muted gold',
    swatches: ['#0a0a14', '#7c3aed', '#c9a227'],
  },
];

export const VALID_THEME_IDS = new Set<ThemeId>(THEMES.map((t) => t.id));

export function isThemeId(value: string | null | undefined): value is ThemeId {
  return value != null && VALID_THEME_IDS.has(value as ThemeId);
}
