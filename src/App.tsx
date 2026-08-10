import { useCallback, useState } from 'react';
import type { CompletionFeedback, DraftState, GameMode, GamePhase, RosterState } from './types';
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
import { TeamReveal } from './components/TeamReveal';
import { DraftHistoryScreen } from './components/DraftHistoryScreen';
import { CardVaultScreen } from './components/CardVaultScreen';

function App() {
  const [phase, setPhase] = useState<GamePhase>('home');
  const [gameMode, setGameMode] = useState<GameMode>('normal');
  const [draftState, setDraftState] = useState<DraftState | null>(null);
  const [roster, setRoster] = useState<RosterState>(createEmptyRoster());
  const [draftSessionId, setDraftSessionId] = useState(0);
  const [progression, setProgression] = useState<ProgressionData>(() => loadProgression());
  const [completionFeedback, setCompletionFeedback] = useState<CompletionFeedback | null>(null);

  const beginFreshDraft = useCallback(() => {
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

  const handlePick = useCallback((newDraftState: DraftState, newRoster: RosterState) => {
    setDraftState(newDraftState);
    setRoster(newRoster);
  }, []);

  const handleComplete = useCallback(
    (newDraftState: DraftState, newRoster: RosterState) => {
      if (newDraftState.isComplete && newDraftState.picks.length === 8) {
        const { rating, tier } = getTeamRatingResult(newRoster);
        setProgression((current) => {
          const { progression: updated, feedback } = recordCompletedDraft({
            progression: current,
            mode: gameMode,
            rating,
            tier,
            roster: newRoster,
          });
          setCompletionFeedback(feedback);
          return updated;
        });
      }
      setRoster(newRoster);
      setPhase('reveal');
    },
    [gameMode],
  );

  if (phase === 'home') {
    return (
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
  }

  if (phase === 'history') {
    return (
      <DraftHistoryScreen
        progression={progression}
        onBack={() => setPhase('home')}
      />
    );
  }

  if (phase === 'vault') {
    return (
      <CardVaultScreen
        progression={progression}
        onBack={() => setPhase('home')}
      />
    );
  }

  if (phase === 'reveal') {
    return (
      <TeamReveal
        roster={roster}
        gameMode={gameMode}
        completionFeedback={completionFeedback}
        onDraftAgain={beginFreshDraft}
        onMainMenu={resetToHome}
      />
    );
  }

  if (phase === 'draft' && draftState?.currentRound) {
    return (
      <DraftScreen
        key={draftSessionId}
        draftState={draftState}
        roster={roster}
        gameMode={gameMode}
        currentRound={draftState.currentRound}
        onPick={handlePick}
        onComplete={handleComplete}
        onRestartDraft={beginFreshDraft}
        onMainMenu={resetToHome}
      />
    );
  }

  return (
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
}

export default App;
