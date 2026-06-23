import { AppData, RunLogEntry, WeightsLogEntry } from '../data';

interface Props {
  data: AppData;
  currentWeekId: string;
  onEditLog: (type: 'running' | 'weights', entry: RunLogEntry | WeightsLogEntry) => void;
}

type WeeklyLogEntry = (RunLogEntry & { type: 'running' }) | (WeightsLogEntry & { type: 'weights' });

export function WeeklyTotalsView({ data, currentWeekId, onEditLog }: Props) {
  const weekStart = getWeekStart(currentWeekId);
  const weekEnd = getWeekEnd(weekStart);

  const weeklyRunLogs = data.runLogs.filter((entry) => isInWeek(entry.date, weekStart, weekEnd));
  const weeklyWeightsLogs = data.weightsLogs.filter((entry) => isInWeek(entry.date, weekStart, weekEnd));

  const weeklyHistory: WeeklyLogEntry[] = [
    ...weeklyRunLogs.map((entry) => ({ ...entry, type: 'running' as const })),
    ...weeklyWeightsLogs.map((entry) => ({ ...entry, type: 'weights' as const })),
  ].sort((a, b) => parseLoggedAt(b.loggedAt).getTime() - parseLoggedAt(a.loggedAt).getTime());

  const totalMiles = weeklyRunLogs.reduce((sum, entry) => sum + entry.distanceMiles, 0);
  const totalMinutes = weeklyRunLogs.reduce((sum, entry) => sum + entry.durationMinutes, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  const totalLifted = weeklyWeightsLogs.reduce((sum, entry) => {
    return (
      sum +
      entry.sets.reduce((setSum, set) => setSum + set.weightLbs * set.sets, 0)
    );
  }, 0);

  return (
    <div className="view-section">
      <h1>Weekly Totals</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Miles Run</span>
          <span className="stat-value">{totalMiles.toFixed(1)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Run Time</span>
          <span className="stat-value">{totalHours}h {remainingMinutes}m</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Pounds Lifted</span>
          <span className="stat-value">{totalLifted}</span>
        </div>
      </div>

      <div className="log-history-card">
        <h2>Completed Workout History</h2>
        {weeklyHistory.length === 0 ? (
          <p>No completed workouts logged this week.</p>
        ) : (
          <ul className="log-history-list">
            {weeklyHistory.map((entry) => {
              const template = data.templates.find((item) => item.id === entry.templateId);
              return (
                <li key={entry.id} className="log-history-item">
                  <div className="log-history-row">
                    <span className="log-history-title">{template?.name ?? 'Unnamed workout'}</span>
                    <span className="log-history-time">{formatLoggedAt(entry.loggedAt)}</span>
                  </div>
                  <div className="log-history-detail">
                    {entry.type === 'running'
                      ? `${entry.distanceMiles.toFixed(1)} mi · ${entry.durationMinutes} min`
                      : `${entry.sets.length} sets`}
                  </div>
                  <div className="log-history-actions">
                    <button className="secondary-button" type="button" onClick={() => onEditLog(entry.type, entry)}>
                      Edit
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function isInWeek(dateString: string, weekStart: Date, weekEnd: Date) {
  const date = new Date(dateString);
  return date >= weekStart && date <= weekEnd;
}

function parseLoggedAt(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(value);
}

function formatLoggedAt(value: string) {
  const date = parseLoggedAt(value);
  const hasTime = !/^\d{4}-\d{2}-\d{2}$/.test(value);
  return hasTime
    ? date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function getWeekStart(weekId: string) {
  const [yearString, weekString] = weekId.split('-W');
  const year = Number(yearString);
  const week = Number(weekString);
  const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
  const dayOfWeek = simple.getUTCDay() || 7;
  const isoWeekStart = new Date(simple);
  isoWeekStart.setUTCDate(simple.getUTCDate() - dayOfWeek + 1);
  return isoWeekStart;
}

function getWeekEnd(weekStart: Date) {
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
  return weekEnd;
}
