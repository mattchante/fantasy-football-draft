import type { RosterState } from '../types';
import { getMissionProgress } from '../lib/missions';

export function DraftMissions({ roster }: { roster: RosterState }) {
  return (
    <section className="draft-missions" aria-label="Optional draft missions">
      <div className="section-kicker">
        Side missions <span>Earn stamps on completion</span>
      </div>
      <div className="mission-grid">
        {getMissionProgress(roster).map((mission) => (
          <div
            key={mission.id}
            className={`mission ${mission.complete ? 'mission--complete' : ''}`}
          >
            <div className="mission__top">
              <strong>{mission.title}</strong>
              <span>
                {mission.complete ? '✓' : `${mission.value}/${mission.target}`}
              </span>
            </div>
            <p>{mission.description}</p>
            <progress
              value={mission.value}
              max={mission.target}
              aria-label={mission.title}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
