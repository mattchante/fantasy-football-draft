import { assignPlayerToRoster } from '../lib/roster';
import type {
  RosterState,
  CardInfoLevel,
  PlayerCard as PlayerCardType,
} from '../types';
import { PlayerCard } from './PlayerCard';

interface CardChoiceGridProps {
  cards: PlayerCardType[];
  roster: RosterState;
  isMvpRound: boolean;
  cardDraftCounts: Record<string, number>;
  infoLevel: CardInfoLevel;
  onSelect: (cardId: string) => void;
  selectedCardId: string | null;
  disabled?: boolean;
}

export function CardChoiceGrid({
  cards,
  roster,
  isMvpRound,
  cardDraftCounts,
  infoLevel,
  onSelect,
  selectedCardId,
  disabled = false,
}: CardChoiceGridProps) {
  return (
    <div className="choice-grid">
      {cards.map((card, index) => {
        const assigned = assignPlayerToRoster(roster, card, isMvpRound);
        return (
          <div
            className="choice"
            key={card.id}
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <div className="choice__meta">
              <span>TO {assigned.slot}</span>
              <span>
                {cardDraftCounts[card.id] ? 'IN YOUR VAULT' : '✦ NEW TO VAULT'}
              </span>
            </div>
            <PlayerCard
              key={card.id}
              card={card}
              infoLevel={infoLevel}
              variant="draft"
              onSelect={() => onSelect(card.id)}
              selected={selectedCardId === card.id}
              disabled={disabled}
            />
          </div>
        );
      })}
    </div>
  );
}
