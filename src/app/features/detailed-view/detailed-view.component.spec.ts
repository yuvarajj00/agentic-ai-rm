import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DetailedViewComponent } from './detailed-view.component';
import { CurriculumService } from '../../services/curriculum.service';
import { CurriculumDetailService } from '../../services/curriculum-detail.service';
import { MongoAtlasService } from '../../services/mongo-atlas.service';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('DetailedViewComponent', () => {
  let component: DetailedViewComponent;
  let curriculum: CurriculumService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailedViewComponent],
      providers: [
        CurriculumService,
        CurriculumDetailService,
        MongoAtlasService,
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: (key: string) => (key === 'day' ? '1' : null) })
          }
        }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(DetailedViewComponent);
    component = fixture.componentInstance;
    curriculum = TestBed.inject(CurriculumService);
    component.ngOnInit();
  });

  it('should initialize with day 1', () => {
    expect(component.dayNumber()).toBe(1);
    expect(component.currentTask()?.day).toBe(1);
  });

  it('should toggle solution visibility', () => {
    expect(component.isSolutionRevealed('q-1')).toBe(false);

    component.toggleSolution('q-1');
    expect(component.isSolutionRevealed('q-1')).toBe(true);

    component.toggleSolution('q-1');
    expect(component.isSolutionRevealed('q-1')).toBe(false);
  });

  it('should detect interview questions', () => {
    expect(component.isInterviewQuestion({ title: 'System Design Interview Question', solutionCode: 'def test(): pass' })).toBe(true);
    expect(component.isInterviewQuestion({ title: 'Build LangGraph Workflow', solutionCode: 'def test(): pass' })).toBe(false);
  });

  it('should clean interview comments from answer code', () => {
    const raw = '# Strong interview answer:\n# Use checkpointers for persistence\n# And state graph';
    const cleaned = component.cleanInterviewAnswer(raw);
    expect(cleaned).toContain('Use checkpointers for persistence');
    expect(cleaned).not.toContain('#');
  });

  it('should toggle task completion status', () => {
    const task = component.currentTask();
    expect(task).toBeTruthy();
    const initialStatus = task!.status;

    component.toggleTaskStatus();
    expect(component.currentTask()?.status).toBe(initialStatus === 'completed' ? 'in_progress' : 'completed');
  });
});
