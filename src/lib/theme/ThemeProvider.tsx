import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { applyTheme, getAppliedTheme } from './applyTheme';
import { loadTheme, saveTheme } from './storage';
import { ThemeContext } from './themeContext';
import type { ThemeId } from './types';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>(() => getAppliedTheme() ?? loadTheme());
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  useEffect(() => {
    applyTheme(themeId);
    saveTheme(themeId);
  }, [themeId]);

  const setThemeId = useCallback((next: ThemeId) => {
    setThemeIdState(next);
  }, []);

  const openThemeSelector = useCallback(() => setIsSelectorOpen(true), []);
  const closeThemeSelector = useCallback(() => setIsSelectorOpen(false), []);

  const value = useMemo(
    () => ({
      themeId,
      setThemeId,
      isSelectorOpen,
      openThemeSelector,
      closeThemeSelector,
    }),
    [themeId, setThemeId, isSelectorOpen, openThemeSelector, closeThemeSelector],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
