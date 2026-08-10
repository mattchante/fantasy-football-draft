import type { CompletionFeedback } from '../types';

interface ProgressionFeedbackProps {
  feedback: CompletionFeedback | null;
}

export function ProgressionFeedback({ feedback }: ProgressionFeedbackProps) {
  if (!feedback) return null;

  const { isPersonalBest, newCardIds } = feedback;
  const hasNewCards = newCardIds.length > 0;

  if (!isPersonalBest && !hasNewCards) return null;

  return (
    <div className="progression-feedback">
      {isPersonalBest && (
        <span className="progression-badge progression-badge--best">New Personal Best</span>
      )}
      {hasNewCards && (
        <span className="progression-badge progression-badge--cards">
          {newCardIds.length} New Card{newCardIds.length === 1 ? '' : 's'} Discovered
        </span>
      )}
    </div>
  );
}
