import { getPersonalRecords, type ProgressionData } from '../lib/progression';

interface PersonalRecordsProps {
  progression: ProgressionData;
}

function formatScore(value: number | null): string {
  return value === null ? '—' : String(value);
}

export function PersonalRecords({ progression }: PersonalRecordsProps) {
  const records = getPersonalRecords(progression);

  return (
    <div className="personal-records">
      <h3 className="personal-records__title">Personal Records</h3>
      <div className="personal-records__grid">
        <div className="personal-records__item">
          <span className="personal-records__label">Best Normal</span>
          <span className="personal-records__value">{formatScore(records.bestNormal)}</span>
        </div>
        <div className="personal-records__item">
          <span className="personal-records__label">Best Hard</span>
          <span className="personal-records__value">{formatScore(records.bestHard)}</span>
        </div>
        <div className="personal-records__item">
          <span className="personal-records__label">Total Drafts</span>
          <span className="personal-records__value">{records.totalDrafts}</span>
        </div>
        <div className="personal-records__item">
          <span className="personal-records__label">Average Score</span>
          <span className="personal-records__value">{formatScore(records.averageScore)}</span>
        </div>
      </div>
    </div>
  );
}
