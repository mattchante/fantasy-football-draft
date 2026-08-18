export type ThemeId = 'gridiron' | 'monochrome' | 'ice' | 'crimson' | 'royal';

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  description: string;
  swatches: [string, string, string];
}
