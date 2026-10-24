import { useCallback, useEffect, useRef, useState } from 'react';
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
import { TeamReveal } from './components/TeamReveal';
import { DraftHistoryScreen } from './components/DraftHistoryScreen';
import { CardVaultScreen } from './components/CardVaultScreen';
import { CollectionBookScreen } from './components/CollectionBookScreen';

function App() {
  const [phase, setPhase] = useState<GamePhase>('home');
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [phase]);
  const [gameMode, setGameMode] = useState<GameMode>('hard');
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
        setPreviousBest(progression.bestAccuracy?.[gameMode]);
        const { progression: updated, feedback } = recordCompletedDraft({
          progression,
          mode: gameMode,
          rating,
          tier,
          roster: newRoster,
          picks: newDraftState.picks,
        });
        saveProgression(updated);
        setProgression(updated);
        setCompletionFeedback(feedback);
      }
      setRoster(newRoster);
      setDraftState(newDraftState);
      setPhase('reveal');
    },
    [gameMode, progression],
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
        onOpenAchievements={() => setPhase('achievements')}
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

  if (phase === 'achievements') {
    return (
      <CollectionBookScreen
        progression={progression}
        onBack={() => setPhase(draftState?.isComplete ? 'reveal' : 'home')}
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
        picks={draftState?.picks ?? []}
        gameMode={gameMode}
        completionFeedback={completionFeedback}
        progression={progression}
        previousBest={previousBest}
        onDraftAgain={beginFreshDraft}
        onMainMenu={resetToHome}
        onOpenAchievements={() => setPhase('achievements')}
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
        cardDraftCounts={progression.cardDraftCounts}
        bestAccuracy={progression.bestAccuracy?.[gameMode]}
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
      onOpenAchievements={() => setPhase('achievements')}
      onResetProgression={handleResetProgression}
    />
  );
}

export default App;
