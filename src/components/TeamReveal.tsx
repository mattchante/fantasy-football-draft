import { DraftMissions } from './DraftMissions';
import { getRosterCards } from '../lib/roster';
import { RATING_TIERS } from '../data/ratingTiers';
import type { CompletionFeedback, GameMode, RosterState } from '../types';
import { getTeamRatingResult } from '../lib/teamRating';
import { TeamRating } from './TeamRating';
import { FinalRosterGrid } from './FinalRosterGrid';
import { ProgressionFeedback } from './ProgressionFeedback';

interface TeamRevealProps {
  roster: RosterState;
  gameMode: GameMode;
  completionFeedback: CompletionFeedback | null;
  previousBest?: number;
  onDraftAgain: () => void;
  onMainMenu: () => void;
}

export function TeamReveal({
  roster,
  gameMode,
  completionFeedback,
  previousBest,
  onDraftAgain,
  onMainMenu,
}: TeamRevealProps) {
  const { rating, tier, rawScore } = getTeamRatingResult(roster);

  const ranked = getRosterCards(roster).sort(
    (a, b) => b.card.normalizedValue - a.card.normalizedValue,
  );
  const nextTier = RATING_TIERS.find((t) => t.min > rating);
  const totalPoints = ranked.reduce(
    (total, { card }) => total + card.fantasyPoints,
    0,
  );
  return (
    <div className="min-h-screen bg-field-pattern px-4 py-12 md:px-8">
      <div className="max-w-6xl mx-auto">
        {gameMode === 'hard' && (
          <p className="text-center text-xs uppercase tracking-widest text-theme-faint mb-4">
            Hard Mode — Full stats revealed
          </p>
        )}

        <h1 className="text-center font-display text-4xl text-theme-primary uppercase tracking-wide mb-6">
          The team is in.
        </h1>

        <div className="result-scoreboard">
          <TeamRating rating={rating} tier={tier} />
          <div className="result-story">
            <span className="section-kicker">
              FINAL WHISTLE / {gameMode.toUpperCase()}
            </span>
            <h2>
              {completionFeedback?.isPersonalBest
                ? 'A new standard.'
                : rating >= 175
                  ? 'Built to dominate.'
                  : 'Your next great team starts here.'}
            </h2>
            <p>
              {previousBest === undefined
                ? 'Your first score is on the board. Now give yourself something to chase.'
                : rating > previousBest
                  ? `${rating - previousBest} points above your previous best of ${previousBest}.`
                  : rating === previousBest
                    ? `You matched your personal best of ${previousBest}.`
                    : `${previousBest - rating} points away from your personal best of ${previousBest}.`}
            </p>
            <div className="result-stats">
              <div>
                <span>SEASON PPR TOTAL</span>
                <strong>{totalPoints.toFixed(1)}</strong>
              </div>
              <div>
                <span>WEIGHTED CARD VALUE</span>
                <strong>{rawScore.toFixed(1)}</strong>
              </div>
            </div>
            <p className="result-next">
              {nextTier
                ? `${nextTier.min - rating} more rating points to reach ${nextTier.label}.`
                : 'Top tier reached. Chase a mission or test yourself in Hard mode.'}
            </p>
          </div>
        </div>
        <ProgressionFeedback feedback={completionFeedback} />
        <div className="result-actions">
          <button
            type="button"
            onClick={onDraftAgain}
            className="btn-primary-gold"
          >
            Run it back ↗
          </button>
          <button type="button" onClick={onMainMenu} className="btn-secondary">
            Main Menu
          </button>
        </div>
        <DraftMissions roster={roster} />
        <div className="result-insights">
          <p>
            <span>STRONGEST SEASON</span>
            <strong>
              {ranked[0].card.season} {ranked[0].card.name}
            </strong>
            {ranked[0].card.normalizedValue.toFixed(1)} position-adjusted value
          </p>
          <p>
            <span>ROOM TO IMPROVE</span>
            <strong>
              {ranked.at(-1)!.slot} · {ranked.at(-1)!.card.name}
            </strong>
            {ranked.at(-1)!.card.normalizedValue.toFixed(1)} value · a position
            to target next time
          </p>
        </div>
        <details className="scoring-note">
          <summary>Inside your team rating</summary>
          <p>
            Your eight position-adjusted card values total {rawScore.toFixed(1)}{' '}
            after the MVP’s 10% bonus. We map that sum to the original 44–212
            rating scale. The PPR total is a sum of historical season totals,
            not a simulated season. Missions do not add points.
          </p>
        </details>

        <div className="mt-12 mb-8">
          <h2 className="text-center font-display text-2xl text-theme-muted uppercase tracking-wide mb-8">
            Your Roster
          </h2>
          <FinalRosterGrid roster={roster} />
        </div>

        <div className="flex flex-col items-center gap-4 mt-12">
          <button
            type="button"
            onClick={onDraftAgain}
            className="btn-primary-gold"
          >
            Draft Again
          </button>
          <button
            type="button"
            onClick={onMainMenu}
            className="btn-secondary btn-secondary--quiet"
          >
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}
