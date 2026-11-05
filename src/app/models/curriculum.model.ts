export type TopicGroup =
  | 'Raw LLM & Functions'
  | 'Agentic RAG & Memory'
  | 'LangGraph & Workflows'
  | 'Multi-Agent Systems'
  | 'Production & Guardrails'
  | 'Programming'
  | 'Data'
  | 'Math & Statistics'
  | 'Classical ML'
  | 'Deep Learning'
  | 'Serving & MLOps'
  | 'Developer Tools'
  | 'Portfolio & Interview';

export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked';

export type ProofLabel = 'GitHub Repo' | 'Live Demo' | 'PR / Commit' | 'Video Demo' | 'Documentation' | 'Other';

export const PROOF_LABELS: ProofLabel[] = [
  'GitHub Repo',
  'Live Demo',
  'PR / Commit',
  'Video Demo',
  'Documentation',
  'Other'
];

export interface ProofUrlItem {
  id: string;
  label: ProofLabel;
  url: string;
}

export interface DailyTask {
  id: string;
  day: number;
  date: string;
  week: number;
  task: string;
  topic: string;
  topicGroup: TopicGroup;
  inputs: string;
  handsOnExercise: string;
  deliverableOutput: string;
  outcome: string;
  activeRecall: string;
  isBufferDay: boolean;
  studyDone: boolean;
  exerciseDone: boolean;
  codeSaved: boolean;
  reviewDone: boolean;
  evidenceUrl?: string;
  proofUrls?: ProofUrlItem[];
  reflection?: string;
  whatTrippedMeUp?: string;
  ahaMoment?: string;
  status: TaskStatus;
}

export interface WeeklyMilestone {
  week: number;
  startDate: string;
  endDate: string;
  milestone: string;
  weeklyProject: string;
  recommendedDataset: string;
  topics: string;
  expectedOutcomes: string;
  acceptanceCriteria: string[];
  handsOnExercises: string;
  projectShipped: boolean;
  projectUrl?: string;
  liveDemoUrl?: string;
  videoDemoUrl?: string;
  reviewComplete: boolean;
  weeklyReflection?: {
    wins: string;
    evidence: string;
    gaps: string;
    projectStatus: string;
    nextAdjustment: string;
  };
}

export interface TechSkill {
  id: string;
  order?: number;
  stage?: string;
  technology: string;
  category: TopicGroup;
  priority: 'Core' | 'Important' | 'Intro only';
  whatToLearn: string;
  proofProject: string;
  resourceUrl: string;
  learned: boolean;
  practiced: boolean;
  canExplain: boolean;
  canUseIndependently: boolean;
  notes?: string;
}

export type PaceStatus = 'ahead' | 'on_track' | 'behind' | 'critical' | 'pre_sprint' | 'completed';

export interface CalendarPacingSummary {
  currentCalendarDate: Date;
  currentDateFormatted: string;
  sprintStartDate: Date;
  sprintEndDate: Date;
  isPreSprint: boolean;
  isSprintFinished: boolean;
  daysUntilSprint: number;
  expectedDayNumber: number; // 1 to 35
  expectedDateFormatted: string;
  actualCompletedDays: number;
  paceDelta: number;
  paceStatus: PaceStatus;
  paceMessage: string;
  overdueTasks: DailyTask[];
  overdueCount: number;
  todayTask: DailyTask | null;
  isTodayCompleted: boolean;
  isTodayUntracked: boolean;
  isSimulationActive: boolean;
}

export interface MongoAtlasConfig {
  uri: string;
  username: string;
  cluster: string;
  database: string;
  collection: string;
  autoSync: boolean;
  lastSyncedAt?: string;
  syncStatus: 'connected' | 'syncing' | 'offline' | 'error';
}
