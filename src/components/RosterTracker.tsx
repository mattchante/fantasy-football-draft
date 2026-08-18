import type { RosterSlot, RosterState } from '../types';
import { ROSTER_SLOTS } from '../lib/roster';
import { SLOT_COLORS } from '../lib/positionColors';

interface RosterSlotDisplayProps {
  slot: RosterSlot;
  name: string | null;
}

function RosterSlotDisplay({ slot, name }: RosterSlotDisplayProps) {
  const color = SLOT_COLORS[slot];
  const filled = name !== null;

  return (
    <div
      className={`roster-slot ${filled ? 'roster-slot--filled' : 'roster-slot--empty'}`}
    >
      <span
        className="text-xs font-bold uppercase w-11 shrink-0 pl-3 tracking-wide"
        style={{ color }}
      >
        {slot}
      </span>
      <span className="roster-slot__divider" />
      {filled ? (
        <span className="text-sm text-theme-primary truncate flex-1 px-2">{name}</span>
      ) : (
        <span className="text-xs text-theme-faint italic flex-1 px-2">Empty</span>
      )}
      {filled && (
        <span
          className="mr-3 w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />
      )}
    </div>
  );
}

interface RosterTrackerProps {
  roster: RosterState;
}

export function RosterTracker({ roster }: RosterTrackerProps) {
  return (
    <div className="w-full lg:w-60 shrink-0">
      <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-theme-muted mb-3">
        Your Roster
      </h4>
      <div className="flex flex-col gap-1.5">
        {ROSTER_SLOTS.map((slot) => (
          <RosterSlotDisplay
            key={slot}
            slot={slot}
            name={roster[slot]?.name ?? null}
          />
        ))}
      </div>
    </div>
  );
}
