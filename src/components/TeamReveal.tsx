import type { GameMode, RosterState } from '../types';
import { getTeamRatingResult } from '../lib/teamRating';
import { TeamRating } from './TeamRating';
import { FinalRosterGrid } from './FinalRosterGrid';

interface TeamRevealProps {
  roster: RosterState;
  gameMode: GameMode;
  onDraftAgain: () => void;
  onMainMenu: () => void;
}

export function TeamReveal({ roster, gameMode, onDraftAgain, onMainMenu }: TeamRevealProps) {
  const { rating, tier } = getTeamRatingResult(roster);

  return (
    <div className="min-h-screen bg-field-pattern px-4 py-12 md:px-8">
      <div className="max-w-6xl mx-auto">
        {gameMode === 'hard' && (
          <p className="text-center text-xs uppercase tracking-widest text-slate-500 mb-4">
            Hard Mode — Full stats revealed
          </p>
        )}

        <TeamRating rating={rating} tier={tier} />

        <div className="mt-12 mb-8">
          <h2 className="text-center font-display text-3xl text-white uppercase tracking-wide mb-8">
            Your Roster
          </h2>
          <FinalRosterGrid roster={roster} />
        </div>

        <div className="flex flex-col items-center gap-4 mt-12">
          <button type="button" onClick={onDraftAgain} className="btn-primary-gold">
            Draft Again
          </button>
          <button type="button" onClick={onMainMenu} className="btn-secondary btn-secondary--quiet">
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}
