import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeeklyPlan } from '../../interfaces/weekly-plan.interface';
import { DailyPlan } from '../../interfaces/daily-plan.interface';
import { PhaseProject } from '../../interfaces/phase-project.interface';
import { RoadmapService } from '../../services/roadmap.service';
import { ProgressService } from '../../services/progress.service';

@Component({
  selector: 'app-week-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './week-card.component.html',
  styleUrl: './week-card.component.css'
})
export class WeekCardComponent {
  roadmapService = inject(RoadmapService);
  progressService = inject(ProgressService);

  @Input() week!: WeeklyPlan;
  @Output() selectDay = new EventEmitter<DailyPlan>();
  @Output() selectProject = new EventEmitter<PhaseProject>();

  get weekDays(): DailyPlan[] {
    return this.roadmapService.dailyPlans().filter(d => d.week === this.week.week);
  }

  get linkedProject(): PhaseProject | undefined {
    return this.roadmapService.getProject(this.week.weekly_project_id);
  }

  get completedDaysInWeek(): number {
    const daysInWeek = this.weekDays.map(d => d.day);
    const completedSet = new Set(this.progressService.progressState().completedDays);
    return daysInWeek.filter(d => completedSet.has(d)).length;
  }

  isDayComplete(dayNumber: number): boolean {
    return this.progressService.getDayProgress(dayNumber).isCompleted;
  }

  toggleDay(dayNumber: number, event: MouseEvent): void {
    event.stopPropagation();
    this.progressService.toggleDayCompletion(dayNumber);
  }

  onDayClick(day: DailyPlan): void {
    this.selectDay.emit(day);
  }

  onProjectClick(): void {
    if (this.linkedProject) {
      this.selectProject.emit(this.linkedProject);
    }
  }
}

