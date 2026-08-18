import { createContext } from 'react';
import type { ThemeId } from './types';

export interface ThemeContextValue {
  themeId: ThemeId;
  setThemeId: (themeId: ThemeId) => void;
  isSelectorOpen: boolean;
  openThemeSelector: () => void;
  closeThemeSelector: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
