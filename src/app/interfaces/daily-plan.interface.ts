export interface DailyPlan {
  day: number;
  date: string;
  weekday: string;
  week: number;
  phase: string;
  day_type: 'learn_build' | 'integration_review';
  title: string;
  learning_objective: string;
  concepts: string[];
  hands_on_tasks: string[];
  deliverable: string;
  acceptance_criteria: string[];
  estimated_minutes: number;
}

