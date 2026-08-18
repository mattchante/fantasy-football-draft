import type { ProgressionData } from '../lib/progression';
import { HistoryEntry } from './HistoryEntry';

interface DraftHistoryScreenProps {
  progression: ProgressionData;
  onBack: () => void;
}

export function DraftHistoryScreen({ progression, onBack }: DraftHistoryScreenProps) {
  return (
    <div className="min-h-screen bg-field-pattern px-4 py-8 md:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="screen-header">
          <button type="button" onClick={onBack} className="btn-secondary btn-secondary--quiet">
            Back
          </button>
          <h1 className="font-display text-4xl text-theme-primary uppercase tracking-wide">Draft History</h1>
        </div>

        {progression.history.length === 0 ? (
          <p className="empty-state">No completed drafts yet</p>
        ) : (
          <div className="history-list">
            {progression.history.map((entry) => (
              <HistoryEntry key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
