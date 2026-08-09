import type { RosterState } from '../types';
import { ROSTER_SLOTS } from '../lib/roster';
import { PlayerCard } from './PlayerCard';

interface FinalRosterGridProps {
  roster: RosterState;
}

export function FinalRosterGrid({ roster }: FinalRosterGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 w-full max-w-5xl mx-auto">
      {ROSTER_SLOTS.map((slot) => {
        const card = roster[slot];
        if (!card) return null;

        return (
          <PlayerCard
            key={slot}
            card={card}
            infoLevel="full"
            variant="reveal"
            slotLabel={slot}
          />
        );
      })}
    </div>
  );
}
