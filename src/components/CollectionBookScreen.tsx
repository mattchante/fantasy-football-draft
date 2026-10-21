import {
  ACHIEVEMENT_CATEGORIES,
  RARITY_LABELS,
  getCollectionBook,
  type AchievementRarity,
} from '../lib/achievements';
import type { ProgressionData } from '../lib/progression';
import { AchievementTile } from './AchievementTile';

interface CollectionBookScreenProps {
  progression: ProgressionData;
  onBack: () => void;
}

const RARITIES: AchievementRarity[] = ['common', 'rare', 'legendary'];

export function CollectionBookScreen({
  progression,
  onBack,
}: CollectionBookScreenProps) {
  const book = getCollectionBook(progression);
  const unlocked = book.filter((entry) => entry.count > 0);

  return (
    <div className="min-h-screen bg-field-pattern px-4 py-8 md:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="screen-header">
          <button
            type="button"
            onClick={onBack}
            className="btn-secondary btn-secondary--quiet"
          >
            Back
          </button>
          <h1 className="font-display text-4xl text-theme-primary uppercase tracking-wide">
            Collection Book
          </h1>
        </div>

        <div className="collection-summary">
          <div>
            <span>UNLOCKED</span>
            <strong>
              {unlocked.length} / {book.length}
            </strong>
          </div>
          {RARITIES.map((rarity) => {
            const ofRarity = book.filter(
              (entry) => entry.achievement.rarity === rarity,
            );
            return (
              <div key={rarity} className={`collection-summary--${rarity}`}>
                <span>{RARITY_LABELS[rarity].toUpperCase()}</span>
                <strong>
                  {ofRarity.filter((entry) => entry.count > 0).length} /{' '}
                  {ofRarity.length}
                </strong>
              </div>
            );
          })}
          <progress
            value={unlocked.length}
            max={book.length}
            aria-label="Achievements unlocked"
          />
        </div>

        {ACHIEVEMENT_CATEGORIES.map((category) => (
          <section key={category.id} className="collection-category">
            <h2 className="collection-category__title">{category.title}</h2>
            <div className="achievement-grid">
              {book
                .filter((entry) => entry.achievement.category === category.id)
                .map((entry) => (
                  <AchievementTile key={entry.achievement.id} entry={entry} />
                ))}
            </div>
          </section>
        ))}

        <p className="collection-note">
          Achievements unlock when a draft is completed and never change your
          grade. Counters show how many times you’ve earned each one;
          milestones unlock once.
        </p>
      </div>
    </div>
  );
}
