import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SprintCalendarComponent } from './sprint-calendar.component';
import { SprintCalendarService } from '../../services/sprint-calendar.service';
import { CurriculumService } from '../../services/curriculum.service';
import { provideRouter } from '@angular/router';

describe('SprintCalendarComponent', () => {
  let component: SprintCalendarComponent;
  let fixture: ComponentFixture<SprintCalendarComponent>;
  let calendarService: SprintCalendarService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SprintCalendarComponent],
      providers: [
        CurriculumService,
        SprintCalendarService,
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SprintCalendarComponent);
    component = fixture.componentInstance;
    calendarService = TestBed.inject(SprintCalendarService);
    fixture.detectChanges();
  });

  it('should create the sprint calendar component', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle calendar open and close state', () => {
    expect(calendarService.isOpen()).toBe(false);
    calendarService.toggle();
    expect(calendarService.isOpen()).toBe(true);
    calendarService.toggle();
    expect(calendarService.isOpen()).toBe(false);
  });

  it('should compute calendar days including sprint tasks', () => {
    // Navigate to November 2026 where Day 1 starts on Nov 11
    calendarService.currentMonth.set(new Date(2026, 10, 1));
    fixture.detectChanges();

    const days = component.calendarDays();
    expect(days.length).toBeGreaterThanOrEqual(35);

    // Find November 11, 2026 (Day 1)
    const day1 = days.find(d => d.isoDate === '2026-11-11');
    expect(day1).toBeDefined();
    expect(day1?.isSprintDay).toBe(true);
    expect(day1?.dayNumber).toBe(1);
    expect(day1?.tooltipText).toContain('Day 1 - LLM foundations');
  });

  it('should set hovered day on hover and clear on leave', () => {
    calendarService.currentMonth.set(new Date(2026, 10, 1));
    fixture.detectChanges();

    const day1 = component.calendarDays().find(d => d.isoDate === '2026-11-11');
    expect(day1).toBeDefined();

    component.onHoverDay(day1!);
    expect(calendarService.hoveredDay()).toEqual(day1);

    component.onLeaveDay();
    expect(calendarService.hoveredDay()).toBeNull();
  });

  it('should close calendar on escape key', () => {
    calendarService.isOpen.set(true);
    expect(calendarService.isOpen()).toBe(true);

    component.onEscape();
    expect(calendarService.isOpen()).toBe(false);
  });
});
