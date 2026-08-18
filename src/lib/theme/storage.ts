import { DEFAULT_THEME_ID, STORAGE_KEY, isThemeId } from './themes';
import type { ThemeId } from './types';

export function loadTheme(): ThemeId {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isThemeId(stored) ? stored : DEFAULT_THEME_ID;
  } catch {
    return DEFAULT_THEME_ID;
  }
}

export function saveTheme(themeId: ThemeId): void {
  try {
    localStorage.setItem(STORAGE_KEY, themeId);
  } catch {
    // Continue with in-memory theme if storage is unavailable
  }
}
