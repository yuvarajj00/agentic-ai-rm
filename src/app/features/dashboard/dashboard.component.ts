import { Component, computed, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CurriculumService } from '../../services/curriculum.service';
import { DailyTask, ProofLabel, PROOF_LABELS } from '../../models/curriculum.model';
import { ROTATING_QUOTES, MotivationalQuote } from '../../shared/constants/curriculum.constants';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  readonly curriculum = inject(CurriculumService);
  private readonly router = inject(Router);

  readonly quotes: MotivationalQuote[] = ROTATING_QUOTES;
  readonly currentQuoteIndex = signal<number>(0);
  readonly currentQuote = computed(() => this.quotes[this.currentQuoteIndex()]);
  readonly isAnimatingQuote = signal<boolean>(false);
  private quoteIntervalId: any = null;

  // Proof links form state
  readonly proofLabels: ProofLabel[] = PROOF_LABELS;
  selectedProofLabel: ProofLabel = 'GitHub Repo';
  newProofUrl: string = '';

  // Group all 35 days by week for visual flight map on the Dashboard
  readonly daysByWeek = computed(() => {
    const all = this.curriculum.dailyTasks();
    const map = new Map<number, DailyTask[]>();
    for (let w = 1; w <= 5; w++) {
      map.set(w, all.filter(t => t.week === w));
    }
    return Array.from(map.entries()).map(([week, tasks]) => ({ week, tasks }));
  });

  ngOnInit() {
    this.startQuoteRotation();
  }

  ngOnDestroy() {
    this.stopQuoteRotation();
  }

  addProof(dayId: string) {
    if (!this.newProofUrl || !this.newProofUrl.trim()) return;
    this.curriculum.addProofUrl(dayId, this.selectedProofLabel, this.newProofUrl.trim());
    this.newProofUrl = '';
  }

  removeProof(dayId: string, proofId: string) {
    this.curriculum.removeProofUrl(dayId, proofId);
  }

  getProofIcon(label: string): string {
    switch (label) {
      case 'GitHub Repo': return '🐙';
      case 'Live Demo': return '🌐';
      case 'PR / Commit': return '🔀';
      case 'Video Demo': return '🎥';
      case 'Documentation': return '📄';
      default: return '🔗';
    }
  }

  startQuoteRotation() {
    this.stopQuoteRotation();
    this.quoteIntervalId = setInterval(() => {
      this.advanceQuote(false);
    }, 3000);
  }

  stopQuoteRotation() {
    if (this.quoteIntervalId) {
      clearInterval(this.quoteIntervalId);
      this.quoteIntervalId = null;
    }
  }

  advanceQuote(isManual = false) {
    if (this.isAnimatingQuote()) return;
    this.isAnimatingQuote.set(true);

    setTimeout(() => {
      this.currentQuoteIndex.update(i => (i + 1) % this.quotes.length);
      this.isAnimatingQuote.set(false);
    }, 160);

    if (isManual) {
      this.startQuoteRotation();
    }
  }

  handleManualQuoteClick() {
    this.advanceQuote(true);
  }

  openTodayTask() {
    const today = this.curriculum.calendarPacing().todayTask || this.curriculum.currentActiveDay();
    if (today) {
      this.curriculum.selectDay(today);
      this.router.navigate(['/daily']);
    }
  }

  goToOldestOverdue() {
    const overdue = this.curriculum.calendarPacing().overdueTasks;
    if (overdue.length > 0) {
      this.curriculum.selectDay(overdue[0]);
      this.curriculum.filterStatus.set('overdue');
      this.curriculum.filterWeek.set('all');
      this.curriculum.filterGroup.set('all');
      this.router.navigate(['/daily']);
    }
  }

  goToOverdueList() {
    this.curriculum.filterStatus.set('overdue');
    this.curriculum.filterWeek.set('all');
    this.curriculum.filterGroup.set('all');
    this.router.navigate(['/daily']);
  }

  goToExpectedTarget() {
    const todayTask = this.curriculum.calendarPacing().todayTask;
    if (todayTask) {
      this.curriculum.selectDay(todayTask);
      this.curriculum.filterStatus.set('all');
      this.router.navigate(['/daily']);
    }
  }

  jumpToDay(task: DailyTask) {
    this.curriculum.selectDay(task);
    this.curriculum.filterStatus.set('all');
    this.curriculum.filterWeek.set('all');
    this.curriculum.filterGroup.set('all');
    this.curriculum.searchQuery.set('');
    this.router.navigate(['/daily']);
  }

  goToMilestones() {
    this.router.navigate(['/milestones']);
  }
}
