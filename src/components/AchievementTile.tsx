import { RARITY_LABELS, type CollectionEntry } from '../lib/achievements';

interface AchievementTileProps {
  entry: CollectionEntry;
  isNew?: boolean;
}

export function AchievementTile({ entry, isNew = false }: AchievementTileProps) {
  const { achievement, count, progress } = entry;
  const unlocked = count > 0;

  return (
    <div
      className={`achievement achievement--${achievement.rarity}${unlocked ? '' : ' achievement--locked'}`}
    >
      <div className="achievement__top">
        <span className="achievement__rarity">
          {RARITY_LABELS[achievement.rarity]}
        </span>
        <span className="achievement__count">
          {isNew ? (
            <span className="achievement__new">New</span>
          ) : unlocked ? (
            achievement.repeatable ? `×${count}` : '✓'
          ) : progress ? (
            `${progress.value}/${progress.target}`
          ) : (
            <span aria-label="Locked">🔒</span>
          )}
        </span>
      </div>
      <strong className="achievement__title">{achievement.title}</strong>
      <p>{achievement.description}</p>
      {!unlocked && progress && (
        <div className="achievement__progress">
          <progress
            value={progress.value}
            max={progress.target}
            aria-label={`${achievement.title} progress`}
          />
        </div>
      )}
    </div>
  );
}
