import { useEffect, useMemo, useState } from 'react';
import {
  AppData,
  AppView,
  RunLogEntry,
  WeightsLogEntry,
  defaultAppData,
  loadAppData,
  saveAppData,
} from './data';
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
  const [logWorkoutModalState, setLogWorkoutModalState] = useState<
    | { mode: 'new'; templateId: string }
    | { mode: 'edit'; type: 'running' | 'weights'; entry: RunLogEntry | WeightsLogEntry }
    | null
  >(null);

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

  const openLog = (templateId: string) => setLogWorkoutModalState({ mode: 'new', templateId });
  const openEditLog = (type: 'running' | 'weights', entry: RunLogEntry | WeightsLogEntry) =>
    setLogWorkoutModalState({ mode: 'edit', type, entry });
  const closeLog = () => setLogWorkoutModalState(null);

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
        {view === 'weekly-totals' && (
          <WeeklyTotalsView
            data={data}
            currentWeekId={currentWeekId}
            onEditLog={openEditLog}
          />
        )}
      </main>

      {logWorkoutModalState && (
        <LogWorkoutModal
          templateId={
            logWorkoutModalState.mode === 'new'
              ? logWorkoutModalState.templateId
              : logWorkoutModalState.entry.templateId
          }
          data={data}
          existingEntry={
            logWorkoutModalState.mode === 'edit' ? logWorkoutModalState.entry : undefined
          }
          onSave={(entry) => {
            setData((prev) => {
              if (entry.type === 'running') {
                if (logWorkoutModalState?.mode === 'edit' && logWorkoutModalState.type === 'running') {
                  return {
                    ...prev,
                    runLogs: prev.runLogs.map((log) =>
                      log.id === entry.payload.id ? entry.payload : log,
                    ),
                  };
                }
                return {
                  ...prev,
                  runLogs: [...prev.runLogs, entry.payload],
                };
              }

              if (logWorkoutModalState?.mode === 'edit' && logWorkoutModalState.type === 'weights') {
                return {
                  ...prev,
                  weightsLogs: prev.weightsLogs.map((log) =>
                    log.id === entry.payload.id ? entry.payload : log,
                  ),
                };
              }

              return {
                ...prev,
                weightsLogs: [...prev.weightsLogs, entry.payload],
              };
            });
            closeLog();
          }}
          onDelete={
            logWorkoutModalState.mode === 'edit'
              ? () => {
                  setData((prev) => ({
                    ...prev,
                    runLogs:
                      logWorkoutModalState.type === 'running'
                        ? prev.runLogs.filter((log) => log.id !== logWorkoutModalState.entry.id)
                        : prev.runLogs,
                    weightsLogs:
                      logWorkoutModalState.type === 'weights'
                        ? prev.weightsLogs.filter((log) => log.id !== logWorkoutModalState.entry.id)
                        : prev.weightsLogs,
                  }));
                  closeLog();
                }
              : undefined
          }
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
