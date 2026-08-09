import { useCallback, useState } from 'react';
import type { DraftState, GameMode, GamePhase, RosterState } from './types';
import { startDraft } from './lib/draftEngine';
import { createEmptyRoster } from './lib/roster';
import { HomeScreen } from './components/HomeScreen';
import { DraftScreen } from './components/DraftScreen';
import { TeamReveal } from './components/TeamReveal';

function App() {
  const [phase, setPhase] = useState<GamePhase>('home');
  const [gameMode, setGameMode] = useState<GameMode>('normal');
  const [draftState, setDraftState] = useState<DraftState | null>(null);
  const [roster, setRoster] = useState<RosterState>(createEmptyRoster());
  const [draftSessionId, setDraftSessionId] = useState(0);

  const beginFreshDraft = useCallback(() => {
    const result = startDraft();
    setDraftState(result.draftState);
    setRoster(result.roster);
    setPhase('draft');
    setDraftSessionId((id) => id + 1);
  }, []);

  const resetToHome = useCallback(() => {
    setDraftState(null);
    setRoster(createEmptyRoster());
    setPhase('home');
  }, []);

  const handlePick = useCallback((newDraftState: DraftState, newRoster: RosterState) => {
    setDraftState(newDraftState);
    setRoster(newRoster);
  }, []);

  const handleComplete = useCallback((_newDraftState: DraftState, newRoster: RosterState) => {
    setRoster(newRoster);
    setPhase('reveal');
  }, []);

  if (phase === 'home') {
    return (
      <HomeScreen
        gameMode={gameMode}
        onGameModeChange={setGameMode}
        onStartDraft={beginFreshDraft}
      />
    );
  }

  if (phase === 'reveal') {
    return (
      <TeamReveal
        roster={roster}
        gameMode={gameMode}
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
      onGameModeChange={setGameMode}
      onStartDraft={beginFreshDraft}
    />
  );
}

export default App;
