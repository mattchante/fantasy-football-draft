import { useState } from 'react';
import type { GameMode } from '../types';
import type { ProgressionData } from '../lib/progression';
import { ConfirmDialog } from './ConfirmDialog';
import { PersonalRecords } from './PersonalRecords';

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
    <div className="min-h-screen bg-field-pattern flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <div className="mb-2">
          <span className="text-accent-green text-sm font-semibold uppercase tracking-[0.3em]">
            Fantasy Football
          </span>
        </div>

        <h1 className="font-display text-7xl md:text-8xl text-white tracking-wide uppercase leading-none landing-title-glow">
          Draft Cards
        </h1>

        <p className="mt-6 text-slate-400 text-lg max-w-md mx-auto">
          Build your ultimate fantasy roster across themed draft rounds.
          Pick wisely. Draft again.
        </p>

        <div className="mt-10 flex flex-col items-center gap-3">
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
            <p className="text-xs text-slate-500 italic">
              Stats hidden during draft — test your ball knowledge
            </p>
          )}
        </div>

        <div className="mt-8">
          <button type="button" onClick={onStartDraft} className="btn-primary-gold">
            Start Draft
          </button>
        </div>

        <div className="mt-12">
          <PersonalRecords progression={progression} />
        </div>

        <div className="mt-6 flex flex-col items-center gap-2">
          <button type="button" onClick={onOpenHistory} className="btn-secondary btn-secondary--quiet">
            Draft History
          </button>
          <button type="button" onClick={onOpenVault} className="btn-secondary btn-secondary--quiet">
            Card Vault
          </button>
        </div>

        <div className="mt-10">
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="home-reset-link"
          >
            Reset Progression
          </button>
        </div>

        <div className="mt-16 flex justify-center gap-8 text-slate-600 text-sm">
          <span>8 Picks</span>
          <span>·</span>
          <span>Themed Rounds</span>
          <span>·</span>
          <span>Full PPR</span>
        </div>
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
