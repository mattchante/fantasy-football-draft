import type { CSSProperties } from 'react';
import type { CardInfoLevel, PlayerCard as PlayerCardType, RosterSlot } from '../types';
import { POSITION_COLORS, getStatusLabel } from '../lib/positionColors';
import {
  formatSeason,
  getTeamDisplayName,
  parseHeadlineStat,
  parsePlayerName,
} from '../lib/playerDisplay';

interface PlayerCardProps {
  card: PlayerCardType;
  infoLevel?: CardInfoLevel;
  variant?: 'draft' | 'reveal' | 'vault';
  vaultState?: 'collected' | 'undrafted';
  draftCount?: number;
  onSelect?: () => void;
  selected?: boolean;
  disabled?: boolean;
  slotLabel?: RosterSlot;
}

export function PlayerCard({
  card,
  infoLevel = 'full',
  variant = 'draft',
  vaultState,
  draftCount = 0,
  onSelect,
  selected = false,
  disabled = false,
  slotLabel,
}: PlayerCardProps) {
  const posColor = POSITION_COLORS[card.position];
  const { firstName, lastName } = parsePlayerName(card.name);
  const teamName = getTeamDisplayName(card.team);
  const showStats = infoLevel === 'full';
  const isReveal = variant === 'reveal' || variant === 'vault';
  const isVault = variant === 'vault';
  const isUndrafted = isVault && vaultState === 'undrafted';
  const isInteractive = Boolean(onSelect) && !disabled && !isVault;
  const headlineStats = card.headlineStats.slice(0, 2).map(parseHeadlineStat);

  const cardStyle: CSSProperties = {
    '--card-accent': posColor,
  } as CSSProperties;

  const frameGlow = selected
    ? '0 0 40px rgba(245, 200, 66, 0.45), 0 12px 40px rgba(0,0,0,0.6)'
    : isInteractive
      ? undefined
      : '0 4px 24px rgba(0,0,0,0.4)';

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled || !onSelect || isVault}
      className={[
        'player-card',
        isInteractive && 'player-card--interactive',
        selected && 'player-card--selected',
        disabled && 'player-card--disabled',
        isUndrafted && 'player-card--undrafted',
      ].filter(Boolean).join(' ')}
      style={{
        ...cardStyle,
        boxShadow: frameGlow,
      }}
    >
      <div className="player-card__frame" style={{ '--card-accent': posColor } as CSSProperties}>
        <div className="player-card__inner">
          <div className="player-card__texture" aria-hidden />

          {/* Ghost jersey number (verified season number only) */}
          {card.jerseyNumber != null && (
            <span
              className={`player-card__ghost-number ${isReveal ? 'player-card__ghost-number--reveal' : 'player-card__ghost-number--draft'}`}
              aria-hidden
            >
              {card.jerseyNumber}
            </span>
          )}

          {/* Stadium lights */}
          <div className="player-card__stadium-light player-card__stadium-light--left" aria-hidden />
          <div className="player-card__stadium-light player-card__stadium-light--right" aria-hidden />

          {slotLabel && (
            <span
              className="player-card__slot-badge"
              style={{ backgroundColor: posColor }}
            >
              {slotLabel}
            </span>
          )}

          {isVault && draftCount > 0 && (
            <span className="player-card__draft-count">×{draftCount}</span>
          )}

          {selected && (
            <div className="player-card__drafted-overlay">
              <span className="font-display text-3xl text-accent-gold tracking-wider animate-pulse">
                DRAFTED!
              </span>
            </div>
          )}

          {/* Hero / identity */}
          <div
            className={[
              'player-card__hero',
              isReveal ? 'player-card__hero--reveal' : 'player-card__hero--draft',
              !showStats && 'player-card__hero--hard',
              !showStats && isReveal && 'player-card__hero--reveal',
            ].filter(Boolean).join(' ')}
          >
            <span
              className="player-card__pos-badge"
              style={{ backgroundColor: posColor }}
            >
              {card.position}
            </span>

            <div className="player-card__identity">
              <p className="player-card__firstname">{firstName}</p>
              <p className={`card-surname ${isReveal ? 'card-surname--reveal' : 'card-surname--draft'}`}>
                {lastName || firstName}
              </p>
              <p className="player-card__team-line">
                {teamName} · {formatSeason(card.season)}
              </p>
            </div>
          </div>

          {/* Stats (Normal / Reveal) */}
          {showStats ? (
            <div className={`player-card__stats ${isReveal ? 'player-card__stats--reveal' : ''}`}>
              <div className="player-card__stat-hero">
                <div>
                  <p className="player-card__stat-primary-label">Fantasy Points</p>
                  <p
                    className={`player-card__stat-primary-value ${isReveal ? 'player-card__stat-primary-value--reveal' : ''}`}
                    style={{ color: posColor }}
                  >
                    {card.fantasyPoints}
                  </p>
                </div>
                <div className="text-right">
                  <p className="player-card__stat-primary-label">PPG</p>
                  <p
                    className={`player-card__stat-primary-value ${isReveal ? 'player-card__stat-primary-value--reveal' : ''}`}
                    style={{ color: 'rgba(255,255,255,0.85)' }}
                  >
                    {card.fantasyPointsPerGame}
                  </p>
                </div>
              </div>

              {headlineStats.map((stat) => (
                <div key={stat.label + stat.value} className="player-card__stat-row">
                  <span className="player-card__stat-row-label">{stat.label}</span>
                  <span className="player-card__stat-row-value">{stat.value}</span>
                </div>
              ))}

              <div className="player-card__chips">
                <span className="player-card__chip player-card__chip--neutral">
                  {getStatusLabel(card.status)}
                </span>
                <span
                  className="player-card__chip player-card__chip--accent"
                  style={{
                    backgroundColor: `${posColor}20`,
                    color: posColor,
                    borderColor: `${posColor}40`,
                  }}
                >
                  {card.flavorTag}
                </span>
              </div>
            </div>
          ) : (
            <div className="player-card__hard-identity">
              <span className="player-card__chip player-card__chip--neutral">
                {getStatusLabel(card.status)}
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
