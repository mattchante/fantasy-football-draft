import { useCallback, useState } from 'react';
import type { DraftState, GeneratedRound, RosterState } from '../types';
import { applyPick } from '../lib/draftEngine';
import { DraftHeader } from './DraftHeader';
import { RoundInfo } from './RoundInfo';
import { CardChoiceGrid } from './CardChoiceGrid';
import { RosterTracker } from './RosterTracker';

interface DraftScreenProps {
  draftState: DraftState;
  roster: RosterState;
  currentRound: GeneratedRound;
  onPick: (draftState: DraftState, roster: RosterState) => void;
  onComplete: (draftState: DraftState, roster: RosterState) => void;
}

export function DraftScreen({
  draftState,
  roster,
  currentRound,
  onPick,
  onComplete,
}: DraftScreenProps) {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleSelect = useCallback(
    (cardId: string) => {
      if (isTransitioning || selectedCardId) return;

      setSelectedCardId(cardId);
      setIsTransitioning(true);

      setTimeout(() => {
        const result = applyPick(draftState, roster, cardId);

        if (result.draftState.isComplete) {
          onComplete(result.draftState, result.roster);
        } else {
          onPick(result.draftState, result.roster);
          setSelectedCardId(null);
          setIsTransitioning(false);
        }
      }, 450);
    },
    [draftState, roster, isTransitioning, selectedCardId, onPick, onComplete],
  );

  const pickNumber = draftState.picks.length + 1;

  return (
    <div className="min-h-screen bg-field-pattern px-4 py-8 md:px-8">
      <div className="max-w-7xl mx-auto">
        <DraftHeader pickNumber={pickNumber} />

        <RoundInfo theme={currentRound.theme} isMvpRound={currentRound.isMvpRound} />

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-1 w-full">
            <CardChoiceGrid
              cards={currentRound.cards}
              onSelect={handleSelect}
              selectedCardId={selectedCardId}
              disabled={isTransitioning}
            />
          </div>

          <RosterTracker roster={roster} />
        </div>
      </div>
    </div>
  );
}
