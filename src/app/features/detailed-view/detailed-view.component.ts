import { Component, inject, signal, computed, OnInit, OnDestroy, HostListener, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { CurriculumService } from '../../services/curriculum.service';
import { CurriculumDetailService } from '../../services/curriculum-detail.service';
import { DailyTask } from '../../models/curriculum.model';
import { DayDetail } from '../../models/day-detail.model';
import { MarkdownPipe, highlightCode } from '../../shared/pipes/markdown.pipe';

@Component({
  selector: 'app-detailed-view',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MarkdownPipe],
  templateUrl: './detailed-view.component.html',
  styleUrl: './detailed-view.component.css',
  encapsulation: ViewEncapsulation.None
})
export class DetailedViewComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);
  readonly curriculum = inject(CurriculumService);
  readonly detailService = inject(CurriculumDetailService);

  private routeSub?: Subscription;

  // Current day number (1 to 35)
  readonly dayNumber = signal<number>(1);

  // Active section for sticky Table of Contents highlighting
  readonly activeSection = signal<string>('overview');

  // Associated daily task from main tracker
  readonly currentTask = computed<DailyTask | undefined>(() => {
    const day = this.dayNumber();
    return this.curriculum.dailyTasks().find(t => t.day === day);
  });

  // Enriched detail from JSON
  readonly detail = computed<DayDetail | null>(() => this.detailService.currentDetail());

  // Interactive UI state
  readonly revealedSolutions = signal<Set<string>>(new Set());
  readonly copiedSnippetId = signal<string | null>(null);

  // Quick navigation list of all 35 days
  readonly allTasks = computed(() => this.curriculum.dailyTasks());

  /**
   * Produce safe syntax-highlighted HTML for Python code snippets
   */
  highlightPython(code: string): SafeHtml {
    if (!code) return '';
    return this.sanitizer.bypassSecurityTrustHtml(highlightCode(code, 'python'));
  }

  /**
   * Determine if a question is an interview / conceptual question rather than a coding lab
   */
  isInterviewQuestion(q: any): boolean {
    if (!q) return false;
    const title = (q.title || '').toLowerCase();
    const sol = (q.solutionCode || '').trim();
    return title.includes('interview') || sol.startsWith('#') || sol.startsWith('"""');
  }

  isInterviewSolution(solutionCode: string): boolean {
    if (!solutionCode) return false;
    const trimmed = solutionCode.trim();
    return trimmed.startsWith('#') || trimmed.startsWith('"""');
  }

  cleanInterviewAnswer(solutionCode: string): string {
    if (!solutionCode) return '';
    return solutionCode
      .split('\n')
      .map(line => line.replace(/^\s*(#|""")/i, '').replace(/"""$/i, ''))
      .map(line => line.replace(/^Strong interview answer:\s*/i, ''))
      .join('\n')
      .trim();
  }

  getTaskBadge(action: any): string {
    if (!action) return 'learn';
    const text = (action.text || '').toLowerCase();
    const type = (action.type || '').toLowerCase();
    if (type === 'build' || text.includes('implement') || text.includes('deliverable')) return 'build';
    if (type === 'interview' || text.includes('interview')) return 'interview';
    if (text.includes('core concept')) return 'concept';
    if (text.includes('mechanism') || text.includes('detail')) return 'mechanic';
    if (type === 'practice') return 'practice';
    return type || 'learn';
  }

  ngOnInit() {
    this.routeSub = this.route.paramMap.subscribe(params => {
      const dayParam = params.get('day') || '1';
      // Support formats: "day1", "day-1", "1", "Day-08"
      const parsed = parseInt(dayParam.replace(/\D/g, ''), 10);
      const safeDay = isNaN(parsed) || parsed < 1 ? 1 : Math.min(parsed, 35);

      this.dayNumber.set(safeDay);
      this.detailService.loadDayDetail(safeDay);
      this.revealedSolutions.set(new Set());

      // Scroll to top when day changes
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  ngOnDestroy() {
    this.routeSub?.unsubscribe();
  }

  goToDay(day: number) {
    if (day >= 1 && day <= 35) {
      this.router.navigate(['/detailedview', `day${day}`]);
    }
  }

  goToPrevDay() {
    const current = this.dayNumber();
    if (current > 1) {
      this.goToDay(current - 1);
    }
  }

  goToNextDay() {
    const current = this.dayNumber();
    if (current < 35) {
      this.goToDay(current + 1);
    }
  }

  scrollToSection(sectionId: string, event?: Event) {
    if (event) {
      event.preventDefault();
    }
    this.activeSection.set(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    if (typeof window === 'undefined') return;
    const sections = ['overview', 'resources', 'concepts', 'practice', 'starter-lab', 'pitfalls', 'interview'];
    const scrollPosition = window.scrollY + 200;

    for (const id of sections) {
      const el = document.getElementById(id);
      if (el) {
        const top = el.offsetTop;
        const height = el.offsetHeight;
        if (scrollPosition >= top && scrollPosition < top + height) {
          this.activeSection.set(id);
          break;
        }
      }
    }
  }

  isSolutionRevealed(id: string): boolean {
    return this.revealedSolutions().has(id);
  }

  toggleSolution(id: string) {
    const set = new Set(this.revealedSolutions());
    if (set.has(id)) {
      set.delete(id);
    } else {
      set.add(id);
    }
    this.revealedSolutions.set(set);
  }

  async copyCode(code: string, snippetId: string) {
    const ok = await this.detailService.copyCode(code);
    if (ok) {
      this.copiedSnippetId.set(snippetId);
      setTimeout(() => this.copiedSnippetId.set(null), 2500);
    }
  }

  toggleTaskStatus() {
    const t = this.currentTask();
    if (!t) return;
    const nextStatus = t.status === 'completed' ? 'in_progress' : 'completed';
    this.curriculum.updateTaskStatus(t.id, nextStatus);
  }
}
