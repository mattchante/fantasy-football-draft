import { useEffect, useState } from 'react';
import {
  formatDateKey,
  getActiveStreak,
  getChallengeNumber,
  getDailyPar,
  getDailyResult,
  getDailyStatus,
  msUntilNextChallenge,
  type DailyData,
} from '../lib/daily';
import { TOTAL_PICKS } from '../lib/roster';
import { DailyResultCard } from './DailyResultCard';

interface DailyChallengePanelProps {
  daily: DailyData;
  today: string;
  now: Date;
  onPlay: () => void;
}

const STATUS_LABEL = {
  ready: 'Open',
  'in-progress': 'In progress',
  won: 'Won',
  lost: 'Missed par',
} as const;

function formatCountdown(ms: number): string {
  const minutes = Math.max(1, Math.ceil(ms / 60_000));
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function DailyChallengePanel({
  daily,
  today,
  now,
  onPlay,
}: DailyChallengePanelProps) {
  const status = getDailyStatus(daily, today);
  const result = getDailyResult(daily, today);
  // Par runs 25 simulated drafts; compute it after first paint.
  const [computed, setComputed] = useState<{ day: string; par: number }>();
  useEffect(() => {
    if (result) return;
    const id = setTimeout(() => setComputed({ day: today, par: getDailyPar(today) }));
    return () => clearTimeout(id);
  }, [result, today]);
  const par = result?.par ?? (computed?.day === today ? computed.par : '—');
  const streak = getActiveStreak(daily, today);
  const picksMade =
    daily.inProgress?.dateKey === today
      ? daily.inProgress.actions.filter((a) => a.type === 'pick').length
      : 0;

  return (
    <section className="home-daily" aria-labelledby="daily-title">
      <div className="section-kicker" id="daily-title">
        Daily Challenge{' '}
        <span>Same board for everyone · new challenge at midnight</span>
      </div>
      <div className="home-daily__body">
        <div className="home-daily__info">
          <div className="home-daily__title">
            <strong>#{getChallengeNumber(today)}</strong>
            <span>{formatDateKey(today)}</span>
            <span className={`daily-status daily-status--${status}`}>
              {STATUS_LABEL[status]}
            </span>
          </div>
          <div className="home-daily__stats">
            <div>
              <span>Par</span>
              <strong>{par}</strong>
            </div>
            <div>
              <span>Streak</span>
              <strong>{streak}</strong>
            </div>
            <div>
              <span>Best streak</span>
              <strong>{daily.bestStreak}</strong>
            </div>
            <div>
              <span>Won</span>
              <strong>
                {daily.wins}/{daily.played}
              </strong>
            </div>
          </div>
          <p className="home-daily__copy">
            {status === 'ready' &&
              'One attempt. Hard rules: identity and season only, stats revealed at the finish. Beat par to extend your streak.'}
            {status === 'in-progress' &&
              `Pick ${picksMade + 1} of ${TOTAL_PICKS}. Every pick is saved, so the board picks up exactly where you left it.`}
            {result &&
              `Next challenge in ${formatCountdown(msUntilNextChallenge(now))}.`}
          </p>
          {!result && (
            <button
              type="button"
              className="btn-primary-gold home-play__start"
              onClick={onPlay}
            >
              {status === 'in-progress' ? 'Resume Daily' : 'Play Daily'}{' '}
              <span aria-hidden>↗</span>
            </button>
          )}
        </div>
        {result && <DailyResultCard result={result} />}
      </div>
    </section>
  );
}
