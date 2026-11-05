import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoadmapService } from '../../services/roadmap.service';
import { ProgressService } from '../../services/progress.service';
import { DailyPlan } from '../../interfaces/daily-plan.interface';
import { WeeklyPlan } from '../../interfaces/weekly-plan.interface';
import { PhaseProject } from '../../interfaces/phase-project.interface';

@Component({
  selector: 'app-roadmap-overview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roadmap-overview.component.html',
  styleUrl: './roadmap-overview.component.css'
})
export class RoadmapOverviewComponent {
  roadmapService = inject(RoadmapService);
  progressService = inject(ProgressService);

  @Output() selectDay = new EventEmitter<DailyPlan>();
  @Output() selectProject = new EventEmitter<PhaseProject>();

  selectedWeek: number = 0; // 0 = all weeks
  statusFilter: 'all' | 'completed' | 'pending' | 'starred' = 'all';
  typeFilter: 'all' | 'learn_build' | 'integration_review' = 'all';
  searchQuery: string = '';

  get weeks(): WeeklyPlan[] {
    return this.roadmapService.weeklyPlans();
  }

  get allDays(): DailyPlan[] {
    return this.roadmapService.dailyPlans();
  }

  get filteredDays(): DailyPlan[] {
    let days = this.allDays;

    if (this.selectedWeek > 0) {
      days = days.filter(d => d.week === this.selectedWeek);
    }

    if (this.statusFilter === 'completed') {
      days = days.filter(d => this.isDayComplete(d.day));
    } else if (this.statusFilter === 'pending') {
      days = days.filter(d => !this.isDayComplete(d.day));
    } else if (this.statusFilter === 'starred') {
      days = days.filter(d => this.isDayStarred(d.day));
    }

    if (this.typeFilter !== 'all') {
      days = days.filter(d => d.day_type === this.typeFilter);
    }

    if (this.searchQuery.trim().length > 0) {
      const q = this.searchQuery.toLowerCase();
      days = days.filter(d =>
        d.title.toLowerCase().includes(q) ||
        d.learning_objective.toLowerCase().includes(q) ||
        d.concepts.some(c => c.toLowerCase().includes(q))
      );
    }

    return days;
  }

  getDaysForWeek(weekNum: number): DailyPlan[] {
    return this.filteredDays.filter(d => d.week === weekNum);
  }

  getProjectForWeek(weekNum: number): PhaseProject | undefined {
    return this.roadmapService.phaseProjects().find(p => p.week === weekNum);
  }

  isDayComplete(dayNumber: number): boolean {
    return this.progressService.getDayProgress(dayNumber).isCompleted;
  }

  isDayStarred(dayNumber: number): boolean {
    return !!this.progressService.getDayProgress(dayNumber).isFlaggedForRevision;
  }

  toggleDayComplete(dayNumber: number, event: MouseEvent): void {
    event.stopPropagation();
    this.progressService.toggleDayCompletion(dayNumber);
  }

  toggleDayStar(dayNumber: number, event: MouseEvent): void {
    event.stopPropagation();
    this.progressService.toggleDayRevisionFlag(dayNumber);
  }

  onDayClick(day: DailyPlan): void {
    this.selectDay.emit(day);
  }

  onProjectClick(project: PhaseProject): void {
    this.selectProject.emit(project);
  }
}

