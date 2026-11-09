import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CurriculumService } from '../../../services/curriculum.service';
import { ThemeService } from '../../../services/theme.service';
import { SprintCalendarService } from '../../../services/sprint-calendar.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  readonly curriculum = inject(CurriculumService);
  readonly theme = inject(ThemeService);
  readonly calendarService = inject(SprintCalendarService);
  readonly router = inject(Router);

  readonly currentGuideDay = computed<number>(() => {
    const expected = this.curriculum.calendarPacing().expectedDayNumber;
    return expected > 0 ? expected : 1;
  });

  readonly paceTooltip = computed(() => {
    const pacing = this.curriculum.calendarPacing();
    if (pacing.paceStatus === 'critical' || pacing.paceStatus === 'behind') {
      const behindDays = Math.abs(pacing.paceDelta);
      return `🚨 ${pacing.paceDelta}D: ${behindDays} days behind Day ${pacing.expectedDayNumber} target. Click to open Sprint Calendar.`;
    }
    return `${pacing.paceMessage}. Click to open Sprint Calendar.`;
  });

  readonly overdueTooltip = computed(() => {
    const pacing = this.curriculum.calendarPacing();
    const count = this.curriculum.overdueCount();
    if (count === 0) return 'All scheduled tasks up to date!';
    const dayList = pacing.overdueTasks.map(t => `Day ${t.day}`).join(', ');
    return `⚠️ ${count} untracked overdue tasks (${dayList})! Click to filter and catch up.`;
  });

  navigateTo(path: string, event?: MouseEvent) {
    if (event) {
      event.preventDefault();
    }
    this.router.navigateByUrl(path);
  }

  toggleCalendar() {
    this.calendarService.toggle();
  }

  goToOverdue() {
    this.curriculum.filterStatus.set('overdue');
    this.curriculum.filterWeek.set('all');
    this.curriculum.filterGroup.set('all');
    this.router.navigateByUrl('/daily');
  }
}
