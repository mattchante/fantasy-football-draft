import { DEFAULT_THEME_ID } from './themes';
import type { ThemeId } from './types';

export function applyTheme(themeId: ThemeId): void {
  document.documentElement.setAttribute('data-theme', themeId);
}

export function getAppliedTheme(): ThemeId {
  const current = document.documentElement.getAttribute('data-theme');
  if (
    current === 'gridiron' ||
    current === 'monochrome' ||
    current === 'ice' ||
    current === 'crimson' ||
    current === 'royal'
  ) {
    return current;
  }
  return DEFAULT_THEME_ID;
}
