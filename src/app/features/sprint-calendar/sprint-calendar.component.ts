import { Component, HostListener, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CurriculumService } from '../../services/curriculum.service';
import { SprintCalendarService, SprintCalendarDay } from '../../services/sprint-calendar.service';
import { DailyTask } from '../../models/curriculum.model';

@Component({
  selector: 'app-sprint-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sprint-calendar.component.html',
  styleUrl: './sprint-calendar.component.css'
})
export class SprintCalendarComponent {
  readonly curriculum = inject(CurriculumService);
  readonly calendarService = inject(SprintCalendarService);
  private router = inject(Router);

  readonly weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  readonly monthTitle = computed<string>(() => {
    const d = this.calendarService.currentMonth();
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  });

  readonly todayIso = computed<string>(() => {
    const pacing = this.curriculum.calendarPacing();
    const today = pacing.currentCalendarDate || new Date();
    return this.formatIso(today);
  });

  readonly taskByIsoDate = computed<Map<string, DailyTask>>(() => {
    const map = new Map<string, DailyTask>();
    for (const task of this.curriculum.dailyTasks()) {
      if (task.date) {
        const parsed = new Date(task.date);
        if (!isNaN(parsed.getTime())) {
          map.set(this.formatIso(parsed), task);
        }
      }
    }
    return map;
  });

  readonly calendarDays = computed<SprintCalendarDay[]>(() => {
    const current = this.calendarService.currentMonth();
    const year = current.getFullYear();
    const month = current.getMonth();
    const todayIsoStr = this.todayIso();
    const taskMap = this.taskByIsoDate();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDayOfWeek = firstDay.getDay(); // 0 is Sunday
    const daysInMonth = lastDay.getDate();

    const days: SprintCalendarDay[] = [];

    // Previous month padding days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      days.push(this.createCalendarDay(d, false, todayIsoStr, taskMap));
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      days.push(this.createCalendarDay(d, true, todayIsoStr, taskMap));
    }

    // Next month padding days to complete grid (multiples of 7, 35 or 42)
    const totalSlots = days.length <= 35 ? 35 : 42;
    const remaining = totalSlots - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push(this.createCalendarDay(d, false, todayIsoStr, taskMap));
    }

    return days;
  });

  readonly activeHover = computed<SprintCalendarDay | null>(() => {
    return this.calendarService.hoveredDay();
  });

  private createCalendarDay(
    date: Date,
    isCurrentMonth: boolean,
    todayIsoStr: string,
    taskMap: Map<string, DailyTask>
  ): SprintCalendarDay {
    const isoDate = this.formatIso(date);
    const isToday = isoDate === todayIsoStr;
    const task = taskMap.get(isoDate) || null;

    // Transition buffer check: October 29, 2026 to November 8, 2026
    const utcTime = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    const oct29Utc = Date.UTC(2026, 9, 29);
    const nov8Utc = Date.UTC(2026, 10, 8);
    const isTransitionBuffer = utcTime >= oct29Utc && utcTime <= nov8Utc;

    let isSprintDay = false;
    let isBufferDay = false;
    let dayNumber: number | null = null;
    let topic: string | null = null;
    let status: SprintCalendarDay['status'] = 'none';
    let statusDisplay = '';
    let tooltipText = '';

    if (task) {
      isSprintDay = true;
      isBufferDay = !!task.isBufferDay;
      dayNumber = task.day;
      topic = task.topic;
      status = task.status;
      statusDisplay = this.formatStatus(task.status);
      tooltipText = `Day ${task.day} - ${task.topic} [${statusDisplay}]`;
    } else if (isTransitionBuffer) {
      isSprintDay = true;
      isBufferDay = true;
      dayNumber = 7;
      topic = 'Transition Buffer (Target: Day 7)';
      status = 'buffer';
      statusDisplay = 'Buffer';
      tooltipText = `Day 7 - Transition Buffer [Buffer]`;
    } else {
      statusDisplay = isCurrentMonth ? 'Off-Sprint' : '';
      tooltipText = `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }

    return {
      date,
      isoDate,
      dayOfMonth: date.getDate(),
      isCurrentMonth,
      isToday,
      isSprintDay,
      isBufferDay,
      dayNumber,
      topic,
      status,
      statusDisplay,
      tooltipText,
      task
    };
  }

  private formatIso(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatStatus(status: DailyTask['status']): string {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in_progress': return 'In Progress';
      case 'blocked': return 'Blocked';
      case 'not_started': return 'Not Started';
      default: return 'Pending';
    }
  }

  onHoverDay(day: SprintCalendarDay): void {
    if (day.isCurrentMonth) {
      this.calendarService.setHoveredDay(day);
    }
  }

  onLeaveDay(): void {
    this.calendarService.setHoveredDay(null);
  }

  onSelectDay(day: SprintCalendarDay): void {
    if (day.isSprintDay && day.dayNumber) {
      if (day.task) {
        this.curriculum.selectDay(day.task);
      }
      this.router.navigate(['/detailedview', 'day' + day.dayNumber]);
      this.calendarService.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.calendarService.isOpen()) {
      this.calendarService.close();
    }
  }
}
