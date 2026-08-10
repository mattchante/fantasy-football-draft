import type { CompletedDraftSnapshot } from '../lib/progression';
import { ROSTER_SLOTS } from '../lib/roster';

interface HistoryEntryProps {
  entry: CompletedDraftSnapshot;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function HistoryEntry({ entry }: HistoryEntryProps) {
  const rosterBySlot = Object.fromEntries(entry.roster.map((r) => [r.slot, r]));

  return (
    <article className="history-entry">
      <div className="history-entry__header">
        <div className="history-entry__score-block">
          <span className="history-entry__score">{entry.rating}</span>
          <span className="tier-badge history-entry__tier" style={{ color: entry.tierColor }}>
            {entry.tierLabel}
          </span>
        </div>
        <div className="history-entry__meta">
          <span className="history-entry__mode">{entry.mode === 'hard' ? 'Hard' : 'Normal'}</span>
          <span className="history-entry__date">{formatDate(entry.completedAt)}</span>
        </div>
      </div>
      <div className="history-entry__roster">
        {ROSTER_SLOTS.map((slot) => {
          const player = rosterBySlot[slot];
          if (!player) return null;
          return (
            <div key={slot} className="history-entry__slot">
              <span className="history-entry__slot-label">{slot}</span>
              <span className="history-entry__slot-name">
                {player.name} · {player.season}
              </span>
            </div>
          );
        })}
      </div>
    </article>
  );
}
