export type WorkoutType = 'running' | 'weights';

export interface WorkoutTemplate {
  id: string;
  type: WorkoutType;
  name: string;
  notes?: string;
}

export interface WeeklyPlan {
  weekId: string;
  plannedWorkoutIds: string[];
}

export interface RunLogEntry {
  id: string;
  templateId: string;
  date: string;
  distanceMiles: number;
  durationMinutes: number;
}

export interface WeightSet {
  exercise: string;
  weightLbs: number;
  reps: number;
  rpe: number;
}

export interface WeightsLogEntry {
  id: string;
  templateId: string;
  date: string;
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

export function loadAppData(): AppData {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultAppData;

  try {
    return JSON.parse(raw) as AppData;
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

  const newPlan: WeeklyPlan = { weekId, plannedWorkoutIds: [] };
  data.weeklyPlans.push(newPlan);
  return newPlan;
}

export function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().slice(0, 10);
}

export function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
