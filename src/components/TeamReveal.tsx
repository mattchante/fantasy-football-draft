import type { RosterState } from '../types';
import { getTeamRatingResult } from '../lib/teamRating';
import { TeamRating } from './TeamRating';
import { FinalRosterGrid } from './FinalRosterGrid';

interface TeamRevealProps {
  roster: RosterState;
  onDraftAgain: () => void;
}

export function TeamReveal({ roster, onDraftAgain }: TeamRevealProps) {
  const { rating, tier } = getTeamRatingResult(roster);

  return (
    <div className="min-h-screen bg-field-pattern px-4 py-12 md:px-8">
      <div className="max-w-6xl mx-auto">
        <TeamRating rating={rating} tier={tier} />

        <div className="mt-12 mb-8">
          <h2 className="text-center font-display text-3xl text-white uppercase tracking-wide mb-8">
            Your Roster
          </h2>
          <FinalRosterGrid roster={roster} />
        </div>

        <div className="flex justify-center mt-12">
          <button
            type="button"
            onClick={onDraftAgain}
            className="
              px-12 py-4 rounded-lg font-bold text-lg uppercase tracking-wider
              bg-accent-gold text-bg-primary
              hover:bg-yellow-300 hover:scale-105
              transition-all duration-200
              shadow-[0_0_30px_rgba(245,200,66,0.3)]
            "
          >
            Draft Again
          </button>
        </div>
      </div>
    </div>
  );
}
