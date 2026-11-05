import { describe, it, beforeEach, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { CurriculumService } from './curriculum.service';
import { MongoAtlasService } from './mongo-atlas.service';

describe('CurriculumService - Calendar Pacing & Untracked Day Alerts', () => {
  let service: CurriculumService;
  let mockAtlas: any;

  beforeEach(() => {
    mockAtlas = {
      syncStatus: { set: vi.fn(), subscribe: vi.fn() },
      lastSyncedAt: () => 'Never',
      syncError: () => null,
      fetchProgress: vi.fn().mockResolvedValue(null),
      saveProgress: vi.fn().mockResolvedValue(true),
      resetAtlas: vi.fn().mockResolvedValue(true)
    };

    TestBed.configureTestingModule({
      providers: [
        CurriculumService,
        { provide: MongoAtlasService, useValue: mockAtlas }
      ]
    });

    service = TestBed.inject(CurriculumService);
  });

  it('should identify pre-sprint phase before November 5, 2026', () => {
    service.setSimulationDate('2026-10-29');
    const pacing = service.calendarPacing();

    expect(pacing.isPreSprint).toBe(true);
    expect(pacing.paceStatus).toBe('pre_sprint');
    expect(pacing.daysUntilSprint).toBe(7);
    expect(pacing.expectedDayNumber).toBe(0);
    expect(pacing.overdueCount).toBe(0);
  });

  it('should identify Day 1 on sprint kickoff date November 5, 2026', () => {
    service.setSimulationDate('2026-11-05');
    const pacing = service.calendarPacing();

    expect(pacing.isPreSprint).toBe(false);
    expect(pacing.expectedDayNumber).toBe(1);
    expect(pacing.todayTask?.day).toBe(1);
  });

  it('should accurately detect overdue untracked tasks and critical pacing when behind', () => {
    service.setSimulationDate('2026-11-16'); // Day 12
    const pacing = service.calendarPacing();

    expect(pacing.expectedDayNumber).toBe(12);
    // Tasks before Day 12 that are untracked
    const overdueExpected = service.dailyTasks().filter(t => t.day < 12 && t.status !== 'completed').length;
    expect(pacing.overdueCount).toBe(overdueExpected);
    expect(service.isBehindSchedule()).toBe(true);

    // Verify task overdue helper
    const day5Task = service.dailyTasks().find(t => t.day === 5)!;
    const day12Task = service.dailyTasks().find(t => t.day === 12)!;
    const day20Task = service.dailyTasks().find(t => t.day === 20)!;

    expect(service.isTaskOverdue(day5Task)).toBe(true);
    expect(service.isTaskToday(day12Task)).toBe(true);
    expect(service.isTaskOverdue(day12Task)).toBe(false); // Today's task is active, not past overdue
    expect(service.isTaskOverdue(day20Task)).toBe(false); // Future task
  });

  it('should filter only overdue tasks when filterStatus is set to overdue', () => {
    service.setSimulationDate('2026-11-16');
    service.filterStatus.set('overdue');

    const filtered = service.filteredTasks();
    const expectedCount = service.dailyTasks().filter(t => t.day < 12 && t.status !== 'completed').length;
    expect(filtered.length).toBe(expectedCount);
    expect(filtered.every(t => t.day < 12)).toBe(true);
  });

  it('should reduce overdue count when an untracked day is completed', () => {
    service.setSimulationDate('2026-11-16');
    const initialOverdue = service.overdueCount();

    const day5 = service.dailyTasks().find(t => t.day === 5)!;
    service.updateTaskStatus(day5.id, 'completed');

    expect(service.overdueCount()).toBe(initialOverdue - 1);
    expect(service.isTaskOverdue(service.dailyTasks().find(t => t.day === 5)!)).toBe(false);
  });

  it('should add and remove multiple proof links with distinct ProofLabel types', () => {
    const day1 = service.dailyTasks().find(t => t.day === 1)!;
    expect(day1.proofUrls?.length || 0).toBe(0);

    // Add GitHub repo link
    service.addProofUrl(day1.id, 'GitHub Repo', 'https://github.com/yaminii5/agentic-ai-day1');
    let updated = service.dailyTasks().find(t => t.day === 1)!;
    expect(updated.proofUrls?.length).toBe(1);
    expect(updated.proofUrls![0].label).toBe('GitHub Repo');
    expect(updated.proofUrls![0].url).toBe('https://github.com/yaminii5/agentic-ai-day1');

    // Add Live Demo link
    service.addProofUrl(day1.id, 'Live Demo', 'https://agentic-ai-demo.vercel.app');
    updated = service.dailyTasks().find(t => t.day === 1)!;
    expect(updated.proofUrls?.length).toBe(2);
    expect(updated.proofUrls![1].label).toBe('Live Demo');

    // Add PR / Commit link
    service.addProofUrl(day1.id, 'PR / Commit', 'https://github.com/yaminii5/agentic-ai/pull/1');
    updated = service.dailyTasks().find(t => t.day === 1)!;
    expect(updated.proofUrls?.length).toBe(3);

    // Remove the second proof link (Live Demo)
    const proofToRemove = updated.proofUrls![1].id;
    service.removeProofUrl(day1.id, proofToRemove);
    updated = service.dailyTasks().find(t => t.day === 1)!;
    expect(updated.proofUrls?.length).toBe(2);
    expect(updated.proofUrls?.some(p => p.label === 'Live Demo')).toBe(false);
  });
});
