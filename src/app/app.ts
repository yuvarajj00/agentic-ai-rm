import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent, NavTab } from './components/header/header.component';
import { ProgressStatsComponent } from './components/progress-stats/progress-stats.component';
import { RoadmapOverviewComponent } from './components/roadmap-overview/roadmap-overview.component';
import { WeekCardComponent } from './components/week-card/week-card.component';
import { DayDetailComponent } from './components/day-detail/day-detail.component';
import { PhaseProjectComponent } from './components/phase-project/phase-project.component';
import { RevisionHubComponent } from './components/revision-hub/revision-hub.component';
import { RoadmapService } from './services/roadmap.service';
import { ProgressService } from './services/progress.service';
import { DailyPlan } from './interfaces/daily-plan.interface';
import { PhaseProject } from './interfaces/phase-project.interface';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    ProgressStatsComponent,
    RoadmapOverviewComponent,
    WeekCardComponent,
    DayDetailComponent,
    PhaseProjectComponent,
    RevisionHubComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  roadmapService = inject(RoadmapService);
  progressService = inject(ProgressService);

  activeTab: NavTab = 'roadmap';
  selectedDay: DailyPlan | null = null;
  selectedProject: PhaseProject | null = null;

  onTabChange(tab: NavTab): void {
    this.activeTab = tab;
  }

  openDay(day: DailyPlan): void {
    this.selectedDay = day;
  }

  closeDayModal(): void {
    this.selectedDay = null;
  }

  openProject(project: PhaseProject): void {
    this.selectedProject = project;
  }

  closeProjectModal(): void {
    this.selectedProject = null;
  }
}
