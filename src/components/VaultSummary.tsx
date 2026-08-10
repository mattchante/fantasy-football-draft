import type { VaultSummary } from '../lib/progression';

interface VaultSummaryProps {
  summary: VaultSummary;
}

export function VaultSummaryPanel({ summary }: VaultSummaryProps) {
  return (
    <div className="vault-summary">
      <div className="vault-summary__row">
        <span className="vault-summary__label">Collection</span>
        <span className="vault-summary__value">
          {summary.uniqueCollected} / {summary.totalAvailable} · {summary.completionPercent}%
        </span>
      </div>
      <div className="vault-summary__row">
        <span className="vault-summary__label">Total Selections</span>
        <span className="vault-summary__value">{summary.totalSelections}</span>
      </div>
      <div className="vault-summary__row">
        <span className="vault-summary__label">Most Drafted</span>
        <span className="vault-summary__value">
          {summary.mostDrafted
            ? `${summary.mostDrafted.season} ${summary.mostDrafted.name} · ${summary.mostDrafted.count} draft${summary.mostDrafted.count === 1 ? '' : 's'}`
            : '—'}
        </span>
      </div>
    </div>
  );
}
