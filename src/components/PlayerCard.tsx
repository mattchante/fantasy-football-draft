import type { PlayerCard as PlayerCardType } from '../types';
import { POSITION_COLORS, getStatusLabel } from '../lib/positionColors';

interface PlayerCardProps {
  card: PlayerCardType;
  onSelect?: () => void;
  selected?: boolean;
  disabled?: boolean;
  compact?: boolean;
  slotLabel?: string;
}

export function PlayerCard({
  card,
  onSelect,
  selected = false,
  disabled = false,
  compact = false,
  slotLabel,
}: PlayerCardProps) {
  const posColor = POSITION_COLORS[card.position];

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled || !onSelect}
      className={`
        group relative w-full text-left rounded-xl overflow-hidden
        bg-bg-card border transition-all duration-200 ease-out
        ${onSelect && !disabled ? 'cursor-pointer' : 'cursor-default'}
        ${selected
          ? 'scale-105 -translate-y-2 border-accent-gold shadow-[0_0_30px_rgba(245,200,66,0.3)] z-10'
          : onSelect && !disabled
            ? 'border-white/10 hover:scale-105 hover:-translate-y-1 hover:border-white/25 hover:shadow-xl'
            : 'border-white/10'
        }
        ${disabled ? 'opacity-50' : ''}
        ${compact ? 'max-w-[200px]' : ''}
      `}
      style={{ borderLeftWidth: '4px', borderLeftColor: posColor }}
    >
      {slotLabel && (
        <div
          className="absolute top-2 right-2 z-20 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide"
          style={{ backgroundColor: posColor, color: '#0a0a0f' }}
        >
          {slotLabel}
        </div>
      )}

      {selected && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <span className="font-display text-3xl text-accent-gold tracking-wider animate-pulse">
            DRAFTED!
          </span>
        </div>
      )}

      <div className={`relative ${compact ? 'aspect-[4/5]' : 'aspect-[4/5]'} overflow-hidden`}>
        <img
          src={card.imageUrl}
          alt={card.name}
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <span
            className="inline-block px-2 py-0.5 rounded text-xs font-bold mb-1"
            style={{ backgroundColor: posColor, color: '#0a0a0f' }}
          >
            {card.position}
          </span>
        </div>
      </div>

      <div className={`p-4 ${compact ? 'p-3' : ''}`}>
        <h3 className={`font-bold text-white ${compact ? 'text-sm' : 'text-lg'} leading-tight`}>
          {card.name}
        </h3>
        <p className="text-slate-400 text-sm mt-0.5">
          {card.team} · {card.season}
        </p>

        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
            {getStatusLabel(card.status)}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-accent-gold/20 text-accent-gold">
            {card.flavorTag}
          </span>
        </div>

        <div className={`mt-3 ${compact ? 'mt-2' : ''}`}>
          <div className="flex items-baseline gap-2">
            <span className={`font-display ${compact ? 'text-2xl' : 'text-3xl'} text-accent-gold`}>
              {card.fantasyPoints}
            </span>
            <span className="text-slate-500 text-sm">FP</span>
            <span className="text-slate-500 text-sm ml-auto">{card.fantasyPointsPerGame} PPG</span>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
            {card.headlineStats.map((stat) => (
              <span key={stat} className="text-xs text-slate-400">{stat}</span>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
}
