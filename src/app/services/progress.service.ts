import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DayProgress, ProjectSubmission, ProofUrl, UserProgressState } from '../interfaces/user-progress.interface';
import { catchError, of } from 'rxjs';

const LOCAL_STORAGE_KEY = 'agentic_ai_progress_cache';

@Injectable({
  providedIn: 'root'
})
export class ProgressService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/progress';

  // State signals
  readonly progressState = signal<UserProgressState>({
    userId: 'default_user',
    completedDays: [],
    days: {},
    projectSubmissions: {},
    lastActiveDay: 1
  });

  readonly isSyncing = signal<boolean>(false);
  readonly syncError = signal<string | null>(null);

  // Computed metrics
  readonly completedDaysCount = computed(() => this.progressState().completedDays.length);
  readonly progressPercentage = computed(() => {
    const count = this.completedDaysCount();
    return Math.min(100, Math.round((count / 35) * 100));
  });
  readonly totalHoursInvested = computed(() => this.completedDaysCount() * 2); // 2 hours/day target
  
  readonly streak = computed(() => {
    const days = [...this.progressState().completedDays].sort((a, b) => a - b);
    if (days.length === 0) return 0;
    let currentStreak = 0;
    let maxStreak = 0;
    for (let i = 0; i < days.length; i++) {
      if (i === 0 || days[i] === days[i - 1] + 1) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }
      if (currentStreak > maxStreak) maxStreak = currentStreak;
    }
    return maxStreak;
  });

  readonly revisionDays = computed(() => {
    const daysMap = this.progressState().days;
    return Object.values(daysMap).filter(d => d.isFlaggedForRevision);
  });

  readonly submittedProjects = computed(() => {
    const projMap = this.progressState().projectSubmissions;
    return Object.values(projMap).filter(p => p.isSubmitted);
  });

  constructor() {
    this.loadInitialProgress();
  }

  private loadInitialProgress(): void {
    // 1. Load from localStorage cache first for instant UX
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        this.progressState.set(parsed);
      } catch (e) {
        console.warn('Failed to parse local progress cache:', e);
      }
    }

    // 2. Fetch remote progress from MongoDB Atlas via API
    this.http.get<any>(this.apiUrl).pipe(
      catchError(err => {
        console.warn('Could not sync with MongoDB Atlas backend, using local state.', err);
        return of(null);
      })
    ).subscribe(remote => {
      if (remote) {
        // Map Atlas response to UserProgressState format
        const daysMap: Record<string, DayProgress> = {};
        if (remote.days) {
          if (remote.days instanceof Map) {
            remote.days.forEach((val: any, key: any) => { daysMap[String(key)] = val; });
          } else {
            Object.assign(daysMap, remote.days);
          }
        }

        const projectMap: Record<string, ProjectSubmission> = {};
        if (remote.projectSubmissions) {
          if (remote.projectSubmissions instanceof Map) {
            remote.projectSubmissions.forEach((val: any, key: any) => { projectMap[String(key)] = val; });
          } else {
            Object.assign(projectMap, remote.projectSubmissions);
          }
        }

        const normalized: UserProgressState = {
          userId: remote.userId || 'default_user',
          completedDays: Array.isArray(remote.completedDays) ? remote.completedDays : [],
          days: daysMap,
          projectSubmissions: projectMap,
          lastActiveDay: remote.lastActiveDay || 1,
          updatedAt: remote.updatedAt
        };

        this.progressState.set(normalized);
        this.persistLocal(normalized);
      }
    });
  }

  private persistLocal(state: UserProgressState): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('localStorage persist failed:', e);
    }
  }

  getDayProgress(dayNumber: number): DayProgress {
    const key = String(dayNumber);
    return this.progressState().days[key] || {
      day: dayNumber,
      isCompleted: false,
      completedTasks: [],
      proofUrls: [],
      notes: '',
      isFlaggedForRevision: false
    };
  }

  getProjectSubmission(projectId: string): ProjectSubmission {
    const key = projectId.toUpperCase();
    return this.progressState().projectSubmissions[key] || {
      projectId: key,
      isSubmitted: false,
      githubUrl: '',
      liveDemoUrl: '',
      videoDemoUrl: '',
      additionalUrls: [],
      notes: '',
      isFlaggedForRevision: false
    };
  }

  // Toggle or set day completion
  toggleDayCompletion(dayNumber: number, forceState?: boolean): void {
    const current = this.getDayProgress(dayNumber);
    const newState = forceState !== undefined ? forceState : !current.isCompleted;

    const updatedDay: DayProgress = {
      ...current,
      isCompleted: newState,
      completedAt: newState ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString()
    };

    this.saveDayProgress(updatedDay);
  }

  // Toggle a single task checkbox
  toggleTask(dayNumber: number, taskIndex: number): void {
    const current = this.getDayProgress(dayNumber);
    const tasks = new Set(current.completedTasks || []);

    if (tasks.has(taskIndex)) {
      tasks.delete(taskIndex);
    } else {
      tasks.add(taskIndex);
    }

    const updatedDay: DayProgress = {
      ...current,
      completedTasks: Array.from(tasks).sort((a, b) => a - b),
      updatedAt: new Date().toISOString()
    };

    this.saveDayProgress(updatedDay);
  }

  // Toggle star / revision flag
  toggleDayRevisionFlag(dayNumber: number): void {
    const current = this.getDayProgress(dayNumber);
    const updatedDay: DayProgress = {
      ...current,
      isFlaggedForRevision: !current.isFlaggedForRevision,
      updatedAt: new Date().toISOString()
    };
    this.saveDayProgress(updatedDay);
  }

  // Save notes and proof URLs for a day
  saveDayDetails(dayNumber: number, notes: string, proofUrls: ProofUrl[], isCompleted?: boolean): void {
    const current = this.getDayProgress(dayNumber);
    const updatedDay: DayProgress = {
      ...current,
      notes,
      proofUrls,
      isCompleted: isCompleted !== undefined ? isCompleted : current.isCompleted,
      updatedAt: new Date().toISOString()
    };
    this.saveDayProgress(updatedDay);
  }

  private saveDayProgress(day: DayProgress): void {
    const currentState = this.progressState();
    const key = String(day.day);
    const newDays = { ...currentState.days, [key]: day };

    let newCompletedDays = [...currentState.completedDays];
    if (day.isCompleted && !newCompletedDays.includes(day.day)) {
      newCompletedDays.push(day.day);
      newCompletedDays.sort((a, b) => a - b);
    } else if (!day.isCompleted && newCompletedDays.includes(day.day)) {
      newCompletedDays = newCompletedDays.filter(d => d !== day.day);
    }

    const nextState: UserProgressState = {
      ...currentState,
      completedDays: newCompletedDays,
      days: newDays,
      lastActiveDay: day.day,
      updatedAt: new Date().toISOString()
    };

    // Update locally immediately (optimistic UI)
    this.progressState.set(nextState);
    this.persistLocal(nextState);

    // Sync to MongoDB Atlas API
    this.isSyncing.set(true);
    this.http.put(`${this.apiUrl}/day/${day.day}`, {
      isCompleted: day.isCompleted,
      completedTasks: day.completedTasks,
      proofUrls: day.proofUrls,
      notes: day.notes,
      isFlaggedForRevision: day.isFlaggedForRevision
    }).pipe(
      catchError(err => {
        console.warn('Atlas sync deferred or failed:', err);
        return of(null);
      })
    ).subscribe(() => {
      this.isSyncing.set(false);
    });
  }

  // Save Weekly Project Submission (P1 - P5)
  saveProjectSubmission(submission: ProjectSubmission): void {
    const currentState = this.progressState();
    const key = submission.projectId.toUpperCase();
    const updatedSub = {
      ...submission,
      projectId: key,
      isSubmitted: true,
      submittedAt: submission.submittedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const nextState: UserProgressState = {
      ...currentState,
      projectSubmissions: {
        ...currentState.projectSubmissions,
        [key]: updatedSub
      },
      updatedAt: new Date().toISOString()
    };

    this.progressState.set(nextState);
    this.persistLocal(nextState);

    // Sync to Atlas API
    this.isSyncing.set(true);
    this.http.put(`${this.apiUrl}/project/${key}`, updatedSub).pipe(
      catchError(err => {
        console.warn('Project submission sync deferred:', err);
        return of(null);
      })
    ).subscribe(() => {
      this.isSyncing.set(false);
    });
  }

  // Toggle project revision flag
  toggleProjectRevisionFlag(projectId: string): void {
    const current = this.getProjectSubmission(projectId);
    this.saveProjectSubmission({
      ...current,
      isFlaggedForRevision: !current.isFlaggedForRevision
    });
  }
}

