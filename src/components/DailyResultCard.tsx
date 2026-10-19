import { useEffect, useRef, useState } from 'react';
import {
  buildShareText,
  formatDateKey,
  GRADE_LABEL,
  shareResultText,
  type DailyResult,
  type ShareOutcome,
} from '../lib/daily';

interface DailyResultCardProps {
  result: DailyResult;
}

function getShareUrl(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const { protocol, origin, pathname } = window.location;
  return protocol.startsWith('http') ? `${origin}${pathname}` : undefined;
}

const OUTCOME_COPY: Partial<Record<ShareOutcome, string>> = {
  shared: 'Shared',
  copied: 'Copied to clipboard',
  failed: 'Copy the result below',
};

export function DailyResultCard({ result }: DailyResultCardProps) {
  const [outcome, setOutcome] = useState<ShareOutcome | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const shareText = buildShareText(result, getShareUrl());
  const margin = result.rating - result.par;

  const handleShare = async () => {
    const next = await shareResultText(shareText);
    clearTimeout(timer.current);
    setOutcome(next);
    if (next !== 'failed') timer.current = setTimeout(() => setOutcome(null), 2400);
  };

  return (
    <div
      className={`daily-card ${result.won ? 'daily-card--won' : 'daily-card--lost'}`}
    >
      <div className="daily-card__head">
        <span>
          <span className="brand-mark">DC /</span> DAILY #{result.number}
        </span>
        <span>{formatDateKey(result.dateKey)}</span>
      </div>
      <div className="daily-card__score">
        <strong style={{ color: result.tierColor }}>{result.rating}</strong>
        <div>
          <span className="tier-badge" style={{ color: result.tierColor }}>
            {result.tierLabel}
          </span>
          <p className="daily-card__verdict">
            {result.won
              ? `✓ Beat par ${result.par} by ${margin}`
              : margin === 0
                ? `✕ Tied par ${result.par}. Beat it to win.`
                : `✕ ${-margin} short of par ${result.par}`}
          </p>
        </div>
      </div>
      <div
        className="daily-card__grades"
        role="img"
        aria-label={result.grades
          .map((g, i) => `${i === 7 ? 'MVP' : `Pick ${i + 1}`}: ${GRADE_LABEL[g]}`)
          .join('. ')}
      >
        {result.grades.map((grade, i) => (
          <span key={i} className="daily-card__grade-wrap">
            {i === 7 && <span className="daily-card__mvp">MVP</span>}
            <span className={`daily-grade daily-grade--${grade}`} />
          </span>
        ))}
      </div>
      <div className="daily-card__foot">
        <span>
          {result.redrawRound ? `↻ Redraw R${result.redrawRound}` : 'No redraw'}
        </span>
        <span>
          {result.streak > 0 ? `🔥 ${result.streak}-day streak` : 'Streak reset'}
        </span>
      </div>
      <button
        type="button"
        className="btn-primary-gold daily-card__share"
        onClick={handleShare}
      >
        Share result <span aria-hidden>↗</span>
      </button>
      <p className="daily-card__status" role="status">
        {outcome ? OUTCOME_COPY[outcome] : ''}
      </p>
      {outcome === 'failed' && (
        <textarea
          className="daily-card__fallback"
          readOnly
          rows={5}
          value={shareText}
          onFocus={(e) => e.currentTarget.select()}
          aria-label="Shareable daily result"
        />
      )}
    </div>
  );
}
