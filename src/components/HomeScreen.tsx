interface HomeScreenProps {
  onStartDraft: () => void;
}

export function HomeScreen({ onStartDraft }: HomeScreenProps) {
  return (
    <div className="min-h-screen bg-field-pattern flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <div className="mb-2">
          <span className="text-accent-green text-sm font-semibold uppercase tracking-[0.3em]">
            Fantasy Football
          </span>
        </div>

        <h1 className="font-display text-7xl md:text-8xl text-white tracking-wide uppercase leading-none">
          Draft Cards
        </h1>

        <p className="mt-6 text-slate-400 text-lg max-w-md mx-auto">
          Build your ultimate fantasy roster across themed draft rounds.
          Pick wisely. Draft again.
        </p>

        <button
          type="button"
          onClick={onStartDraft}
          className="
            mt-10 px-12 py-4 rounded-lg font-bold text-lg uppercase tracking-wider
            bg-accent-green text-bg-primary
            hover:bg-green-400 hover:scale-105
            transition-all duration-200
            shadow-[0_0_30px_rgba(34,197,94,0.3)]
          "
        >
          Start Draft
        </button>

        <div className="mt-16 flex justify-center gap-8 text-slate-600 text-sm">
          <span>8 Picks</span>
          <span>·</span>
          <span>Themed Rounds</span>
          <span>·</span>
          <span>Full PPR</span>
        </div>
      </div>
    </div>
  );
}
