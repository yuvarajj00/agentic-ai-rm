import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressService } from '../../services/progress.service';
import { RoadmapService } from '../../services/roadmap.service';

@Component({
  selector: 'app-progress-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-stats.component.html',
  styleUrl: './progress-stats.component.css'
})
export class ProgressStatsComponent {
  progressService = inject(ProgressService);
  roadmapService = inject(RoadmapService);

  get completedDays(): number {
    return this.progressService.completedDaysCount();
  }

  get percentage(): number {
    return this.progressService.progressPercentage();
  }

  get hoursInvested(): number {
    return this.progressService.totalHoursInvested();
  }

  get streak(): number {
    return this.progressService.streak();
  }

  get projectsSubmitted(): number {
    return this.progressService.submittedProjects().length;
  }

  get revisionCount(): number {
    return this.progressService.revisionDays().length;
  }
}

