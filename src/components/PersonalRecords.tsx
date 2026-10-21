import { formatGradeScore } from '../data/draftGrades';
import { getPersonalRecords, type ProgressionData } from '../lib/progression';

interface PersonalRecordsProps {
  progression: ProgressionData;
  compact?: boolean;
  onReset?: () => void;
}

export function PersonalRecords({ progression, compact = false, onReset }: PersonalRecordsProps) {
  const records = getPersonalRecords(progression);

  return (
    <div className={`personal-records${compact ? ' personal-records--compact' : ''}`}>
      <h3 className="personal-records__title">Personal Records</h3>
      <div className="personal-records__grid">
        <div className="personal-records__item">
          <span className="personal-records__label">Best Normal</span>
          <span className="personal-records__value">{formatGradeScore(records.bestNormal)}</span>
        </div>
        <div className="personal-records__item">
          <span className="personal-records__label">Best Hard</span>
          <span className="personal-records__value">{formatGradeScore(records.bestHard)}</span>
        </div>
        <div className="personal-records__item">
          <span className="personal-records__label">Total Drafts</span>
          <span className="personal-records__value">{records.totalDrafts}</span>
        </div>
        <div className="personal-records__item">
          <span className="personal-records__label">Average Grade</span>
          <span className="personal-records__value">{formatGradeScore(records.averageAccuracy)}</span>
        </div>
      </div>
      {onReset && (
        <div className="personal-records__footer">
          <button type="button" onClick={onReset} className="home-reset-link">
            Reset Progression
          </button>
        </div>
      )}
    </div>
  );
}
