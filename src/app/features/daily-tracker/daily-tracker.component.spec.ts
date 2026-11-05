import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DailyTrackerComponent } from './daily-tracker.component';
import { CurriculumService } from '../../services/curriculum.service';
import { MongoAtlasService } from '../../services/mongo-atlas.service';
import { provideRouter } from '@angular/router';

describe('DailyTrackerComponent', () => {
  let component: DailyTrackerComponent;
  let curriculum: CurriculumService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyTrackerComponent],
      providers: [
        CurriculumService,
        MongoAtlasService,
        provideRouter([])
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(DailyTrackerComponent);
    component = fixture.componentInstance;
    curriculum = TestBed.inject(CurriculumService);
  });

  describe('FILTER BY WEEK functionality', () => {
    it('should show all 35 days when filterWeek is all', () => {
      component.resetAllFilters();
      expect(curriculum.filterWeek()).toBe('all');
      expect(curriculum.filteredTasks().length).toBe(35);
    });

    it('should filter to 7 tasks when week 1 is selected as a number', () => {
      component.onWeekFilterChange(1);
      expect(curriculum.filterWeek()).toBe(1);
      const filtered = curriculum.filteredTasks();
      expect(filtered.length).toBe(7);
      expect(filtered.every(t => t.week === 1)).toBe(true);
      expect(filtered[0].day).toBe(1);
      expect(filtered[6].day).toBe(7);
    });

    it('should correctly handle week selected as a string (HTML select dropdown)', () => {
      component.onWeekFilterChange('2');
      expect(curriculum.filterWeek()).toBe(2);
      const filtered = curriculum.filteredTasks();
      expect(filtered.length).toBe(7);
      expect(filtered.every(t => t.week === 2)).toBe(true);
      expect(filtered[0].day).toBe(8);
      expect(filtered[6].day).toBe(14);
    });

    it('should automatically select first day of filtered week if previous selection is outside that week', () => {
      const day1 = curriculum.dailyTasks().find(t => t.day === 1)!;
      curriculum.selectDay(day1);
      expect(curriculum.selectedDay()?.day).toBe(1);

      // Filter to Week 3 (Days 15 to 21)
      component.onWeekFilterChange(3);
      expect(curriculum.selectedDay()?.day).toBe(15);
      expect(curriculum.selectedDay()?.week).toBe(3);
    });

    it('should preserve selected day if it already belongs to the filtered week', () => {
      const day16 = curriculum.dailyTasks().find(t => t.day === 16)!;
      curriculum.selectDay(day16);

      component.onWeekFilterChange(3);
      expect(curriculum.selectedDay()?.day).toBe(16);
    });

    it('should reset to all 35 days when resetAllFilters is called', () => {
      component.onWeekFilterChange(5);
      expect(curriculum.filteredTasks().length).toBe(7);

      component.resetAllFilters();
      expect(curriculum.filterWeek()).toBe('all');
      expect(curriculum.filteredTasks().length).toBe(35);
    });
  });

  describe('Day Detail Inspector Popup Modal', () => {
    it('should open inspector modal when a day is selected', () => {
      expect(component.isInspectorModalOpen()).toBe(false);
      const day5 = curriculum.dailyTasks().find(t => t.day === 5)!;

      component.selectDay(day5);

      expect(component.isInspectorModalOpen()).toBe(true);
      expect(curriculum.selectedDay()?.day).toBe(5);
    });

    it('should close inspector modal when closeDayModal is called', () => {
      const day5 = curriculum.dailyTasks().find(t => t.day === 5)!;
      component.selectDay(day5);
      expect(component.isInspectorModalOpen()).toBe(true);

      component.closeDayModal();
      expect(component.isInspectorModalOpen()).toBe(false);
    });

    it('should navigate to next day and prev day from modal', () => {
      const day10 = curriculum.dailyTasks().find(t => t.day === 10)!;
      component.selectDay(day10);
      expect(curriculum.selectedDay()?.day).toBe(10);

      component.goToNextDay();
      expect(curriculum.selectedDay()?.day).toBe(11);
      expect(component.isInspectorModalOpen()).toBe(true);

      component.goToPrevDay();
      expect(curriculum.selectedDay()?.day).toBe(10);
      expect(component.isInspectorModalOpen()).toBe(true);
    });

    it('should close inspector modal on Escape key press', () => {
      const day1 = curriculum.dailyTasks().find(t => t.day === 1)!;
      component.selectDay(day1);
      expect(component.isInspectorModalOpen()).toBe(true);

      component.handleEscape();
      expect(component.isInspectorModalOpen()).toBe(false);
    });
  });
});
