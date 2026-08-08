import { TOTAL_PICKS } from '../lib/roster';

interface DraftHeaderProps {
  pickNumber: number;
}

export function DraftHeader({ pickNumber }: DraftHeaderProps) {
  const progress = (pickNumber / TOTAL_PICKS) * 100;

  return (
    <header className="w-full mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-400 uppercase tracking-widest">
          Pick {pickNumber} of {TOTAL_PICKS}
        </span>
        <span className="text-sm text-slate-500">
          {Math.round(progress)}% complete
        </span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-accent-green rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </header>
  );
}
