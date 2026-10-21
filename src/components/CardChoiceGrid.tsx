import { assignPlayerToRoster } from '../lib/roster';
import { getMissionProgress } from '../lib/missions';
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
        const before = getMissionProgress(roster);
        const advances = getMissionProgress(assigned.roster).filter(
          (m, i) => m.value > before[i].value,
        );
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
            <div className="choice__missions">
              {advances.length ? (
                advances.map((m) => (
                  <span key={m.id}>
                    {m.title} {m.value}/{m.target}
                  </span>
                ))
              ) : (
                <span>Build for the grade</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
