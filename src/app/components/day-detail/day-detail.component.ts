import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DailyPlan } from '../../interfaces/daily-plan.interface';
import { DayProgress, ProofUrl } from '../../interfaces/user-progress.interface';
import { ProgressService } from '../../services/progress.service';
import { RoadmapService } from '../../services/roadmap.service';

@Component({
  selector: 'app-day-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './day-detail.component.html',
  styleUrl: './day-detail.component.css'
})
export class DayDetailComponent implements OnChanges {
  progressService = inject(ProgressService);
  roadmapService = inject(RoadmapService);

  @Input() day!: DailyPlan;
  @Output() close = new EventEmitter<void>();

  // Mode: 'view' vs 'edit'
  isEditMode: boolean = false;

  // Local draft state for editing
  draftNotes: string = '';
  draftProofUrls: ProofUrl[] = [];

  readonly proofLabels = [
    'GitHub Repo',
    'Live Demo',
    'PR / Commit',
    'Video Demo',
    'Documentation',
    'Other'
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['day'] && this.day) {
      this.syncFromProgress();
    }
  }

  get dayProgress(): DayProgress {
    return this.progressService.getDayProgress(this.day.day);
  }

  get isCompleted(): boolean {
    return this.dayProgress.isCompleted;
  }

  get isFlaggedForRevision(): boolean {
    return !!this.dayProgress.isFlaggedForRevision;
  }

  syncFromProgress(): void {
    const prog = this.dayProgress;
    this.draftNotes = prog.notes || '';
    this.draftProofUrls = prog.proofUrls ? JSON.parse(JSON.stringify(prog.proofUrls)) : [];
  }

  toggleEditMode(): void {
    if (this.isEditMode) {
      // Exiting edit mode: save changes
      this.saveChanges();
    } else {
      // Entering edit mode: sync draft
      this.syncFromProgress();
    }
    this.isEditMode = !this.isEditMode;
  }

  toggleCompletion(): void {
    this.progressService.toggleDayCompletion(this.day.day);
  }

  toggleRevisionFlag(): void {
    this.progressService.toggleDayRevisionFlag(this.day.day);
  }

  isTaskChecked(taskIndex: number): boolean {
    return (this.dayProgress.completedTasks || []).includes(taskIndex);
  }

  onToggleTask(taskIndex: number): void {
    this.progressService.toggleTask(this.day.day, taskIndex);
  }

  addProofUrl(): void {
    this.draftProofUrls.push({
      label: 'GitHub Repo',
      url: ''
    });
  }

  removeProofUrl(index: number): void {
    this.draftProofUrls.splice(index, 1);
  }

  saveChanges(): void {
    // Filter out empty URLs
    const cleanedUrls = this.draftProofUrls.filter(p => p.url && p.url.trim().length > 0);
    this.progressService.saveDayDetails(this.day.day, this.draftNotes, cleanedUrls);
  }

  getLabelIcon(label: string): string {
    switch (label) {
      case 'GitHub Repo': return '🐙';
      case 'Live Demo': return '🌐';
      case 'PR / Commit': return '🔀';
      case 'Video Demo': return '🎥';
      case 'Documentation': return '📄';
      default: return '🔗';
    }
  }
}

