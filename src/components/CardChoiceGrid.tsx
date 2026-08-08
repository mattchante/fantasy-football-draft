import type { PlayerCard as PlayerCardType } from '../types';
import { PlayerCard } from './PlayerCard';

interface CardChoiceGridProps {
  cards: PlayerCardType[];
  onSelect: (cardId: string) => void;
  selectedCardId: string | null;
  disabled?: boolean;
}

export function CardChoiceGrid({
  cards,
  onSelect,
  selectedCardId,
  disabled = false,
}: CardChoiceGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full max-w-6xl mx-auto">
      {cards.map((card) => (
        <PlayerCard
          key={card.id}
          card={card}
          onSelect={() => onSelect(card.id)}
          selected={selectedCardId === card.id}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
