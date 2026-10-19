import { formatDateKey, type PickGrade } from './challenge';
import type { DailyResult } from './storage';

export const GRADE_EMOJI: Record<PickGrade, string> = {
  0: '🟩',
  1: '🟨',
  2: '🟥',
};

export const GRADE_LABEL: Record<PickGrade, string> = {
  0: 'Top value on the board',
  1: 'Middle value on the board',
  2: 'Lowest value on the board',
};

/** Spoiler-free: grades and numbers only, never player names. */
export function buildShareText(result: DailyResult, url?: string): string {
  const grades = result.grades.map((g) => GRADE_EMOJI[g]);
  const extras = [
    result.redrawRound ? `🔄 Redraw R${result.redrawRound}` : null,
    result.streak > 0 ? `🔥 ${result.streak}-day streak` : null,
  ].filter(Boolean);
  return [
    `Draft Cards Daily #${result.number} · ${formatDateKey(result.dateKey, 'short')}`,
    `${result.rating} ${result.tierLabel} ${result.won ? '✅' : '❌'} Par ${result.par}`,
    `${grades.slice(0, 7).join('')} ⭐${grades.slice(7).join('')}`,
    ...(extras.length ? [extras.join(' · ')] : []),
    ...(url ? [url] : []),
  ].join('\n');
}

export type ShareOutcome = 'shared' | 'copied' | 'failed' | 'cancelled';

export async function shareResultText(text: string): Promise<ShareOutcome> {
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({ text });
      return 'shared';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError')
        return 'cancelled';
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    return 'failed';
  }
}
