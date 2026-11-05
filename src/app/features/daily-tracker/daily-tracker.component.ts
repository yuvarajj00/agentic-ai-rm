import { Component, inject, signal, computed, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CurriculumService } from '../../services/curriculum.service';
import { CurriculumDetailService } from '../../services/curriculum-detail.service';
import { DailyTask, TopicGroup, ProofLabel, PROOF_LABELS } from '../../models/curriculum.model';
import { TOPIC_GROUPS, WEEKS_LIST } from '../../shared/constants/curriculum.constants';

@Component({
  selector: 'app-daily-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './daily-tracker.component.html',
  styleUrl: './daily-tracker.component.css'
})
export class DailyTrackerComponent implements OnInit {
  readonly curriculum = inject(CurriculumService);
  readonly detailService = inject(CurriculumDetailService);
  readonly topicGroups: TopicGroup[] = TOPIC_GROUPS;
  readonly weeksList: number[] = WEEKS_LIST;
  readonly proofLabels: ProofLabel[] = PROOF_LABELS;

  // New Proof Link Form State
  selectedProofLabel: ProofLabel = 'GitHub Repo';
  newProofUrl: string = '';

  // Visual 35-Day Roadmap Matrix Toggle
  readonly showMatrixView = signal<boolean>(true);

  // Day Detail Inspector Modal State
  readonly isInspectorModalOpen = signal<boolean>(false);

  // Group all 35 days by week (1 to 5) for the matrix overview
  readonly daysByWeek = computed(() => {
    const all = this.curriculum.dailyTasks();
    const map = new Map<number, DailyTask[]>();
    for (let w = 1; w <= 5; w++) {
      map.set(w, all.filter(t => t.week === w));
    }
    return Array.from(map.entries()).map(([week, tasks]) => ({ week, tasks }));
  });

  readonly isFilterActive = computed(() => {
    return (
      this.curriculum.filterWeek() !== 'all' ||
      this.curriculum.filterGroup() !== 'all' ||
      this.curriculum.filterStatus() !== 'all' ||
      this.curriculum.searchQuery().trim() !== ''
    );
  });

  ngOnInit() {
    // If arriving on tracker and filtered tasks are 0 (e.g. from an overdue filter when overdue count is 0), reset to show all 35
    if (this.curriculum.filteredTasks().length === 0) {
      this.resetAllFilters();
    }
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

  onWeekFilterChange(week: number | 'all' | string) {
    this.curriculum.setFilterWeek(week);
    const filtered = this.curriculum.filteredTasks();
    const sel = this.curriculum.selectedDay();
    // Auto-select the first day of the newly filtered week if current selection is outside this week
    if (filtered.length > 0 && (!sel || !filtered.some(t => t.id === sel.id))) {
      this.curriculum.selectDay(filtered[0]);
    }
  }

  resetAllFilters() {
    this.curriculum.setFilterWeek('all');
    this.curriculum.filterGroup.set('all');
    this.curriculum.filterStatus.set('all');
    this.curriculum.searchQuery.set('');
  }

  jumpToToday(openModal: boolean = true) {
    const today = this.curriculum.calendarPacing().todayTask || this.curriculum.currentActiveDay();
    if (today) {
      this.resetAllFilters();
      this.selectDay(today, openModal);
      setTimeout(() => {
        const el = document.getElementById(`day-task-card-${today.day}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 80);
    }
  }

  selectDay(task: DailyTask, openModal: boolean = true) {
    this.curriculum.selectDay(task);
    // Asynchronously load the enriched per-day details from static JSON
    this.detailService.loadDayDetail(task.day);

    // If the selected day is currently filtered out, reset filter so it becomes visible in the list
    if (!this.curriculum.filteredTasks().some(t => t.id === task.id)) {
      this.resetAllFilters();
    }
    if (openModal) {
      this.isInspectorModalOpen.set(true);
    }
  }

  closeDayModal() {
    this.isInspectorModalOpen.set(false);
  }

  goToPrevDay() {
    const current = this.curriculum.selectedDay();
    if (!current || current.day <= 1) return;
    const prev = this.curriculum.dailyTasks().find(t => t.day === current.day - 1);
    if (prev) {
      this.selectDay(prev, true);
    }
  }

  goToNextDay() {
    const current = this.curriculum.selectedDay();
    if (!current || current.day >= 35) return;
    const next = this.curriculum.dailyTasks().find(t => t.day === current.day + 1);
    if (next) {
      this.selectDay(next, true);
    }
  }

  toggleOverdueFilter() {
    if (this.curriculum.filterStatus() === 'overdue') {
      this.curriculum.filterStatus.set('all');
    } else {
      this.curriculum.filterStatus.set('overdue');
      this.curriculum.filterWeek.set('all');
      this.curriculum.filterGroup.set('all');
    }
  }

  @HostListener('document:keydown.escape')
  handleEscape() {
    if (this.isInspectorModalOpen()) {
      this.closeDayModal();
    }
  }
}
