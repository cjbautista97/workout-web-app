import { AppData } from '../data';

interface Props {
  data: AppData;
  currentWeekId: string;
}

export function WeeklyTotalsView({ data, currentWeekId }: Props) {
  const weekStart = getWeekStart(currentWeekId);
  const weekEnd = getWeekEnd(weekStart);

  const weeklyRunLogs = data.runLogs.filter((entry) => isInWeek(entry.date, weekStart, weekEnd));
  const weeklyWeightsLogs = data.weightsLogs.filter((entry) => isInWeek(entry.date, weekStart, weekEnd));

  const totalMiles = weeklyRunLogs.reduce((sum, entry) => sum + entry.distanceMiles, 0);
  const totalMinutes = weeklyRunLogs.reduce((sum, entry) => sum + entry.durationMinutes, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  const totalLifted = weeklyWeightsLogs.reduce((sum, entry) => {
    return (
      sum +
      entry.sets.reduce((setSum, set) => setSum + set.weightLbs * set.reps, 0)
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
    </div>
  );
}

function isInWeek(dateString: string, weekStart: Date, weekEnd: Date) {
  const date = new Date(dateString);
  return date >= weekStart && date <= weekEnd;
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
