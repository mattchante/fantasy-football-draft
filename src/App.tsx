import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import type {
  CompletionFeedback,
  DraftState,
  GameMode,
  GamePhase,
  RosterState,
} from './types';
import { saveProgression } from './lib/progression/storage';
import { startDraft } from './lib/draftEngine';
import {
  createEmptyProgression,
  loadProgression,
  recordCompletedDraft,
  resetProgressionStorage,
  type ProgressionData,
} from './lib/progression';
import { createEmptyRoster } from './lib/roster';
import { getTeamRatingResult } from './lib/teamRating';
import { HomeScreen } from './components/HomeScreen';
import { DraftScreen } from './components/DraftScreen';

// Secondary screens load on demand so the first paint ships only home + draft.
const TeamReveal = lazy(() =>
  import('./components/TeamReveal').then((m) => ({ default: m.TeamReveal })),
);
const DraftHistoryScreen = lazy(() =>
  import('./components/DraftHistoryScreen').then((m) => ({
    default: m.DraftHistoryScreen,
  })),
);
const CardVaultScreen = lazy(() =>
  import('./components/CardVaultScreen').then((m) => ({
    default: m.CardVaultScreen,
  })),
);

function App() {
  const [phase, setPhase] = useState<GamePhase>('home');
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [phase]);
  const [gameMode, setGameMode] = useState<GameMode>('normal');
  const [draftState, setDraftState] = useState<DraftState | null>(null);
  const [roster, setRoster] = useState<RosterState>(createEmptyRoster());
  const [draftSessionId, setDraftSessionId] = useState(0);
  const [progression, setProgression] = useState<ProgressionData>(() =>
    loadProgression(),
  );
  const [completionFeedback, setCompletionFeedback] =
    useState<CompletionFeedback | null>(null);

  const completedSession = useRef(false);
  const [previousBest, setPreviousBest] = useState<number | undefined>();

  const beginFreshDraft = useCallback(() => {
    completedSession.current = false;
    const result = startDraft();
    setDraftState(result.draftState);
    setRoster(result.roster);
    setCompletionFeedback(null);
    setPhase('draft');
    setDraftSessionId((id) => id + 1);
  }, []);

  const resetToHome = useCallback(() => {
    setDraftState(null);
    setRoster(createEmptyRoster());
    setCompletionFeedback(null);
    setPhase('home');
  }, []);

  const handleResetProgression = useCallback(() => {
    resetProgressionStorage();
    setProgression(createEmptyProgression());
  }, []);

  const handlePick = useCallback(
    (newDraftState: DraftState, newRoster: RosterState) => {
      setDraftState(newDraftState);
      setRoster(newRoster);
    },
    [],
  );

  const handleComplete = useCallback(
    (newDraftState: DraftState, newRoster: RosterState) => {
      if (newDraftState.isComplete && newDraftState.picks.length === 8) {
        const { rating, tier } = getTeamRatingResult(newRoster);
        if (completedSession.current) return;
        completedSession.current = true;
        setPreviousBest(progression.bestScores[gameMode]);
        const { progression: updated, feedback } = recordCompletedDraft({
          progression,
          mode: gameMode,
          rating,
          tier,
          roster: newRoster,
        });
        saveProgression(updated);
        setProgression(updated);
        setCompletionFeedback(feedback);
      }
      setRoster(newRoster);
      setPhase('reveal');
    },
    [gameMode, progression],
  );

  const home = (
    <HomeScreen
      gameMode={gameMode}
      progression={progression}
      onGameModeChange={setGameMode}
      onStartDraft={beginFreshDraft}
      onOpenHistory={() => setPhase('history')}
      onOpenVault={() => setPhase('vault')}
      onResetProgression={handleResetProgression}
    />
  );

  if (phase === 'draft' && draftState?.currentRound) {
    return (
      <DraftScreen
        key={draftSessionId}
        draftState={draftState}
        roster={roster}
        gameMode={gameMode}
        currentRound={draftState.currentRound}
        cardDraftCounts={progression.cardDraftCounts}
        bestScore={progression.bestScores[gameMode]}
        onPick={handlePick}
        onComplete={handleComplete}
        onRestartDraft={beginFreshDraft}
        onMainMenu={resetToHome}
      />
    );
  }

  if (phase === 'history' || phase === 'vault' || phase === 'reveal') {
    return (
      <Suspense fallback={null}>
        {phase === 'history' && (
          <DraftHistoryScreen
            progression={progression}
            onBack={() => setPhase('home')}
          />
        )}
        {phase === 'vault' && (
          <CardVaultScreen
            progression={progression}
            onBack={() => setPhase('home')}
          />
        )}
        {phase === 'reveal' && (
          <TeamReveal
            roster={roster}
            gameMode={gameMode}
            completionFeedback={completionFeedback}
            previousBest={previousBest}
            onDraftAgain={beginFreshDraft}
            onMainMenu={resetToHome}
          />
        )}
      </Suspense>
    );
  }

  return home;
}

export default App;
