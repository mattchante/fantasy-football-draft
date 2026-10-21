import { useState } from 'react';
import { AchievementTile } from './AchievementTile';
import { getRosterCards } from '../lib/roster';
import { DRAFT_GRADES } from '../data/draftGrades';
import type {
  CompletionFeedback,
  DraftedPick,
  GameMode,
  RosterState,
} from '../types';
import { getTeamRatingResult } from '../lib/teamRating';
import { formatShareText, getDraftGrade } from '../lib/draftGrade';
import { getCollectionBook } from '../lib/achievements';
import type { ProgressionData } from '../lib/progression';
import { DraftGradeDisplay } from './DraftGradeDisplay';
import { FinalRosterGrid } from './FinalRosterGrid';
import { PickReview } from './PickReview';
import { ProgressionFeedback } from './ProgressionFeedback';

interface TeamRevealProps {
  roster: RosterState;
  picks: DraftedPick[];
  gameMode: GameMode;
  completionFeedback: CompletionFeedback | null;
  progression: ProgressionData;
  previousBest?: number;
  onDraftAgain: () => void;
  onMainMenu: () => void;
  onOpenAchievements: () => void;
}

type ShareState = 'idle' | 'copied' | 'failed';

export function TeamReveal({
  roster,
  picks,
  gameMode,
  completionFeedback,
  progression,
  previousBest,
  onDraftAgain,
  onMainMenu,
  onOpenAchievements,
}: TeamRevealProps) {
  const [shareState, setShareState] = useState<ShareState>('idle');
  const { rating, tier: teamTier, rawScore } = getTeamRatingResult(roster);
  const grade = getDraftGrade(picks);
  const { accuracy } = grade;
  const shareText = formatShareText(grade, gameMode, rating, teamTier.label);

  const ranked = getRosterCards(roster).sort(
    (a, b) => b.card.normalizedValue - a.card.normalizedValue,
  );
  const biggestMiss = grade.rounds
    .filter((round) => round.outcome !== 'best')
    .sort(
      (a, b) =>
        b.best.normalizedValue -
        b.pick.normalizedValue -
        (a.best.normalizedValue - a.pick.normalizedValue),
    )[0];
  const book = getCollectionBook(progression);
  const earnedIds = completionFeedback?.earnedAchievementIds ?? [];
  const earned = book.filter((entry) =>
    earnedIds.includes(entry.achievement.id),
  );
  const stillLocked = book.filter((entry) => entry.count === 0).length;
  const nextGrade = [...DRAFT_GRADES].reverse().find((g) => g.min > accuracy);
  const totalPoints = ranked.reduce(
    (total, { card }) => total + card.fantasyPoints,
    0,
  );

  const points = (n: number) => `${n} point${n === 1 ? '' : 's'}`;

  const handleShare = async () => {
    try {
      if (navigator.share && window.matchMedia('(pointer: coarse)').matches) {
        await navigator.share({ text: shareText });
        return;
      }
      await navigator.clipboard.writeText(shareText);
      setShareState('copied');
    } catch (error) {
      // A dismissed share sheet is not a failure.
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setShareState('failed');
    }
  };

  return (
    <div className="min-h-screen bg-field-pattern px-4 py-12 md:px-8">
      <div className="max-w-6xl mx-auto">
        <p className="text-center text-xs uppercase tracking-widest text-theme-faint mb-4">
          {gameMode === 'hard' ? 'Hard Mode' : 'Normal Mode'} — Every value
          revealed
        </p>

        <h1 className="text-center font-display text-4xl text-theme-primary uppercase tracking-wide mb-6">
          The team is in.
        </h1>

        <div className="result-scoreboard">
          <DraftGradeDisplay tier={grade.tier} accuracy={accuracy} />
          <div className="result-story">
            <span className="section-kicker">
              FINAL WHISTLE / {gameMode.toUpperCase()}
            </span>
            <h2>
              {completionFeedback?.isPersonalBest
                ? 'A new standard.'
                : grade.bestPicks === picks.length
                  ? 'Perfect board reading.'
                  : accuracy >= 87
                    ? 'You saw what others missed.'
                    : 'Your next great draft starts here.'}
            </h2>
            <p>
              {previousBest === undefined
                ? 'Your first graded draft is on the board. Now give yourself something to chase.'
                : accuracy > previousBest
                  ? `${points(accuracy - previousBest)} above your previous best of ${previousBest}%.`
                  : accuracy === previousBest
                    ? `You matched your personal best of ${previousBest}%.`
                    : `${points(previousBest - accuracy)} away from your personal best of ${previousBest}%.`}
            </p>
            <div className="result-stats">
              <div>
                <span>BEST PICKS</span>
                <strong>
                  {grade.bestPicks}/{picks.length}
                </strong>
              </div>
              <div>
                <span>TEAM STRENGTH</span>
                <strong style={{ color: teamTier.color }}>{rating}</strong>
                <span>{teamTier.label}</span>
              </div>
              <div>
                <span>SEASON PPR TOTAL</span>
                <strong>{totalPoints.toFixed(1)}</strong>
              </div>
            </div>
            <p className="result-next">
              {nextGrade
                ? `${nextGrade.min - accuracy} more point${nextGrade.min - accuracy === 1 ? '' : 's'} to reach ${nextGrade.grade}.`
                : 'Top grade. Try it with no stats at all in Hard mode.'}
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
          <button type="button" onClick={handleShare} className="btn-secondary">
            {shareState === 'copied' ? '✓ Copied' : 'Share result'}
          </button>
          <button type="button" onClick={onMainMenu} className="btn-secondary">
            Main Menu
          </button>
        </div>
        {shareState === 'failed' && (
          <pre className="share-fallback" aria-label="Result to copy">
            {shareText}
          </pre>
        )}
        <PickReview rounds={grade.rounds} />
        <section
          className="result-achievements"
          aria-labelledby="result-achievements-title"
        >
          <h2
            id="result-achievements-title"
            className="result-achievements__title"
          >
            Achievements this draft
          </h2>
          {earned.length > 0 ? (
            <div className="achievement-grid">
              {earned.map((entry) => (
                <AchievementTile
                  key={entry.achievement.id}
                  entry={entry}
                  isNew={completionFeedback?.newAchievementIds.includes(
                    entry.achievement.id,
                  )}
                />
              ))}
            </div>
          ) : (
            <p className="result-achievements__empty">
              None this time. {stillLocked} still locked in your collection
              book.
            </p>
          )}
          <button
            type="button"
            className="result-achievements__open"
            onClick={onOpenAchievements}
          >
            Open collection book →
          </button>
        </section>
        <div className="result-insights">
          <p>
            <span>STRONGEST SEASON</span>
            <strong>
              {ranked[0].card.season} {ranked[0].card.name}
            </strong>
            {ranked[0].card.normalizedValue.toFixed(1)} position-adjusted value
          </p>
          <p>
            <span>BIGGEST MISS</span>
            {biggestMiss ? (
              <>
                <strong>
                  {biggestMiss.best.season} {biggestMiss.best.name}
                </strong>
                {biggestMiss.best.normalizedValue.toFixed(1)} value, passed for{' '}
                {biggestMiss.pick.name} at{' '}
                {biggestMiss.pick.normalizedValue.toFixed(1)}
              </>
            ) : (
              <>
                <strong>None</strong>
                You took the best card on every board.
              </>
            )}
          </p>
        </div>
        <details className="scoring-note">
          <summary>Inside your draft grade</summary>
          <p>
            Each card has a position-adjusted value (40–95). On every board,
            the best card earns full credit and the weakest earns none; your
            accuracy is the share of available value you captured, with the
            MVP board weighted 10% extra. Team strength is the total of your
            eight card values ({rawScore.toFixed(1)}, MVP ×1.1), uncapped. The
            PPR total is a sum of historical season totals, not a simulated
            season. Achievements do not change your grade.
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
