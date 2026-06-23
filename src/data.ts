export type WorkoutType = 'running' | 'weights';

export interface WorkoutTemplate {
  id: string;
  type: WorkoutType;
  name: string;
  tag?: string;
  distanceMiles?: number;
  durationMinutes?: number;
  weightLbs?: number;
  reps?: number;
  notes?: string;
}

export interface WeeklyPlan {
  weekId: string;
  plannedWorkoutIds: string[];
  scheduledWorkoutIds: Record<string, string[]>;
}

export interface RunLogEntry {
  id: string;
  templateId: string;
  date: string;
  loggedAt: string;
  distanceMiles: number;
  durationMinutes: number;
}

export interface WeightSet {
  sets: number;
  weightLbs: number;
  rpe: number;
  effort: number;
}

export interface WeightsLogEntry {
  id: string;
  templateId: string;
  date: string;
  loggedAt: string;
  sets: WeightSet[];
}

export interface AppData {
  templates: WorkoutTemplate[];
  weeklyPlans: WeeklyPlan[];
  runLogs: RunLogEntry[];
  weightsLogs: WeightsLogEntry[];
}

export type AppView = 'today' | 'workout-library' | 'weekly-plan' | 'weekly-totals';

const STORAGE_KEY = 'workout-web-app-data-v1';

export const defaultAppData: AppData = {
  templates: [],
  weeklyPlans: [],
  runLogs: [],
  weightsLogs: [],
};

export function getWeekStartDate(weekId: string) {
  const [yearString, weekString] = weekId.split('-W');
  const year = Number(yearString);
  const week = Number(weekString);
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dayOfWeek = jan4.getUTCDay() || 7;
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() + 1 - dayOfWeek + (week - 1) * 7);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() - 1);
  return sunday;
}

export function getWeekDatesForWeekId(weekId: string) {
  const start = getWeekStartDate(weekId);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    return date.toISOString().slice(0, 10);
  });
}

export function loadAppData(): AppData {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultAppData;

  try {
    const parsed = JSON.parse(raw) as AppData;
    const templates = Array.isArray(parsed.templates)
      ? parsed.templates.map((template) => ({
          ...template,
          tag: template.tag ?? (template as any).runType,
        }))
      : [];

    const weeklyPlans = Array.isArray(parsed.weeklyPlans)
      ? parsed.weeklyPlans.map((plan) => ({
          weekId: plan.weekId,
          plannedWorkoutIds: Array.isArray((plan as any).plannedWorkoutIds)
            ? (plan as any).plannedWorkoutIds
            : [],
          scheduledWorkoutIds: (plan as any).scheduledWorkoutIds || {},
        }))
      : [];

    const runLogs = Array.isArray(parsed.runLogs)
      ? parsed.runLogs.map((entry) => ({
          ...entry,
          loggedAt:
            (entry as any).loggedAt ||
            (typeof (entry as any).date === 'string' ? (entry as any).date : new Date().toISOString()),
        }))
      : [];

    const weightsLogs = Array.isArray(parsed.weightsLogs)
      ? parsed.weightsLogs.map((entry) => ({
          ...entry,
          loggedAt:
            (entry as any).loggedAt ||
            (typeof (entry as any).date === 'string' ? (entry as any).date : new Date().toISOString()),
          sets: Array.isArray((entry as any).sets)
            ? (entry as any).sets.map((set: any) => ({
                sets: typeof set.sets === 'number' ? set.sets : Number(set.exercise) || 0,
                weightLbs: typeof set.weightLbs === 'number' ? set.weightLbs : Number(set.weightLbs) || 0,
                rpe: typeof set.rpe === 'number' ? set.rpe : Number(set.rpe) || 0,
                effort: typeof set.effort === 'number' ? set.effort : Number(set.reps) || 0,
              }))
            : [],
        }))
      : [];

    return { ...parsed, templates, weeklyPlans, runLogs, weightsLogs };
  } catch {
    return defaultAppData;
  }
}

export function saveAppData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getWeekPlan(data: AppData, weekId: string): WeeklyPlan {
  const plan = data.weeklyPlans.find((item) => item.weekId === weekId);
  if (plan) return plan;

  const newPlan: WeeklyPlan = { weekId, plannedWorkoutIds: [], scheduledWorkoutIds: {} };
  data.weeklyPlans.push(newPlan);
  return newPlan;
}

export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
