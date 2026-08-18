import { useState } from 'react';
import type { GameMode } from '../types';
import type { ProgressionData } from '../lib/progression';
import { ConfirmDialog } from './ConfirmDialog';
import { PersonalRecords } from './PersonalRecords';
import { ThemeSelectorTrigger } from './ThemeSelector';

interface HomeScreenProps {
  gameMode: GameMode;
  progression: ProgressionData;
  onGameModeChange: (mode: GameMode) => void;
  onStartDraft: () => void;
  onOpenHistory: () => void;
  onOpenVault: () => void;
  onResetProgression: () => void;
}

export function HomeScreen({
  gameMode,
  progression,
  onGameModeChange,
  onStartDraft,
  onOpenHistory,
  onOpenVault,
  onResetProgression,
}: HomeScreenProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleConfirmReset = () => {
    onResetProgression();
    setShowResetConfirm(false);
  };

  return (
    <div className="home-screen bg-field-pattern">
      <div className="home-screen__container">
        <ThemeSelectorTrigger variant="icon" className="home-screen__appearance" />

        <header className="home-hero">
          <span className="home-hero__eyebrow">Fantasy Football</span>
          <h1 className="home-hero__title landing-title-glow">Draft Cards</h1>
          <p className="home-hero__tagline">
            Build your ultimate fantasy roster across themed draft rounds.
            Pick wisely. Draft again.
          </p>
        </header>

        <section className="home-play" aria-label="Start a draft">
          <div className="home-play__row">
            <div className="home-play__mode">
              <div className="mode-toggle">
                <button
                  type="button"
                  className={`mode-toggle-btn ${gameMode === 'normal' ? 'mode-toggle-btn--active' : ''}`}
                  onClick={() => onGameModeChange('normal')}
                >
                  Normal
                </button>
                <button
                  type="button"
                  className={`mode-toggle-btn ${gameMode === 'hard' ? 'mode-toggle-btn--active' : ''}`}
                  onClick={() => onGameModeChange('hard')}
                >
                  Hard
                </button>
              </div>
              {gameMode === 'hard' && (
                <p className="home-play__hard-hint">Stats hidden during draft — test your ball knowledge</p>
              )}
            </div>
            <button type="button" onClick={onStartDraft} className="btn-primary-gold home-play__start">
              Start Draft
            </button>
          </div>
        </section>

        <section className="home-dashboard" aria-label="Progression and destinations">
          <div className="home-dashboard__records">
            <PersonalRecords
              progression={progression}
              compact
              onReset={() => setShowResetConfirm(true)}
            />
          </div>
          <div className="home-dashboard__destinations">
            <button type="button" className="home-destination-card" onClick={onOpenHistory}>
              <span className="home-destination-card__icon" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M3 4.5h12M3 9h8M3 13.5h10"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <circle cx="14" cy="9" r="1.25" fill="currentColor" />
                </svg>
              </span>
              <span className="home-destination-card__text">
                <span className="home-destination-card__title">Draft History</span>
                <span className="home-destination-card__label">Review your past drafts</span>
              </span>
              <span className="home-destination-card__arrow" aria-hidden>→</span>
            </button>
            <button type="button" className="home-destination-card" onClick={onOpenVault}>
              <span className="home-destination-card__icon" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect
                    x="2.5"
                    y="4"
                    width="13"
                    height="10.5"
                    rx="1.25"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M6.5 4V3a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 11.5 3v1"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path d="M2.5 8h13" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </span>
              <span className="home-destination-card__text">
                <span className="home-destination-card__title">Card Vault</span>
                <span className="home-destination-card__label">Browse your collection</span>
              </span>
              <span className="home-destination-card__arrow" aria-hidden>→</span>
            </button>
          </div>
        </section>

        <footer className="home-footer">
          <span>8 Picks</span>
          <span className="home-footer__dot" aria-hidden>·</span>
          <span>Themed Rounds</span>
          <span className="home-footer__dot" aria-hidden>·</span>
          <span>Full PPR</span>
        </footer>
      </div>

      {showResetConfirm && (
        <ConfirmDialog
          title="Reset progression?"
          message="Reset all progression? This cannot be undone."
          confirmLabel="Reset"
          onConfirm={handleConfirmReset}
          onCancel={() => setShowResetConfirm(false)}
        />
      )}
    </div>
  );
}
