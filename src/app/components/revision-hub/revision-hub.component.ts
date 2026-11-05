import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoadmapService } from '../../services/roadmap.service';
import { ProgressService } from '../../services/progress.service';
import { DailyPlan } from '../../interfaces/daily-plan.interface';
import { PhaseProject } from '../../interfaces/phase-project.interface';
import { DayProgress, ProjectSubmission } from '../../interfaces/user-progress.interface';

@Component({
  selector: 'app-revision-hub',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './revision-hub.component.html',
  styleUrl: './revision-hub.component.css'
})
export class RevisionHubComponent {
  roadmapService = inject(RoadmapService);
  progressService = inject(ProgressService);

  @Output() selectDay = new EventEmitter<DailyPlan>();
  @Output() selectProject = new EventEmitter<PhaseProject>();

  activeFilter: 'starred' | 'all-completed' | 'projects' | 'all-days' = 'starred';
  searchQuery: string = '';
  selectedPhase: number = 0; // 0 = all phases
  exportSuccessMsg: string = '';

  get dailyPlans(): DailyPlan[] {
    return this.roadmapService.dailyPlans();
  }

  get phaseProjects(): PhaseProject[] {
    return this.roadmapService.phaseProjects();
  }

  get filteredDays(): DailyPlan[] {
    let days = this.dailyPlans;

    if (this.selectedPhase > 0) {
      days = days.filter(d => d.week === this.selectedPhase);
    }

    if (this.activeFilter === 'starred') {
      days = days.filter(d => this.progressService.getDayProgress(d.day).isFlaggedForRevision);
    } else if (this.activeFilter === 'all-completed') {
      days = days.filter(d => this.progressService.getDayProgress(d.day).isCompleted);
    }

    if (this.searchQuery.trim().length > 0) {
      const q = this.searchQuery.toLowerCase();
      days = days.filter(d =>
        d.title.toLowerCase().includes(q) ||
        d.learning_objective.toLowerCase().includes(q) ||
        d.concepts.some(c => c.toLowerCase().includes(q)) ||
        (this.progressService.getDayProgress(d.day).notes || '').toLowerCase().includes(q)
      );
    }

    return days;
  }

  getDayProgress(dayNumber: number): DayProgress {
    return this.progressService.getDayProgress(dayNumber);
  }

  getProjectSubmission(projectId: string): ProjectSubmission {
    return this.progressService.getProjectSubmission(projectId);
  }

  openDay(day: DailyPlan): void {
    this.selectDay.emit(day);
  }

  openProject(project: PhaseProject): void {
    this.selectProject.emit(project);
  }

  // Export full learning portfolio as Markdown
  exportAsMarkdown(): void {
    let md = `# Agentic AI: 35-Day Learning Portfolio & Revision Notes\n\n`;
    md += `**Generated**: ${new Date().toLocaleDateString()}\n`;
    md += `**Curriculum Progress**: ${this.progressService.completedDaysCount()} / 35 Days Completed (${this.progressService.progressPercentage()}%)\n`;
    md += `**Projects Built**: ${this.progressService.submittedProjects().length} / 5 Projects Submitted\n\n`;

    md += `## Phase Projects (P1 - P5)\n\n`;
    for (const proj of this.phaseProjects) {
      const sub = this.getProjectSubmission(proj.id);
      md += `### ${proj.id}: ${proj.name}\n`;
      md += `- **Dates**: ${proj.dates.start} to ${proj.dates.end}\n`;
      md += `- **Objective**: ${proj.objective}\n`;
      if (sub.isSubmitted) {
        if (sub.githubUrl) md += `- **GitHub**: ${sub.githubUrl}\n`;
        if (sub.liveDemoUrl) md += `- **Live Demo**: ${sub.liveDemoUrl}\n`;
        if (sub.videoDemoUrl) md += `- **Video Walkthrough**: ${sub.videoDemoUrl}\n`;
        if (sub.notes) md += `- **Notes**: ${sub.notes}\n`;
      } else {
        md += `- *Status: Not yet submitted*\n`;
      }
      md += `\n`;
    }

    md += `## Daily Log & Revision Notes\n\n`;
    for (const d of this.dailyPlans) {
      const prog = this.getDayProgress(d.day);
      const mark = prog.isCompleted ? '✓' : ' ';
      md += `### [${mark}] Day ${d.day}: ${d.title} (${d.weekday}, ${d.date})\n`;
      md += `- **Objective**: ${d.learning_objective}\n`;
      md += `- **Deliverable**: ${d.deliverable}\n`;
      if (prog.proofUrls && prog.proofUrls.length > 0) {
        md += `- **Proof Links**:\n`;
        for (const p of prog.proofUrls) {
          md += `  - ${p.label}: ${p.url}\n`;
        }
      }
      if (prog.notes) {
        md += `- **Personal Notes**:\n  > ${prog.notes.replace(/\n/g, '\n  > ')}\n`;
      }
      md += `\n`;
    }

    // Copy to clipboard
    navigator.clipboard.writeText(md).then(() => {
      this.exportSuccessMsg = 'Copied Markdown Portfolio to clipboard!';
      setTimeout(() => { this.exportSuccessMsg = ''; }, 3500);
    });
  }

  exportAsJSON(): void {
    const data = {
      exportedAt: new Date().toISOString(),
      userProgress: this.progressService.progressState()
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agentic-ai-portfolio-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.exportSuccessMsg = 'Downloaded JSON progress file!';
    setTimeout(() => { this.exportSuccessMsg = ''; }, 3500);
  }
}

