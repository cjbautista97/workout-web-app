import { useEffect, useMemo, useState } from 'react';
import { AppData, AppView, defaultAppData, loadAppData, saveAppData } from './data';
import { TodayView } from './views/TodayView';
import { WorkoutLibraryView } from './views/WorkoutLibraryView';
import { WeeklyPlanView } from './views/WeeklyPlanView';
import { WeeklyTotalsView } from './views/WeeklyTotalsView';
import { LogWorkoutModal } from './views/LogWorkoutModal';
import './styles.css';

const views: { key: AppView; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'workout-library', label: 'Workout Library' },
  { key: 'weekly-plan', label: 'Weekly Plan' },
  { key: 'weekly-totals', label: 'Weekly Totals' },
];

function App() {
  const [view, setView] = useState<AppView>('today');
  const [data, setData] = useState<AppData>(defaultAppData);
  const [logWorkoutTemplateId, setLogWorkoutTemplateId] = useState<string | null>(null);

  useEffect(() => {
    setData(loadAppData());
  }, []);

  useEffect(() => {
    saveAppData(data);
  }, [data]);

  const currentWeekId = useMemo(() => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const weekNumber = getISOWeekNumber(now);
    return `${year}-W${String(weekNumber).padStart(2, '0')}`;
  }, []);

  const openLog = (templateId: string) => setLogWorkoutTemplateId(templateId);
  const closeLog = () => setLogWorkoutTemplateId(null);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">Workout Web App</div>
        <nav>
          {views.map((item) => (
            <button
              key={item.key}
              className={item.key === view ? 'active' : ''}
              onClick={() => setView(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="content">
        {view === 'today' && <TodayView data={data} currentWeekId={currentWeekId} onLogWorkout={openLog} />}
        {view === 'workout-library' && <WorkoutLibraryView data={data} setData={setData} />}
        {view === 'weekly-plan' && <WeeklyPlanView data={data} setData={setData} currentWeekId={currentWeekId} />}
        {view === 'weekly-totals' && <WeeklyTotalsView data={data} currentWeekId={currentWeekId} />}
      </main>

      {logWorkoutTemplateId && (
        <LogWorkoutModal
          templateId={logWorkoutTemplateId}
          data={data}
          onSave={(entry) => {
            setData((prev) => ({
              ...prev,
              runLogs: entry.type === 'running' ? [...prev.runLogs, entry.payload] : prev.runLogs,
              weightsLogs: entry.type === 'weights' ? [...prev.weightsLogs, entry.payload] : prev.weightsLogs,
            }));
            closeLog();
          }}
          onClose={closeLog}
        />
      )}
    </div>
  );
}

function getISOWeekNumber(date: Date) {
  const dt = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = dt.getUTCDay() || 7;
  dt.setUTCDate(dt.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1));
  return Math.ceil(((dt.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export default App;
