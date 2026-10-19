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
import {
  DAILY_MODE,
  deriveDailyAction,
  getChallengeNumber,
  getDailyPar,
  getDailyResult,
  getDateKey,
  loadDaily,
  recordDailyResult,
  replayDaily,
  resetDailyStorage,
  saveDaily,
  setDailyProgress,
  startDailyDraft,
  createEmptyDaily,
  type DailyAction,
  type DailyData,
  type DailyResult,
} from './lib/daily';

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

  // Daily Challenge. `activeDaily` is the date key of the daily being played.
  const [daily, setDaily] = useState<DailyData>(() => loadDaily());
  const [activeDaily, setActiveDaily] = useState<string | null>(null);
  const [dailyResult, setDailyResult] = useState<DailyResult | null>(null);
  const dailyActions = useRef<DailyAction[]>([]);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  const today = getDateKey(now);
  const activeMode: GameMode = activeDaily ? DAILY_MODE : gameMode;

  const beginFreshDraft = useCallback(() => {
    completedSession.current = false;
    setActiveDaily(null);
    setDailyResult(null);
    const result = startDraft();
    setDraftState(result.draftState);
    setRoster(result.roster);
    setCompletionFeedback(null);
    setPhase('draft');
    setDraftSessionId((id) => id + 1);
  }, []);

  const beginDaily = useCallback(() => {
    const dateKey = getDateKey();
    if (getDailyResult(daily, dateKey)) return;
    const saved =
      daily.inProgress?.dateKey === dateKey ? daily.inProgress.actions : [];
    const replay = saved.length ? replayDaily(dateKey, saved) : null;
    const actions = replay ? saved : [];
    const start = replay ?? startDailyDraft(dateKey);
    if (start.draftState.isComplete) return;

    dailyActions.current = actions;
    const updated = setDailyProgress(daily, dateKey, actions);
    saveDaily(updated);
    setDaily(updated);

    completedSession.current = false;
    setActiveDaily(dateKey);
    setDailyResult(null);
    setDraftState(start.draftState);
    setRoster(start.roster);
    setCompletionFeedback(null);
    setPhase('draft');
    setDraftSessionId((id) => id + 1);
  }, [daily]);

  /** Persist each daily pick or redraw so the attempt can't be re-rolled. */
  const trackDailyAction = useCallback(
    (prev: DraftState | null, next: DraftState): DailyAction[] | null => {
      if (!activeDaily || !prev) return null;
      const action = deriveDailyAction(prev, next);
      if (!action) return null;
      const actions = [...dailyActions.current, action];
      dailyActions.current = actions;
      if (!next.isComplete) {
        const updated = setDailyProgress(daily, activeDaily, actions);
        saveDaily(updated);
        setDaily(updated);
      }
      return actions;
    },
    [activeDaily, daily],
  );

  const resetToHome = useCallback(() => {
    setDraftState(null);
    setRoster(createEmptyRoster());
    setCompletionFeedback(null);
    setActiveDaily(null);
    setDailyResult(null);
    setPhase('home');
  }, []);

  const handleResetProgression = useCallback(() => {
    resetProgressionStorage();
    setProgression(createEmptyProgression());
    resetDailyStorage();
    setDaily(createEmptyDaily());
  }, []);

  const handlePick = useCallback(
    (newDraftState: DraftState, newRoster: RosterState) => {
      trackDailyAction(draftState, newDraftState);
      setDraftState(newDraftState);
      setRoster(newRoster);
    },
    [draftState, trackDailyAction],
  );

  const handleComplete = useCallback(
    (newDraftState: DraftState, newRoster: RosterState) => {
      if (newDraftState.isComplete && newDraftState.picks.length === 8) {
        const { rating, tier } = getTeamRatingResult(newRoster);
        if (completedSession.current) return;
        completedSession.current = true;
        setPreviousBest(progression.bestScores[activeMode]);
        const { progression: updated, feedback } = recordCompletedDraft({
          progression,
          mode: activeMode,
          rating,
          tier,
          roster: newRoster,
          challengeKey: activeDaily ?? undefined,
        });
        saveProgression(updated);
        setProgression(updated);
        setCompletionFeedback(feedback);

        if (activeDaily) {
          const actions = trackDailyAction(draftState, newDraftState) ?? [];
          const replay = replayDaily(activeDaily, actions);
          const par = getDailyPar(activeDaily);
          const recorded = recordDailyResult(daily, {
            dateKey: activeDaily,
            number: getChallengeNumber(activeDaily),
            rating,
            tierLabel: tier.label,
            tierColor: tier.color,
            par,
            won: rating > par,
            grades: replay?.grades ?? [],
            redrawRound: replay?.redrawRound ?? null,
          });
          saveDaily(recorded.daily);
          setDaily(recorded.daily);
          setDailyResult(recorded.result);
        }
      }
      setDraftState(newDraftState);
      setRoster(newRoster);
      setPhase('reveal');
    },
    [activeMode, activeDaily, daily, draftState, progression, trackDailyAction],
  );

  if (phase === 'home') {
    return (
      <HomeScreen
        gameMode={gameMode}
        progression={progression}
        daily={daily}
        today={today}
        now={now}
        onPlayDaily={beginDaily}
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
        gameMode={activeMode}
        completionFeedback={completionFeedback}
        previousBest={previousBest}
        dailyResult={dailyResult}
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
        gameMode={activeMode}
        currentRound={draftState.currentRound}
        cardDraftCounts={progression.cardDraftCounts}
        bestScore={progression.bestScores[activeMode]}
        daily={
          activeDaily
            ? {
                number: getChallengeNumber(activeDaily),
                par: getDailyPar(activeDaily),
              }
            : undefined
        }
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
      daily={daily}
      today={today}
      now={now}
      onPlayDaily={beginDaily}
      onGameModeChange={setGameMode}
      onStartDraft={beginFreshDraft}
      onOpenHistory={() => setPhase('history')}
      onOpenVault={() => setPhase('vault')}
      onResetProgression={handleResetProgression}
    />
  );
}

export default App;
