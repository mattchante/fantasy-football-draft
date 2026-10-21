import { PLAYER_CARDS } from '../data/playerCards';
import { getCollectionBook } from '../lib/achievements';
import { AchievementTile } from './AchievementTile';
import { PlayerCard } from './PlayerCard';
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
  onOpenAchievements: () => void;
  onResetProgression: () => void;
}

export function HomeScreen({
  gameMode,
  progression,
  onGameModeChange,
  onStartDraft,
  onOpenHistory,
  onOpenVault,
  onOpenAchievements,
  onResetProgression,
}: HomeScreenProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleConfirmReset = () => {
    onResetProgression();
    setShowResetConfirm(false);
  };

  const collected = PLAYER_CARDS.filter(
    (card) => (progression.cardDraftCounts[card.id] ?? 0) > 0,
  ).length;
  const book = getCollectionBook(progression);
  const unlockedCount = book.filter((entry) => entry.count > 0).length;
  const rarityOrder = { common: 0, rare: 1, legendary: 2 };
  // Lead with the most reachable locked goals; fall back to trophies.
  const featured = [
    ...book
      .filter((entry) => entry.count === 0)
      .sort(
        (a, b) =>
          rarityOrder[a.achievement.rarity] - rarityOrder[b.achievement.rarity],
      ),
    ...book.filter((entry) => entry.count > 0).sort((a, b) => b.count - a.count),
  ].slice(0, 3);

  const showcase = [
    'ladainian-tomlinson-2006',
    'randy-moss-2007',
    'patrick-mahomes-2018',
  ]
    .map((id) => PLAYER_CARDS.find((card) => card.id === id))
    .filter((card) => card !== undefined);

  return (
    <div className="home-screen bg-field-pattern">
      <div className="home-screen__container">
        <ThemeSelectorTrigger
          variant="icon"
          className="home-screen__appearance"
        />

        <div className="home-masthead">
          <span className="brand-mark">DC /</span>
          <span>THE ALL-TIME DRAFT ROOM</span>
          <span className="live-label">● ON THE CLOCK</span>
        </div>
        <div className="home-feature">
          <div className="home-feature__copy">
            <header className="home-hero">
              <span className="home-hero__eyebrow">
                Real seasons. Unreal teams.
              </span>
              <h1 className="home-hero__title">
                Draft
                <br />
                <em>Greatness.</em>
              </h1>
              <p className="home-hero__tagline">
                What if every NFL season was on the same draft board? Eight
                picks. One MVP. Your all-time team.
              </p>
            </header>

            <section className="home-play" aria-label="Start a draft">
              <div className="home-play__row">
                <div className="home-play__mode">
                  <div className="mode-toggle">
                    <button
                      type="button"
                      className={`mode-toggle-btn ${gameMode === 'normal' ? 'mode-toggle-btn--active' : ''}`}
                      aria-pressed={gameMode === 'normal'}
                      onClick={() => onGameModeChange('normal')}
                    >
                      Normal
                    </button>
                    <button
                      type="button"
                      className={`mode-toggle-btn ${gameMode === 'hard' ? 'mode-toggle-btn--active' : ''}`}
                      aria-pressed={gameMode === 'hard'}
                      onClick={() => onGameModeChange('hard')}
                    >
                      Hard
                    </button>
                  </div>
                  <p className="home-play__hard-hint">
                    {gameMode === 'hard'
                      ? 'Trust your ball knowledge. Stats revealed at the finish.'
                      : 'Box scores only. Spot the best season on every board.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onStartDraft}
                  className="btn-primary-gold home-play__start"
                >
                  Start Draft <span aria-hidden>↗</span>
                </button>
              </div>
            </section>

            <div className="home-rules">
              <span>
                <b>01</b> Pick from three cards
              </span>
              <span>
                <b>02</b> Build all eight slots
              </span>
              <span>
                <b>03</b> Crown your MVP
              </span>
            </div>
          </div>
          <div
            className="home-showcase"
            aria-label="Featured historical season cards"
          >
            <div className="home-showcase__label">
              THE ARCHIVE <span>{PLAYER_CARDS.length} SEASONS TO DISCOVER</span>
            </div>
            <div className="home-showcase__cards">
              {showcase.map((card) => (
                <PlayerCard key={card.id} card={card} variant="reveal" />
              ))}
            </div>
            <p>Different eras. Same field.</p>
          </div>
        </div>
        <section className="home-achievements" aria-label="Achievements">
          <div className="section-kicker">
            Collection book{' '}
            <span>
              {unlockedCount} / {book.length} achievements unlocked
            </span>
          </div>
          <div className="achievement-grid">
            {featured.map((entry) => (
              <AchievementTile key={entry.achievement.id} entry={entry} />
            ))}
          </div>
          <button
            type="button"
            className="home-achievements__open"
            onClick={onOpenAchievements}
          >
            Open collection book →
          </button>
        </section>
        <section
          className="home-dashboard"
          aria-label="Progression and destinations"
        >
          <div className="home-dashboard__records">
            <PersonalRecords
              progression={progression}
              compact
              onReset={() => setShowResetConfirm(true)}
            />
          </div>
          <div className="home-dashboard__destinations">
            <button
              type="button"
              className="home-destination-card"
              onClick={onOpenHistory}
            >
              <span className="home-destination-card__icon" aria-hidden>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
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
                <span className="home-destination-card__title">
                  Draft History
                </span>
                <span className="home-destination-card__label">
                  Review your past drafts
                </span>
              </span>
              <span className="home-destination-card__arrow" aria-hidden>
                →
              </span>
            </button>
            <button
              type="button"
              className="home-destination-card"
              onClick={onOpenVault}
            >
              <span className="home-destination-card__icon" aria-hidden>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
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
                <span className="home-destination-card__label">
                  {collected} / {PLAYER_CARDS.length} seasons collected
                </span>
              </span>
              <span className="home-destination-card__arrow" aria-hidden>
                →
              </span>
            </button>
          </div>
        </section>

        <footer className="home-footer">
          <span>8 Picks</span>
          <span className="home-footer__dot" aria-hidden>
            ·
          </span>
          <span>One Redraw</span>
          <span className="home-footer__dot" aria-hidden>
            ·
          </span>
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
