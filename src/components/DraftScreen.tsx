import { useCallback, useEffect, useRef, useState } from 'react';
import { formatGradeScore } from '../data/draftGrades';
import type {
  DraftState,
  GameMode,
  GeneratedRound,
  RosterState,
} from '../types';
import { MODE_LABELS } from '../types';
import { ConfirmDialog } from './ConfirmDialog';
import { applyPick, redrawRound } from '../lib/draftEngine';
import { DraftHeader } from './DraftHeader';
import { DraftMenu } from './DraftMenu';
import { RoundInfo } from './RoundInfo';
import { CardChoiceGrid } from './CardChoiceGrid';
import { RosterTracker } from './RosterTracker';

interface DraftScreenProps {
  draftState: DraftState;
  roster: RosterState;
  gameMode: GameMode;
  currentRound: GeneratedRound;
  cardDraftCounts: Record<string, number>;
  bestAccuracy?: number;
  onPick: (draftState: DraftState, roster: RosterState) => void;
  onComplete: (draftState: DraftState, roster: RosterState) => void;
  onRestartDraft: () => void;
  onMainMenu: () => void;
}

export function DraftScreen({
  draftState,
  roster,
  gameMode,
  currentRound,
  cardDraftCounts,
  bestAccuracy,
  onPick,
  onComplete,
  onRestartDraft,
  onMainMenu,
}: DraftScreenProps) {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const picking = useRef(false);
  const [confirmRedraw, setConfirmRedraw] = useState(false);
  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentRound]);

  const infoLevel = gameMode === 'hard' ? 'identity' : 'scouting';

  const handleSelect = useCallback(
    (cardId: string) => {
      if (picking.current || isTransitioning || selectedCardId) return;
      picking.current = true;

      setSelectedCardId(cardId);
      setIsTransitioning(true);

      timer.current = setTimeout(() => {
        const result = applyPick(draftState, roster, cardId);

        if (result.draftState.isComplete) {
          onComplete(result.draftState, result.roster);
        } else {
          onPick(result.draftState, result.roster);
          picking.current = false;
          setSelectedCardId(null);
          setIsTransitioning(false);
        }
      }, 450);
    },
    [draftState, roster, isTransitioning, selectedCardId, onPick, onComplete],
  );

  const pickNumber = draftState.picks.length + 1;

  return (
    <div className="draft-screen min-h-screen bg-field-pattern px-4 py-8 md:px-8">
      <div className="max-w-7xl mx-auto relative">
        <DraftMenu onRestartDraft={onRestartDraft} onMainMenu={onMainMenu} />

        <div className="draft-brand">
          <span className="brand-mark">DC /</span> DRAFT ROOM{' '}
          <span>
            {gameMode === 'hard'
              ? 'NORMAL · SEASON ONLY'
              : 'EASY · BOX SCORES'}
          </span>
        </div>
        <DraftHeader pickNumber={pickNumber} />

        <RoundInfo
          theme={currentRound.theme}
          isMvpRound={currentRound.isMvpRound}
        />

        <div className="board-toolbar">
          <div>
            <strong>
              {currentRound.isMvpRound
                ? 'The crown jewel. Any position.'
                : 'Your board. Your call.'}
            </strong>
            <p>
              {currentRound.isMvpRound
                ? 'The MVP board counts 10% extra toward your grade.'
                : 'Tap a card to draft. Unpicked cards leave the board.'}
            </p>
          </div>
          <button
            className="btn-secondary redraw-button"
            disabled={
              isTransitioning ||
              currentRound.isMvpRound ||
              draftState.redrawsRemaining === 0
            }
            onClick={() => setConfirmRedraw(true)}
          >
            {draftState.redrawsRemaining === 0
              ? 'Redraw used'
              : currentRound.isMvpRound
                ? 'Final board · no redraw'
                : '↻ Redraw board · 1 left'}
          </button>
        </div>
        <div className="draft-layout">
          <div className="flex-1 w-full">
            <CardChoiceGrid
              key={currentRound.cards.map((card) => card.id).join()}
              cards={currentRound.cards}
              roster={roster}
              isMvpRound={currentRound.isMvpRound}
              cardDraftCounts={cardDraftCounts}
              infoLevel={infoLevel}
              onSelect={handleSelect}
              selectedCardId={selectedCardId}
              disabled={isTransitioning}
            />
          </div>

          <aside className="draft-sidebar">
            <div className="record-target">
              <span>PERSONAL BEST · {MODE_LABELS[gameMode].toUpperCase()}</span>
              <strong>{formatGradeScore(bestAccuracy)}</strong>
              <p>
                {bestAccuracy !== undefined
                  ? 'A new board. A new shot at the record.'
                  : 'Your first completed draft sets the bar.'}
              </p>
            </div>
            <RosterTracker roster={roster} />
          </aside>
        </div>
        <p className="pick-receipt" role="status">
          {draftState.picks.length > 0
            ? `Last pick: ${draftState.picks.at(-1)!.card.season} ${draftState.picks.at(-1)!.card.name} → ${draftState.picks.at(-1)!.slot}`
            : 'QB · 2 RB · 2 WR · TE · FLEX (RB / WR / TE) · MVP (any position)'}
        </p>
        <details className="scoring-note">
          <summary>How does scoring work?</summary>
          <p>
            Every card has a hidden value (40–95) ranking its full-PPR season
            against others at its position. Your draft grade measures how much
            of each board’s value you captured: the best card on a board scores
            full credit, the weakest scores none. The MVP board counts 10%
            extra. Values, fantasy points and the best card you passed are
            revealed when the draft ends. Achievements never change your grade.
          </p>
        </details>
      </div>
      {confirmRedraw && (
        <ConfirmDialog
          title="Trade this board?"
          message="These three cards are gone. You get a fresh themed board, but it could be worse. This is your only redraw and cannot be used for the MVP pick."
          confirmLabel="Redraw board"
          onCancel={() => setConfirmRedraw(false)}
          onConfirm={() => {
            onPick(redrawRound(draftState, roster), roster);
            setConfirmRedraw(false);
          }}
        />
      )}
    </div>
  );
}
