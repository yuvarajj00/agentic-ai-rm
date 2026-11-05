export interface WeeklyPlan {
  week: number;
  name: string;
  start_date: string;
  end_date: string;
  day_range: [number, number];
  goal: string;
  key_topics: string[];
  weekly_project_id: string;
  weekly_project_name: string;
  project_scope: string;
  days: number[];
  week_end_evidence: string[];
  definition_of_done: string[];
}

