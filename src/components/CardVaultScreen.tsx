import { PLAYER_CARDS } from '../data/playerCards';
import { getVaultSummary, type ProgressionData } from '../lib/progression';
import { PlayerCard } from './PlayerCard';
import { VaultSummaryPanel } from './VaultSummary';

interface CardVaultScreenProps {
  progression: ProgressionData;
  onBack: () => void;
}

export function CardVaultScreen({ progression, onBack }: CardVaultScreenProps) {
  const summary = getVaultSummary(progression, PLAYER_CARDS);

  return (
    <div className="min-h-screen bg-field-pattern px-4 py-8 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="screen-header">
          <button type="button" onClick={onBack} className="btn-secondary btn-secondary--quiet">
            Back
          </button>
          <h1 className="font-display text-4xl text-white uppercase tracking-wide">Card Vault</h1>
        </div>

        <VaultSummaryPanel summary={summary} />

        <div className="vault-grid">
          {PLAYER_CARDS.map((card) => {
            const count = progression.cardDraftCounts[card.id] ?? 0;
            const collected = count >= 1;

            return (
              <PlayerCard
                key={card.id}
                card={card}
                variant="vault"
                infoLevel="full"
                vaultState={collected ? 'collected' : 'undrafted'}
                draftCount={count}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
