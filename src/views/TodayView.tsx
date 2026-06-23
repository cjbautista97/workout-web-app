import { AppData, getWeekPlan, getTodayDateString, WorkoutTemplate } from '../data';

interface Props {
  data: AppData;
  currentWeekId: string;
  onLogWorkout: (templateId: string) => void;
}

export function TodayView({ data, currentWeekId, onLogWorkout }: Props) {
  const plan = getWeekPlan(data, currentWeekId);
  const plannedTemplates = data.templates.filter((template) => plan.plannedWorkoutIds.includes(template.id));

  return (
    <div className="view-section">
      <h1>Today</h1>
      <div className="today-header">{getTodayDateString()}</div>

      {plannedTemplates.length === 0 ? (
        <div className="empty-state-card">
          <p>No workouts planned for today.</p>
          <p>Open Weekly Plan to add a workout for this week.</p>
        </div>
      ) : (
        <div className="today-list">
          {plannedTemplates.map((template) => (
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
    </div>
  );
}
