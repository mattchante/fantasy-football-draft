import type { RoundReview } from '../lib/draftGrade';

interface PickReviewProps {
  rounds: RoundReview[];
}

const OUTCOME_LABEL: Record<RoundReview['outcome'], string> = {
  best: 'Best on board',
  close: 'Close call',
  miss: 'Missed',
};

export function PickReview({ rounds }: PickReviewProps) {
  return (
    <section className="pick-review" aria-labelledby="pick-review-title">
      <h2 id="pick-review-title" className="pick-review__title">
        Pick by pick
      </h2>
      <ol className="pick-review__list">
        {rounds.map((round) => (
          <li
            key={round.roundNumber}
            className={`pick-review__row pick-review__row--${round.outcome}`}
          >
            <span className="pick-review__round">
              {round.isMvp ? 'MVP' : `R${round.roundNumber}`}
            </span>
            <div className="pick-review__pick">
              <strong>
                {round.pick.season} {round.pick.name}
              </strong>
              <span>
                {round.pick.position} · {round.pick.normalizedValue.toFixed(1)}{' '}
                value
              </span>
            </div>
            <div className="pick-review__verdict">
              <span className="pick-review__outcome">
                {OUTCOME_LABEL[round.outcome]}
              </span>
              {round.outcome !== 'best' && (
                <span>
                  Best: {round.best.season} {round.best.name} ·{' '}
                  {round.best.normalizedValue.toFixed(1)}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
