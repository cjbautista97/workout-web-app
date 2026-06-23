import { AppData, getWeekPlan, WorkoutTemplate } from '../data';

interface Props {
  data: AppData;
  setData: (data: AppData) => void;
  currentWeekId: string;
}

export function WeeklyPlanView({ data, setData, currentWeekId }: Props) {
  const plan = getWeekPlan(data, currentWeekId);

  const handleToggle = (templateId: string) => {
    const hasTemplate = plan.plannedWorkoutIds.includes(templateId);
    const nextPlannedWorkoutIds = hasTemplate
      ? plan.plannedWorkoutIds.filter((id) => id !== templateId)
      : [...plan.plannedWorkoutIds, templateId];

    const nextWeeklyPlans = data.weeklyPlans.map((item) =>
      item.weekId === currentWeekId ? { ...item, plannedWorkoutIds: nextPlannedWorkoutIds } : item,
    );

    setData({ ...data, weeklyPlans: nextWeeklyPlans });
  };

  return (
    <div className="view-section">
      <h1>Weekly Plan</h1>
      <div className="week-label">Week: {currentWeekId}</div>
      <div className="plan-grid">
        <Section
          title="Running"
          templates={data.templates.filter((template) => template.type === 'running')}
          plannedIds={plan.plannedWorkoutIds}
          onToggle={handleToggle}
        />
        <Section
          title="Weights"
          templates={data.templates.filter((template) => template.type === 'weights')}
          plannedIds={plan.plannedWorkoutIds}
          onToggle={handleToggle}
        />
      </div>
    </div>
  );
}

interface SectionProps {
  title: string;
  templates: WorkoutTemplate[];
  plannedIds: string[];
  onToggle: (templateId: string) => void;
}

function Section({ title, templates, plannedIds, onToggle }: SectionProps) {
  return (
    <section className="plan-section">
      <h2>{title}</h2>
      {templates.length === 0 ? (
        <p className="empty-state">No templates yet.</p>
      ) : (
        <div className="plan-list">
          {templates.map((template) => (
            <label key={template.id} className="plan-item">
              <input
                type="checkbox"
                checked={plannedIds.includes(template.id)}
                onChange={() => onToggle(template.id)}
              />
              <span>{template.name}</span>
            </label>
          ))}
        </div>
      )}
    </section>
  );
}
