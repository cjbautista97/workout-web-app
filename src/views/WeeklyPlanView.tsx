import { useMemo, useState } from 'react';
import { AppData, getWeekDatesForWeekId, getWeekPlan, WorkoutTemplate } from '../data';

interface Props {
  data: AppData;
  setData: (data: AppData) => void;
  currentWeekId: string;
}

const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function WeeklyPlanView({ data, setData, currentWeekId }: Props) {
  const plan = getWeekPlan(data, currentWeekId);
  const weekDates = useMemo(() => getWeekDatesForWeekId(currentWeekId), [currentWeekId]);
  const [selectedDay, setSelectedDay] = useState<string>(weekDates[0]);

  const templatesByType = useMemo(
    () => ({
      running: data.templates.filter((template) => template.type === 'running'),
      weights: data.templates.filter((template) => template.type === 'weights'),
    }),
    [data.templates],
  );

  const scheduledIds = plan.scheduledWorkoutIds[selectedDay] ?? [];

  const toggleScheduledWorkout = (templateId: string) => {
    const currentDayIds = new Set(scheduledIds);
    if (currentDayIds.has(templateId)) {
      currentDayIds.delete(templateId);
    } else {
      currentDayIds.add(templateId);
    }

    const nextScheduledWorkoutIds = {
      ...plan.scheduledWorkoutIds,
      [selectedDay]: Array.from(currentDayIds),
    };

    const nextWeeklyPlans = data.weeklyPlans.map((item) =>
      item.weekId === currentWeekId ? { ...item, scheduledWorkoutIds: nextScheduledWorkoutIds } : item,
    );

    setData({ ...data, weeklyPlans: nextWeeklyPlans });
  };

  const availableTemplates = [...templatesByType.running, ...templatesByType.weights];

  return (
    <div className="view-section">
      <h1>Weekly Plan</h1>
      <div className="week-label">Week: {currentWeekId}</div>
      <div className="weekly-calendar">
        {weekDates.map((date, index) => (
          <button
            key={date}
            className={`calendar-day ${selectedDay === date ? 'active' : ''}`}
            type="button"
            onClick={() => setSelectedDay(date)}
          >
            <span>{weekDays[index]}</span>
            <strong>{date.slice(5)}</strong>
          </button>
        ))}
      </div>

      <div className="day-panel">
        <div className="day-header">
          <div>
            <div className="day-label">{new Date(selectedDay).toLocaleDateString(undefined, { weekday: 'long' })}</div>
            <div className="day-subtitle">{selectedDay}</div>
          </div>
          <button className="secondary-button">Add Workouts</button>
        </div>

        <div className="scheduled-list">
          {scheduledIds.length === 0 ? (
            <p className="empty-state">No workouts scheduled for this day.</p>
          ) : (
            scheduledIds.map((id) => {
              const template = data.templates.find((item) => item.id === id);
              if (!template) return null;
              return (
                <div key={id} className="scheduled-card">
                  <div>
                    <div className="template-name">{template.name}</div>
                    {template.tag ? <span className="template-tag">{template.tag}</span> : null}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="available-section">
          <h2>Select from library</h2>
          {availableTemplates.length === 0 ? (
            <p className="empty-state">No workout templates available.</p>
          ) : (
            <div className="available-grid">
              {availableTemplates.map((template) => (
                <label key={template.id} className="available-card">
                  <input
                    type="checkbox"
                    checked={scheduledIds.includes(template.id)}
                    onChange={() => toggleScheduledWorkout(template.id)}
                  />
                  <div>
                    <div className="template-name">{template.name}</div>
                    <div className="template-meta">
                      {template.tag ? <span className="template-tag">{template.tag}</span> : null}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
