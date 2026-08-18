import { useEffect, useRef } from 'react';
import { THEMES, useTheme, type ThemeId } from '../lib/theme';

export function ThemeSelector() {
  const { themeId, setThemeId, isSelectorOpen, closeThemeSelector } = useTheme();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isSelectorOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeThemeSelector();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSelectorOpen, closeThemeSelector]);

  if (!isSelectorOpen) return null;

  return (
    <div
      className="theme-selector-overlay"
      role="presentation"
      onClick={closeThemeSelector}
    >
      <div
        ref={panelRef}
        className="theme-selector-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="theme-selector-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="theme-selector-header">
          <div>
            <h2 id="theme-selector-title" className="theme-selector-title">
              Appearance
            </h2>
            <p className="theme-selector-subtitle">
              Choose a visual theme. Changes apply instantly.
            </p>
          </div>
          <button
            type="button"
            className="theme-selector-close"
            onClick={closeThemeSelector}
            aria-label="Close appearance panel"
          >
            Close
          </button>
        </div>

        <div className="theme-selector-grid" role="radiogroup" aria-label="Theme selection">
          {THEMES.map((theme) => {
            const selected = theme.id === themeId;
            return (
              <button
                key={theme.id}
                type="button"
                role="radio"
                aria-checked={selected}
                className={`theme-option${selected ? ' theme-option--selected' : ''}`}
                onClick={() => setThemeId(theme.id as ThemeId)}
              >
                <span className="theme-option__swatches" aria-hidden>
                  {theme.swatches.map((color) => (
                    <span
                      key={color}
                      className="theme-option__swatch"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </span>
                <span className="theme-option__text">
                  <span className="theme-option__name">{theme.name}</span>
                  <span className="theme-option__description">{theme.description}</span>
                </span>
                {selected && <span className="theme-option__check" aria-hidden>Active</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function ThemeSelectorTrigger({ className = '' }: { className?: string }) {
  const { openThemeSelector } = useTheme();

  return (
    <button
      type="button"
      className={`theme-selector-trigger ${className}`.trim()}
      onClick={openThemeSelector}
    >
      Appearance
    </button>
  );
}
