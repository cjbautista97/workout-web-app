import { AppData, getWeekPlan, getTodayDateString, WorkoutTemplate } from '../data';

interface Props {
  data: AppData;
  currentWeekId: string;
  onLogWorkout: (templateId: string) => void;
}

export function TodayView({ data, currentWeekId, onLogWorkout }: Props) {
  const plan = getWeekPlan(data, currentWeekId);
  const today = getTodayDateString();
  const todayScheduledIds = plan.scheduledWorkoutIds?.[today] ?? [];
  const plannedTemplates = data.templates.filter((template) => todayScheduledIds.includes(template.id));

  const completedTemplateIds = new Set(
    [
      ...data.runLogs.filter((log) => log.date === today).map((log) => log.templateId),
      ...data.weightsLogs.filter((log) => log.date === today).map((log) => log.templateId),
    ],
  );

  const completedTemplates = plannedTemplates.filter((template) => completedTemplateIds.has(template.id));
  const activeTemplates = plannedTemplates.filter((template) => !completedTemplateIds.has(template.id));

  return (
    <div className="view-section">
      <h1>Today</h1>
      <div className="today-header">{today}</div>

      {activeTemplates.length === 0 ? (
        <div className="empty-state-card">
          <p>No active workouts for today.</p>
          <p>Completed workouts move below once logged.</p>
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
