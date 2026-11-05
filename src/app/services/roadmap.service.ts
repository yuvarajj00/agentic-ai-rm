import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DailyPlan } from '../interfaces/daily-plan.interface';
import { WeeklyPlan } from '../interfaces/weekly-plan.interface';
import { PhaseProject } from '../interfaces/phase-project.interface';
import { catchError, forkJoin, map, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoadmapService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/plans';

  // Reactive state
  readonly dailyPlans = signal<DailyPlan[]>([]);
  readonly weeklyPlans = signal<WeeklyPlan[]>([]);
  readonly phaseProjects = signal<PhaseProject[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly isConnectedToAtlas = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  constructor() {
    this.loadAllRoadmapData();
  }

  loadAllRoadmapData(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    // Try fetching from Express API (connected to MongoDB Atlas)
    forkJoin({
      daily: this.http.get<DailyPlan[]>(`${this.apiUrl}/daily`).pipe(
        catchError(() => this.fetchFallbackDaily())
      ),
      weekly: this.http.get<WeeklyPlan[]>(`${this.apiUrl}/weekly`).pipe(
        catchError(() => this.fetchFallbackWeekly())
      ),
      projects: this.http.get<PhaseProject[]>(`${this.apiUrl}/projects`).pipe(
        catchError(() => this.fetchFallbackProjects())
      )
    }).subscribe({
      next: ({ daily, weekly, projects }) => {
        this.dailyPlans.set(daily);
        this.weeklyPlans.set(weekly);
        this.phaseProjects.set(projects);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load roadmap data:', err);
        this.errorMessage.set('Could not load plan data. Please check connection.');
        this.isLoading.set(false);
      }
    });

    // Check health endpoint for Atlas connectivity status
    this.http.get<{ status: string; database: string }>('http://localhost:3000/api/health')
      .pipe(catchError(() => of(null)))
      .subscribe(res => {
        this.isConnectedToAtlas.set(res?.status === 'online');
      });
  }

  // Fallback to local static json files in public/data/
  private fetchFallbackDaily() {
    return this.http.get<{ days: DailyPlan[] }>('/data/daily_plan.json').pipe(
      map(res => res.days || []),
      catchError(() => of([]))
    );
  }

  private fetchFallbackWeekly() {
    return this.http.get<{ weeks: WeeklyPlan[] }>('/data/weekly_plan.json').pipe(
      map(res => res.weeks || []),
      catchError(() => of([]))
    );
  }

  private fetchFallbackProjects() {
    return this.http.get<{ projects: PhaseProject[] }>('/data/phase_projects.json').pipe(
      map(res => res.projects || []),
      catchError(() => of([]))
    );
  }

  getDay(dayNumber: number): DailyPlan | undefined {
    return this.dailyPlans().find(d => d.day === dayNumber);
  }

  getWeek(weekNumber: number): WeeklyPlan | undefined {
    return this.weeklyPlans().find(w => w.week === weekNumber);
  }

  getProject(projectId: string): PhaseProject | undefined {
    return this.phaseProjects().find(p => p.id.toUpperCase() === projectId.toUpperCase());
  }
}

