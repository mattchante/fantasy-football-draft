import type { RoundTheme } from '../types';

interface RoundInfoProps {
  theme: RoundTheme;
  isMvpRound: boolean;
}

export function RoundInfo({ theme, isMvpRound }: RoundInfoProps) {
  return (
    <div className="text-center mb-8">
      {isMvpRound && (
        <span className="inline-block mb-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest round-badge-mvp">
          Final Pick
        </span>
      )}
      <h2 className="font-display text-5xl md:text-6xl lg:text-7xl text-theme-primary tracking-wide uppercase">
        {theme.title}
      </h2>
      <p className="mt-3 text-theme-faint max-w-xl mx-auto text-sm md:text-base leading-relaxed">
        {theme.description}
      </p>
    </div>
  );
}
