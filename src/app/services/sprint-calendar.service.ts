import { Injectable, computed, inject, signal } from '@angular/core';
import { CurriculumService } from './curriculum.service';
import { DailyTask } from '../models/curriculum.model';

export interface SprintCalendarDay {
  date: Date;
  isoDate: string; // YYYY-MM-DD
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSprintDay: boolean;
  isBufferDay: boolean;
  dayNumber: number | null;
  topic: string | null;
  status: 'completed' | 'in_progress' | 'not_started' | 'blocked' | 'buffer' | 'none';
  statusDisplay: string;
  tooltipText: string;
  task: DailyTask | null;
}

@Injectable({
  providedIn: 'root'
})
export class SprintCalendarService {
  private curriculum = inject(CurriculumService);

  readonly isOpen = signal<boolean>(false);
  readonly currentMonth = signal<Date>(this.getInitialDate());
  readonly hoveredDay = signal<SprintCalendarDay | null>(null);

  private getInitialDate(): Date {
    const pacing = this.curriculum.calendarPacing();
    return new Date(pacing.currentCalendarDate || new Date(2026, 10, 4));
  }

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
    this.hoveredDay.set(null);
  }

  toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.goToToday();
      this.open();
    }
  }

  nextMonth(): void {
    const d = new Date(this.currentMonth());
    d.setMonth(d.getMonth() + 1);
    this.currentMonth.set(d);
  }

  prevMonth(): void {
    const d = new Date(this.currentMonth());
    d.setMonth(d.getMonth() - 1);
    this.currentMonth.set(d);
  }

  goToToday(): void {
    const pacing = this.curriculum.calendarPacing();
    const today = new Date(pacing.currentCalendarDate || new Date(2026, 10, 4));
    this.currentMonth.set(new Date(today.getFullYear(), today.getMonth(), 1));
  }

  setHoveredDay(day: SprintCalendarDay | null): void {
    this.hoveredDay.set(day);
  }
}

