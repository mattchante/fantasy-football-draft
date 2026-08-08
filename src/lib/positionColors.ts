import type { Position, RosterSlot } from '../types';

export const POSITION_COLORS: Record<Position, string> = {
  QB: 'var(--color-pos-qb)',
  RB: 'var(--color-pos-rb)',
  WR: 'var(--color-pos-wr)',
  TE: 'var(--color-pos-te)',
};

export const SLOT_COLORS: Record<RosterSlot, string> = {
  QB: 'var(--color-pos-qb)',
  RB1: 'var(--color-pos-rb)',
  RB2: 'var(--color-pos-rb)',
  WR1: 'var(--color-pos-wr)',
  WR2: 'var(--color-pos-wr)',
  TE: 'var(--color-pos-te)',
  FLEX: 'var(--color-pos-flex)',
  MVP: 'var(--color-pos-mvp)',
};

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'current': return 'Current';
    case 'legend': return 'Legend';
    case 'special': return 'Special';
    default: return status;
  }
}
