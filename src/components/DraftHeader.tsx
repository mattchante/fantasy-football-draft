import { TOTAL_PICKS } from '../lib/roster';

interface DraftHeaderProps {
  pickNumber: number;
}

function getSegmentState(segmentNumber: number, pickNumber: number): 'complete' | 'current' | 'future' {
  if (segmentNumber < pickNumber) return 'complete';
  if (segmentNumber === pickNumber) return 'current';
  return 'future';
}

export function DraftHeader({ pickNumber }: DraftHeaderProps) {
  return (
    <header className="w-full mb-6">
      <div className="mb-3">
        <span className="text-sm text-slate-400 uppercase tracking-widest">
          Pick {pickNumber} of {TOTAL_PICKS}
        </span>
      </div>
      <div className="pick-segments">
        {Array.from({ length: TOTAL_PICKS }, (_, i) => {
          const num = i + 1;
          const state = getSegmentState(num, pickNumber);
          return (
            <div
              key={num}
              className={`pick-segment pick-segment--${state}`}
            >
              <span>{num}</span>
            </div>
          );
        })}
      </div>
    </header>
  );
}
