import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PhaseProject } from '../../interfaces/phase-project.interface';
import { ProjectSubmission, ProofUrl } from '../../interfaces/user-progress.interface';
import { ProgressService } from '../../services/progress.service';

@Component({
  selector: 'app-phase-project',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './phase-project.component.html',
  styleUrl: './phase-project.component.css'
})
export class PhaseProjectComponent implements OnChanges {
  progressService = inject(ProgressService);

  @Input() project!: PhaseProject;
  @Output() close = new EventEmitter<void>();

  isEditMode: boolean = false;

  // Local editable draft
  draftGithubUrl: string = '';
  draftLiveDemoUrl: string = '';
  draftVideoDemoUrl: string = '';
  draftNotes: string = '';
  draftAdditionalUrls: ProofUrl[] = [];

  readonly additionalLabels = [
    'Documentation',
    'PR / Commit',
    'Live Demo',
    'Video Demo',
    'GitHub Repo',
    'Other'
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['project'] && this.project) {
      this.syncFromProgress();
    }
  }

  get submission(): ProjectSubmission {
    return this.progressService.getProjectSubmission(this.project.id);
  }

  get isSubmitted(): boolean {
    return this.submission.isSubmitted;
  }

  get isFlaggedForRevision(): boolean {
    return !!this.submission.isFlaggedForRevision;
  }

  syncFromProgress(): void {
    const sub = this.submission;
    this.draftGithubUrl = sub.githubUrl || '';
    this.draftLiveDemoUrl = sub.liveDemoUrl || '';
    this.draftVideoDemoUrl = sub.videoDemoUrl || '';
    this.draftNotes = sub.notes || '';
    this.draftAdditionalUrls = sub.additionalUrls ? JSON.parse(JSON.stringify(sub.additionalUrls)) : [];
  }

  toggleEditMode(): void {
    if (this.isEditMode) {
      this.saveSubmission();
    } else {
      this.syncFromProgress();
    }
    this.isEditMode = !this.isEditMode;
  }

  toggleRevisionFlag(): void {
    this.progressService.toggleProjectRevisionFlag(this.project.id);
  }

  addExtraUrl(): void {
    this.draftAdditionalUrls.push({
      label: 'Documentation',
      url: ''
    });
  }

  removeExtraUrl(index: number): void {
    this.draftAdditionalUrls.splice(index, 1);
  }

  saveSubmission(): void {
    const cleanedUrls = this.draftAdditionalUrls.filter(u => u.url && u.url.trim().length > 0);
    const hasAnyUrl = Boolean(this.draftGithubUrl.trim() || this.draftLiveDemoUrl.trim() || this.draftVideoDemoUrl.trim() || cleanedUrls.length > 0);

    const submission: ProjectSubmission = {
      ...this.submission,
      projectId: this.project.id,
      isSubmitted: hasAnyUrl || this.submission.isSubmitted,
      githubUrl: this.draftGithubUrl.trim(),
      liveDemoUrl: this.draftLiveDemoUrl.trim(),
      videoDemoUrl: this.draftVideoDemoUrl.trim(),
      additionalUrls: cleanedUrls,
      notes: this.draftNotes.trim(),
      submittedAt: this.submission.submittedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.progressService.saveProjectSubmission(submission);
  }
}

