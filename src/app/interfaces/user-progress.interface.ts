export type ProofLabel = 'GitHub Repo' | 'Live Demo' | 'PR / Commit' | 'Video Demo' | 'Documentation' | 'Other';

export interface ProofUrl {
  label: ProofLabel | string;
  url: string;
}

export interface DayProgress {
  day: number;
  isCompleted: boolean;
  completedTasks: number[]; // indices of completed tasks
  proofUrls: ProofUrl[];
  notes?: string;
  isFlaggedForRevision?: boolean;
  completedAt?: string;
  updatedAt?: string;
}

export interface ProjectSubmission {
  projectId: string; // P1 - P5
  isSubmitted: boolean;
  githubUrl: string;
  liveDemoUrl?: string;
  videoDemoUrl?: string;
  additionalUrls?: ProofUrl[];
  notes?: string;
  isFlaggedForRevision?: boolean;
  submittedAt?: string;
  updatedAt?: string;
}

export interface UserProgressState {
  userId: string;
  completedDays: number[];
  days: Record<string, DayProgress>;
  projectSubmissions: Record<string, ProjectSubmission>;
  lastActiveDay: number;
  updatedAt?: string;
}

