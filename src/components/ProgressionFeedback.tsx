import type { CompletionFeedback } from '../types';

interface ProgressionFeedbackProps {
  feedback: CompletionFeedback | null;
}

export function ProgressionFeedback({ feedback }: ProgressionFeedbackProps) {
  if (!feedback) return null;

  const { isPersonalBest, newCardIds, newAchievementIds } = feedback;
  const hasNewCards = newCardIds.length > 0;
  const unlocked = newAchievementIds.length;

  if (!isPersonalBest && !hasNewCards && !unlocked) return null;

  return (
    <div className="progression-feedback">
      {isPersonalBest && (
        <span className="progression-badge progression-badge--best">New Personal Best</span>
      )}
      {unlocked > 0 && (
        <span className="progression-badge progression-badge--best">
          ★ {unlocked} Achievement{unlocked === 1 ? '' : 's'} Unlocked
        </span>
      )}
      {hasNewCards && (
        <span className="progression-badge progression-badge--cards">
          {newCardIds.length} New Card{newCardIds.length === 1 ? '' : 's'} Discovered
        </span>
      )}
    </div>
  );
}
