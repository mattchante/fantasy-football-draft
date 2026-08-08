import { useCallback, useState } from 'react';
import type { DraftState, GamePhase, RosterState } from './types';
import { startDraft } from './lib/draftEngine';
import { createEmptyRoster } from './lib/roster';
import { HomeScreen } from './components/HomeScreen';
import { DraftScreen } from './components/DraftScreen';
import { TeamReveal } from './components/TeamReveal';

function App() {
  const [phase, setPhase] = useState<GamePhase>('home');
  const [draftState, setDraftState] = useState<DraftState | null>(null);
  const [roster, setRoster] = useState<RosterState>(createEmptyRoster());

  const handleStartDraft = useCallback(() => {
    const result = startDraft();
    setDraftState(result.draftState);
    setRoster(result.roster);
    setPhase('draft');
  }, []);

  const handlePick = useCallback((newDraftState: DraftState, newRoster: RosterState) => {
    setDraftState(newDraftState);
    setRoster(newRoster);
  }, []);

  const handleComplete = useCallback((_newDraftState: DraftState, newRoster: RosterState) => {
    setRoster(newRoster);
    setPhase('reveal');
  }, []);

  const handleDraftAgain = useCallback(() => {
    handleStartDraft();
  }, [handleStartDraft]);

  if (phase === 'home') {
    return <HomeScreen onStartDraft={handleStartDraft} />;
  }

  if (phase === 'reveal') {
    return <TeamReveal roster={roster} onDraftAgain={handleDraftAgain} />;
  }

  if (phase === 'draft' && draftState?.currentRound) {
    return (
      <DraftScreen
        key={draftState.picks.length}
        draftState={draftState}
        roster={roster}
        currentRound={draftState.currentRound}
        onPick={handlePick}
        onComplete={handleComplete}
      />
    );
  }

  return <HomeScreen onStartDraft={handleStartDraft} />;
}

export default App;
