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
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg border transition-all
        ${filled ? 'bg-white/5 border-white/10' : 'border-dashed border-white/20 bg-transparent'}
      `}
    >
      <span
        className="text-xs font-bold uppercase w-10 shrink-0"
        style={{ color }}
      >
        {slot}
      </span>
      {filled ? (
        <span className="text-sm text-white truncate">{name}</span>
      ) : (
        <span className="text-xs text-slate-600 italic">Empty</span>
      )}
      {filled && (
        <span className="ml-auto w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
      )}
    </div>
  );
}

interface RosterTrackerProps {
  roster: RosterState;
}

export function RosterTracker({ roster }: RosterTrackerProps) {
  return (
    <div className="w-full lg:w-56 shrink-0">
      <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
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
