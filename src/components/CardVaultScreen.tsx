import { getTeamDisplayName } from '../lib/playerDisplay';
import { useState } from 'react';
import { PLAYER_CARDS } from '../data/playerCards';
import { getVaultSummary, type ProgressionData } from '../lib/progression';
import { PlayerCard } from './PlayerCard';
import { VaultSummaryPanel } from './VaultSummary';

interface CardVaultScreenProps {
  progression: ProgressionData;
  onBack: () => void;
}

export function CardVaultScreen({ progression, onBack }: CardVaultScreenProps) {
  const [query, setQuery] = useState('');
  const [position, setPosition] = useState('all');
  const [collection, setCollection] = useState('all');
  const visibleCards = PLAYER_CARDS.filter(
    (card) =>
      `${card.name} ${card.team} ${getTeamDisplayName(card.team)} ${card.season}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (position === 'all' || card.position === position) &&
      (collection === 'all' ||
        (collection === 'collected'
          ? (progression.cardDraftCounts[card.id] ?? 0) > 0
          : !progression.cardDraftCounts[card.id])),
  );
  const summary = getVaultSummary(progression, PLAYER_CARDS);

  return (
    <div className="min-h-screen bg-field-pattern px-4 py-8 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="screen-header">
          <button
            type="button"
            onClick={onBack}
            className="btn-secondary btn-secondary--quiet"
          >
            Back
          </button>
          <h1 className="font-display text-4xl text-theme-primary uppercase tracking-wide">
            Card Vault
          </h1>
        </div>

        <VaultSummaryPanel summary={summary} />

        <div className="vault-filters">
          <label>
            Find a season
            <input
              type="search"
              placeholder="Player, team or year"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <label>
            Position
            <select
              value={position}
              onChange={(event) => setPosition(event.target.value)}
            >
              <option value="all">All positions</option>
              {['QB', 'RB', 'WR', 'TE'].map((pos) => (
                <option key={pos}>{pos}</option>
              ))}
            </select>
          </label>
          <label>
            Collection
            <select
              value={collection}
              onChange={(event) => setCollection(event.target.value)}
            >
              <option value="all">All cards</option>
              <option value="collected">Collected</option>
              <option value="missing">Still to discover</option>
            </select>
          </label>
        </div>
        <p className="vault-count" role="status">
          {visibleCards.length} seasons{' '}
          {visibleCards.length === 0
            ? '— try another search or filter.'
            : 'on display'}
        </p>
        <div className="vault-grid">
          {visibleCards.map((card) => {
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
