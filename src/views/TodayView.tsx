import { useMemo, useState } from 'react';
import { AppData, getWeekPlan, getTodayDateString, WorkoutTemplate } from '../data';

interface Props {
  data: AppData;
  currentWeekId: string;
  onLogWorkout: (templateId: string) => void;
}

export function TodayView({ data, currentWeekId, onLogWorkout }: Props) {
  const plan = getWeekPlan(data, currentWeekId);
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const today = getTodayDateString();

  const todayScheduledIds = plan.scheduledWorkoutIds?.[selectedDate] ?? [];
  const plannedTemplates = data.templates.filter((template) => todayScheduledIds.includes(template.id));

  const parseLocalDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const selectedDayLabel = useMemo(() => {
    if (selectedDate === today) return 'Today';
    const dateObj = parseLocalDate(selectedDate);
    return dateObj.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  }, [selectedDate, today]);

  const getAdjacentDate = (offset: number) => {
    const date = parseLocalDate(selectedDate);
    date.setDate(date.getDate() + offset);
    return formatLocalDate(date);
  };

  const handlePreviousDay = () => setSelectedDate(getAdjacentDate(-1));
  const handleNextDay = () => setSelectedDate(getAdjacentDate(1));

  const completedTemplateIds = new Set(
    [
      ...data.runLogs.filter((log) => log.date === selectedDate).map((log) => log.templateId),
      ...data.weightsLogs.filter((log) => log.date === selectedDate).map((log) => log.templateId),
    ],
  );

  const completedTemplates = plannedTemplates.filter((template) => completedTemplateIds.has(template.id));
  const activeTemplates = plannedTemplates.filter((template) => !completedTemplateIds.has(template.id));

  return (
    <div className="view-section">
      <h1>Today</h1>
      <div className="today-header">
        <div>
          <div className="today-label">{selectedDayLabel}</div>
          <div>{selectedDate}</div>
        </div>
        <div className="today-navigation">
          <button type="button" className="nav-button" onClick={handlePreviousDay}>
            ← Yesterday
          </button>
          <button type="button" className="nav-button" onClick={handleNextDay}>
            Tomorrow →
          </button>
        </div>
      </div>

      {activeTemplates.length === 0 ? (
        <div className="empty-state-card">
          {completedTemplates.length > 0 ? (
            <p>Good Fucking Shit. Way to get after it today.</p>
          ) : (
            <p>Who's gonna carry the boats</p>
          )}
        </div>
      ) : (
        <div className="today-list">
          {activeTemplates.map((template) => (
            <div key={template.id} className="today-card">
              <div>
                <div className="template-name">{template.name}</div>
                <div className="template-type">{template.type}</div>
                {template.notes ? <div className="template-notes">{template.notes}</div> : null}
              </div>
              <button onClick={() => onLogWorkout(template.id)}>Log</button>
            </div>
          ))}
        </div>
      )}

      {completedTemplates.length > 0 ? (
        <div className="completed-section">
          <h2>Completed Workouts</h2>
          <div className="today-list">
            {completedTemplates.map((template) => (
              <div key={template.id} className="today-card completed">
                <div>
                  <div className="template-name">{template.name}</div>
                  <div className="template-type">{template.type}</div>
                  {template.notes ? <div className="template-notes">{template.notes}</div> : null}
                </div>
                <button disabled>Logged</button>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
