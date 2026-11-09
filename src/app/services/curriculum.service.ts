import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { DailyTask, WeeklyMilestone, TechSkill, TopicGroup, TaskStatus, PaceStatus, CalendarPacingSummary, ProofLabel, ProofUrlItem } from '../models/curriculum.model';
import { INITIAL_DAILY_TASKS, INITIAL_MILESTONES, INITIAL_TECH_STACK } from '../data/curriculum.data';
import { MongoAtlasService, RoadmapStatePayload } from './mongo-atlas.service';

@Injectable({
  providedIn: 'root'
})
export class CurriculumService {
  private readonly atlas = inject(MongoAtlasService);

  // Curriculum Sprint Constants (Nov 11, 2026 - Dec 15, 2026 = 35 Days)
  static readonly SPRINT_START_UTC = Date.UTC(2026, 10, 11); // Month 10 = November 11
  static readonly SPRINT_END_UTC = Date.UTC(2026, 11, 15);   // Month 11 = December 15 (35 Days)

  // MongoDB Atlas Connection & Sync Signals
  readonly syncStatus = this.atlas.syncStatus;
  readonly lastSyncedAt = this.atlas.lastSyncedAt;
  readonly syncError = this.atlas.syncError;
  readonly isLoadedFromAtlas = signal<boolean>(false);

  // Signals for state (seeded from initial data, replaced as soon as Atlas responds)
  readonly dailyTasks = signal<DailyTask[]>(INITIAL_DAILY_TASKS);
  readonly milestones = signal<WeeklyMilestone[]>(INITIAL_MILESTONES);
  readonly techStack = signal<TechSkill[]>(INITIAL_TECH_STACK);

  // Calendar pacing & date simulation signals
  readonly liveNow = signal<Date>(new Date());
  readonly simulationDate = signal<string | null>(null);

  // Effective date (simulated date if active, otherwise live current date)
  readonly effectiveDate = computed<Date>(() => {
    const sim = this.simulationDate();
    if (sim) {
      const parts = sim.split('-').map(Number);
      if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
        return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 12, 0, 0));
      }
    }
    return this.liveNow();
  });

  // Filters & UI state
  readonly activeTab = signal<'dashboard' | 'daily' | 'milestones' | 'skills'>('dashboard');
  readonly selectedDay = signal<DailyTask | null>(INITIAL_DAILY_TASKS[0] || null);
  readonly filterWeek = signal<number | 'all'>('all');
  readonly filterGroup = signal<TopicGroup | 'all'>('all');
  readonly filterStatus = signal<string>('all');
  readonly searchQuery = signal<string>('');

  setFilterWeek(week: number | 'all' | string) {
    if (week === 'all' || week === '' || week === null || week === undefined) {
      this.filterWeek.set('all');
    } else {
      const parsed = typeof week === 'string' ? parseInt(week, 10) : week;
      this.filterWeek.set(isNaN(parsed) ? 'all' : parsed);
    }
  }

  private saveTimeout: any = null;
  private lastLocalMutationTime = 0;

  constructor() {
    // 1. Live minute ticker to update calendar date automatically
    if (typeof window !== 'undefined') {
      setInterval(() => {
        this.liveNow.set(new Date());
      }, 60000);
    }
    // 2. Fetch live progress from MongoDB Atlas immediately on startup
    this.initFromAtlas();

    // 3. Auto-save to MongoDB Atlas on state changes once initial load is verified
    effect(() => {
      const tasks = this.dailyTasks();
      const m = this.milestones();
      const t = this.techStack();

      // Guard: do not overwrite Atlas before initial fetch completes
      if (!this.isLoadedFromAtlas()) {
        return;
      }

      this.scheduleAtlasSave({
        dailyTasks: tasks,
        milestones: m,
        techStack: t
      });
    });

    // 4. Auto-refresh when tab/window regains focus to pick up progress from other devices
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', () => {
        this.refreshFromAtlasQuietly();
      });
    }
  }

  private async initFromAtlas() {
    const data = await this.atlas.fetchProgress();
    if (data && data.dailyTasks && Array.isArray(data.dailyTasks) && data.dailyTasks.length > 0) {
      this.dailyTasks.set(this.reconcileDailyTasks(data.dailyTasks));
      if (data.milestones && data.milestones.length > 0) {
        this.milestones.set(this.reconcileMilestones(data.milestones));
      }
      if (data.techStack && data.techStack.length > 0) {
        this.techStack.set(this.reconcileTechStack(data.techStack));
      }
      // Point inspector to current active task
      const active = this.dailyTasks().find(t => t.status !== 'completed') || this.dailyTasks()[0];
      if (active) {
        this.selectedDay.set(active);
      }
    } else {
      // First time Atlas setup: initialize remote database with roadmap data
      await this.atlas.saveProgress({
        dailyTasks: this.dailyTasks(),
        milestones: this.milestones(),
        techStack: this.techStack()
      });
    }
    this.isLoadedFromAtlas.set(true);
  }

  private scheduleAtlasSave(payload: RoadmapStatePayload) {
    this.lastLocalMutationTime = Date.now();
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.atlas.syncStatus.set('saving');
    this.saveTimeout = setTimeout(async () => {
      await this.atlas.saveProgress(payload);
      this.saveTimeout = null;
    }, 600);
  }

  async saveImmediately(customPayload?: RoadmapStatePayload): Promise<boolean> {
    if (!this.isLoadedFromAtlas()) return false;
    this.lastLocalMutationTime = Date.now();
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }
    const payload: RoadmapStatePayload = customPayload || {
      dailyTasks: this.dailyTasks(),
      milestones: this.milestones(),
      techStack: this.techStack()
    };
    return await this.atlas.saveProgress(payload);
  }

  async refreshFromAtlas() {
    const data = await this.atlas.fetchProgress();
    if (data && data.dailyTasks && Array.isArray(data.dailyTasks)) {
      this.dailyTasks.set(this.reconcileDailyTasks(data.dailyTasks));
      if (data.milestones && Array.isArray(data.milestones)) this.milestones.set(this.reconcileMilestones(data.milestones));
      if (data.techStack && Array.isArray(data.techStack)) this.techStack.set(this.reconcileTechStack(data.techStack));
      if (this.selectedDay()) {
        const found = this.dailyTasks().find(t => t.id === this.selectedDay()!.id);
        if (found) this.selectedDay.set(found);
      }
    }
  }

  private async refreshFromAtlasQuietly() {
    // Guard: never overwrite local state if a save is in progress or state was mutated recently (< 5 seconds)
    if (this.syncStatus() === 'saving' || (Date.now() - this.lastLocalMutationTime) < 5000) {
      return;
    }
    const data = await this.atlas.fetchProgress();
    if ((Date.now() - this.lastLocalMutationTime) < 5000) {
      return;
    }
    if (data && data.dailyTasks && Array.isArray(data.dailyTasks)) {
      this.dailyTasks.set(this.reconcileDailyTasks(data.dailyTasks));
      if (data.milestones && Array.isArray(data.milestones)) this.milestones.set(this.reconcileMilestones(data.milestones));
      if (data.techStack && Array.isArray(data.techStack)) this.techStack.set(this.reconcileTechStack(data.techStack));
    }
  }

  reconcileDailyTasks(loadedTasks: DailyTask[]): DailyTask[] {
    const taskMap = new Map<number, DailyTask>();
    for (const t of loadedTasks) {
      taskMap.set(t.day, t);
    }
    return INITIAL_DAILY_TASKS.map(def => {
      const match = taskMap.get(def.day);
      if (!match) return def;
      let proofs = Array.isArray(match.proofUrls) ? [...match.proofUrls] : [];
      if (proofs.length === 0 && match.evidenceUrl && match.evidenceUrl.trim()) {
        proofs.push({
          id: `proof-${def.id}-legacy`,
          label: 'GitHub Repo',
          url: match.evidenceUrl.trim()
        });
      }
      return {
        ...def,
        status: match.status || def.status,
        studyDone: match.studyDone ?? def.studyDone,
        exerciseDone: match.exerciseDone ?? def.exerciseDone,
        codeSaved: match.codeSaved ?? def.codeSaved,
        reviewDone: match.reviewDone ?? def.reviewDone,
        evidenceUrl: match.evidenceUrl || def.evidenceUrl,
        proofUrls: proofs,
        reflection: match.reflection || def.reflection,
        whatTrippedMeUp: match.whatTrippedMeUp || def.whatTrippedMeUp,
        ahaMoment: match.ahaMoment || def.ahaMoment
      };
    });
  }

  reconcileMilestones(loadedMilestones: WeeklyMilestone[]): WeeklyMilestone[] {
    const map = new Map<number, WeeklyMilestone>();
    for (const m of loadedMilestones) {
      map.set(m.week, m);
    }
    return INITIAL_MILESTONES.map(def => {
      const match = map.get(def.week);
      if (!match) return def;
      return {
        ...def,
        projectShipped: match.projectShipped ?? def.projectShipped,
        projectUrl: match.projectUrl || def.projectUrl,
        liveDemoUrl: match.liveDemoUrl || def.liveDemoUrl,
        videoDemoUrl: match.videoDemoUrl || def.videoDemoUrl,
        reviewComplete: match.reviewComplete ?? def.reviewComplete,
        weeklyReflection: match.weeklyReflection || def.weeklyReflection
      };
    });
  }

  reconcileTechStack(loadedStack: TechSkill[]): TechSkill[] {
    const progressMap = new Map<string, { learned?: boolean; practiced?: boolean; canExplain?: boolean; canUseIndependently?: boolean; notes?: string }>();
    for (const skill of loadedStack) {
      const nameKey = (skill.technology || '').trim().toLowerCase();
      const progress = {
        learned: skill.learned,
        practiced: skill.practiced,
        canExplain: skill.canExplain,
        canUseIndependently: skill.canUseIndependently,
        notes: skill.notes
      };
      if (nameKey) progressMap.set(nameKey, progress);
      if (skill.id) progressMap.set(skill.id, progress);
    }

    return INITIAL_TECH_STACK.map(def => {
      const nameKey = (def.technology || '').trim().toLowerCase();
      const match = progressMap.get(nameKey) || progressMap.get(def.id);
      if (!match) return def;
      return {
        ...def,
        learned: match.learned ?? def.learned,
        practiced: match.practiced ?? def.practiced,
        canExplain: match.canExplain ?? def.canExplain,
        canUseIndependently: match.canUseIndependently ?? def.canUseIndependently,
        notes: match.notes ?? def.notes
      };
    });
  }

  // Computed progress metrics
  readonly totalDays = computed<number>(() => this.dailyTasks().length || 35);
  readonly completedDaysCount = computed<number>(() => this.dailyTasks().filter(t => t.status === 'completed').length);
  readonly inProgressCount = computed<number>(() => this.dailyTasks().filter(t => t.status === 'in_progress').length);
  readonly blockedCount = computed<number>(() => this.dailyTasks().filter(t => t.status === 'blocked').length);
  readonly percentComplete = computed<number>(() => {
    const total = this.totalDays();
    if (!total) return 0;
    return Math.round((this.completedDaysCount() / total) * 100);
  });
  readonly daysRemaining = computed<number>(() => Math.max(0, this.totalDays() - this.completedDaysCount()));
  readonly shippedProjectsCount = computed<number>(() => this.milestones().filter(m => m.projectShipped).length);

  // Active / current day pointer
  readonly currentActiveDay = computed<DailyTask | undefined>(() => {
    return this.dailyTasks().find(t => t.status === 'in_progress') ||
           this.dailyTasks().find(t => t.status === 'not_started') ||
           this.dailyTasks()[0];
  });

  // Calendar Pacing Engine
  readonly calendarPacing = computed<CalendarPacingSummary>(() => {
    const eff = this.effectiveDate();
    const tasks = this.dailyTasks();
    const completedCount = tasks.filter(t => t.status === 'completed').length;
    const isSimulationActive = this.simulationDate() !== null;

    const startUtc = CurriculumService.SPRINT_START_UTC;
    const endUtc = CurriculumService.SPRINT_END_UTC;
    const MS_PER_DAY = 86400000;

    const effUtc = Date.UTC(eff.getFullYear(), eff.getMonth(), eff.getDate());
    const diffDays = Math.floor((effUtc - startUtc) / MS_PER_DAY);

    const currentDateFormatted = eff.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    // 1. Pre-Sprint Phase (before November 11, 2026)
    if (diffDays < 0) {
      const daysUntil = Math.abs(diffDays);
      return {
        currentCalendarDate: eff,
        currentDateFormatted,
        sprintStartDate: new Date(startUtc),
        sprintEndDate: new Date(endUtc),
        isPreSprint: true,
        isSprintFinished: false,
        daysUntilSprint: daysUntil,
        expectedDayNumber: 0,
        expectedDateFormatted: 'Starts Nov 11, 2026',
        actualCompletedDays: completedCount,
        paceDelta: 0,
        paceStatus: 'pre_sprint',
        paceMessage: daysUntil === 1 ? 'Sprint starts tomorrow!' : `Sprint starts in ${daysUntil} days`,
        overdueTasks: [],
        overdueCount: 0,
        todayTask: tasks[0] || null,
        isTodayCompleted: false,
        isTodayUntracked: false,
        isSimulationActive
      };
    }

    // 2. Post-Sprint Phase (after December 15, 2026)
    if (effUtc > endUtc) {
      const overdue = tasks.filter(t => t.status !== 'completed');
      const isComplete = overdue.length === 0;
      return {
        currentCalendarDate: eff,
        currentDateFormatted,
        sprintStartDate: new Date(startUtc),
        sprintEndDate: new Date(endUtc),
        isPreSprint: false,
        isSprintFinished: true,
        daysUntilSprint: 0,
        expectedDayNumber: 35,
        expectedDateFormatted: 'December 15, 2026',
        actualCompletedDays: completedCount,
        paceDelta: completedCount - (tasks.length || 35),
        paceStatus: isComplete ? 'completed' : 'critical',
        paceMessage: isComplete ? 'Curriculum Complete! 35/35 Days Shipped' : `Sprint Ended: ${overdue.length} untracked days`,
        overdueTasks: overdue,
        overdueCount: overdue.length,
        todayTask: tasks[tasks.length - 1] || null,
        isTodayCompleted: isComplete,
        isTodayUntracked: overdue.length > 0,
        isSimulationActive
      };
    }

    // 3. Active Sprint (Nov 11, 2026 - Dec 15, 2026 = 35 Days)
    const totalDays = tasks.length || 35;
    const expectedDay = Math.min(totalDays, Math.max(1, Math.floor((effUtc - startUtc) / MS_PER_DAY) + 1));

    const todayTask = tasks.find(t => t.day === expectedDay) || null;
    const isTodayCompleted = todayTask ? todayTask.status === 'completed' : false;
    const isTodayUntracked = todayTask ? todayTask.status === 'not_started' : false;

    // Overdue tasks: any task scheduled before today's target that is not yet completed
    const overdue = tasks.filter(t => t.day < expectedDay && t.status !== 'completed');
    const paceDelta = completedCount - expectedDay;

    let paceStatus: PaceStatus = 'on_track';
    let paceMessage = '';

    if (completedCount >= (tasks.length || 35)) {
      paceStatus = 'completed';
      paceMessage = 'All 35 Days Completed!';
    } else if (paceDelta > 0) {
      paceStatus = 'ahead';
      paceMessage = `+${paceDelta} Day${paceDelta > 1 ? 's' : ''} Ahead of Timetable`;
    } else if (paceDelta === 0) {
      paceStatus = 'on_track';
      paceMessage = `On Schedule (Target: Day ${expectedDay})`;
    } else if (paceDelta >= -2) {
      paceStatus = 'behind';
      paceMessage = `${Math.abs(paceDelta)} Day${Math.abs(paceDelta) > 1 ? 's' : ''} Behind Timetable`;
    } else {
      paceStatus = 'critical';
      paceMessage = `Critical: ${Math.abs(paceDelta)} Days Behind Timetable`;
    }

    const expectedDateFormatted = todayTask?.date || `Day ${expectedDay}`;

    return {
      currentCalendarDate: eff,
      currentDateFormatted,
      sprintStartDate: new Date(startUtc),
      sprintEndDate: new Date(endUtc),
      isPreSprint: false,
      isSprintFinished: false,
      daysUntilSprint: 0,
      expectedDayNumber: expectedDay,
      expectedDateFormatted,
      actualCompletedDays: completedCount,
      paceDelta,
      paceStatus,
      paceMessage,
      overdueTasks: overdue,
      overdueCount: overdue.length,
      todayTask,
      isTodayCompleted,
      isTodayUntracked,
      isSimulationActive
    };
  });

  readonly isBehindSchedule = computed<boolean>(() => {
    const p = this.calendarPacing();
    return p.paceStatus === 'behind' || p.paceStatus === 'critical' || p.overdueCount > 0;
  });

  readonly overdueCount = computed<number>(() => this.calendarPacing().overdueCount);

  readonly filteredTasks = computed(() => {
    let list = this.dailyTasks();
    const week = this.filterWeek();
    const group = this.filterGroup();
    const status = this.filterStatus();
    const query = this.searchQuery().toLowerCase().trim();

    if (week !== 'all') {
      const targetWeek = typeof week === 'string' ? parseInt(week, 10) : week;
      list = list.filter(t => t.week === targetWeek);
    }
    if (group !== 'all') {
      list = list.filter(t => t.topicGroup === group);
    }
    if (status === 'overdue') {
      list = list.filter(t => this.isTaskOverdue(t));
    } else if (status !== 'all') {
      list = list.filter(t => t.status === status);
    }
    if (query) {
      list = list.filter(t =>
        t.task.toLowerCase().includes(query) ||
        t.topic.toLowerCase().includes(query) ||
        t.handsOnExercise.toLowerCase().includes(query)
      );
    }

    return list;
  });

  readonly categoryProgress = computed(() => {
    const categories: Record<string, { total: number; learned: number; practiced: number }> = {};
    for (const item of this.techStack()) {
      if (!categories[item.category]) {
        categories[item.category] = { total: 0, learned: 0, practiced: 0 };
      }
      categories[item.category].total += 1;
      if (item.learned) categories[item.category].learned += 1;
      if (item.practiced) categories[item.category].practiced += 1;
    }
    return Object.entries(categories).map(([category, stats]) => ({
      category,
      total: stats.total,
      learned: stats.learned,
      percent: Math.round((stats.learned / stats.total) * 100)
    }));
  });

  readonly techStackMetrics = computed(() => {
    const list = this.techStack();
    const total = list.length || 12;
    const learned = list.filter(s => s.learned).length;
    const practiced = list.filter(s => s.practiced).length;
    const canExplain = list.filter(s => s.canExplain).length;
    const canUseIndependently = list.filter(s => s.canUseIndependently).length;
    return {
      total,
      learned,
      practiced,
      canExplain,
      canUseIndependently,
      learnedPct: Math.round((learned / total) * 100),
      practicedPct: Math.round((practiced / total) * 100),
      canExplainPct: Math.round((canExplain / total) * 100),
      independentPct: Math.round((canUseIndependently / total) * 100)
    };
  });

  // State mutation methods
  selectDay(task: DailyTask) {
    this.selectedDay.set(task);
  }

  // Calendar pacing & simulation actions
  setSimulationDate(isoDate: string | null) {
    this.simulationDate.set(isoDate);
  }

  clearSimulation() {
    this.simulationDate.set(null);
  }

  isTaskOverdue(task: DailyTask): boolean {
    const pacing = this.calendarPacing();
    if (pacing.isPreSprint) return false;
    if (task.status === 'completed') return false;
    if (pacing.isSprintFinished) return true;
    return task.day < pacing.expectedDayNumber;
  }

  isTaskToday(task: DailyTask): boolean {
    const pacing = this.calendarPacing();
    if (pacing.isPreSprint || pacing.isSprintFinished) return false;
    return task.day === pacing.expectedDayNumber;
  }

  toggleTaskCheckbox(dayId: string, field: 'studyDone' | 'exerciseDone' | 'codeSaved' | 'reviewDone') {
    this.dailyTasks.update(tasks =>
      tasks.map(t => {
        if (t.id === dayId) {
          const updated = { ...t, [field]: !t[field] };
          if (updated.studyDone && updated.exerciseDone && updated.codeSaved && updated.reviewDone) {
            updated.status = 'completed';
          } else if (updated.status === 'completed') {
            updated.status = 'in_progress';
          }
          if (this.selectedDay()?.id === dayId) {
            this.selectedDay.set(updated);
          }
          return updated;
        }
        return t;
      })
    );
  }

  updateTaskStatus(dayId: string, status: TaskStatus) {
    this.dailyTasks.update(tasks =>
      tasks.map(t => {
        if (t.id === dayId) {
          const updated = { ...t, status };
          if (status === 'completed') {
            updated.studyDone = true;
            updated.exerciseDone = true;
            updated.codeSaved = true;
            updated.reviewDone = true;
          }
          if (this.selectedDay()?.id === dayId) {
            this.selectedDay.set(updated);
          }
          return updated;
        }
        return t;
      })
    );
  }

  updateTaskEvidence(dayId: string, url: string) {
    this.dailyTasks.update(tasks =>
      tasks.map(t => {
        if (t.id === dayId) {
          const updated = { ...t, evidenceUrl: url };
          if (this.selectedDay()?.id === dayId) {
            this.selectedDay.set(updated);
          }
          return updated;
        }
        return t;
      })
    );
  }

  addProofUrl(dayId: string, label: ProofLabel, url: string) {
    if (!url || !url.trim()) return;
    const cleanUrl = url.trim();
    const item: ProofUrlItem = {
      id: `proof-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      label,
      url: cleanUrl
    };
    this.dailyTasks.update(tasks =>
      tasks.map(t => {
        if (t.id === dayId) {
          const currentList = t.proofUrls || [];
          const updated = {
            ...t,
            proofUrls: [...currentList, item],
            evidenceUrl: t.evidenceUrl || cleanUrl
          };
          if (this.selectedDay()?.id === dayId) {
            this.selectedDay.set(updated);
          }
          return updated;
        }
        return t;
      })
    );
  }

  removeProofUrl(dayId: string, proofId: string) {
    this.dailyTasks.update(tasks =>
      tasks.map(t => {
        if (t.id === dayId) {
          const currentList = t.proofUrls || [];
          const updatedList = currentList.filter(p => p.id !== proofId && p.url !== proofId);
          const updated = {
            ...t,
            proofUrls: updatedList,
            evidenceUrl: updatedList.length > 0 ? updatedList[0].url : ''
          };
          if (this.selectedDay()?.id === dayId) {
            this.selectedDay.set(updated);
          }
          return updated;
        }
        return t;
      })
    );
  }

  updateTaskReflection(dayId: string, reflection: string) {
    this.dailyTasks.update(tasks =>
      tasks.map(t => {
        if (t.id === dayId) {
          const updated = { ...t, reflection };
          if (this.selectedDay()?.id === dayId) {
            this.selectedDay.set(updated);
          }
          return updated;
        }
        return t;
      })
    );
  }

  updateTaskTrippedUp(dayId: string, whatTrippedMeUp: string) {
    this.dailyTasks.update(tasks =>
      tasks.map(t => {
        if (t.id === dayId) {
          const updated = { ...t, whatTrippedMeUp };
          if (this.selectedDay()?.id === dayId) {
            this.selectedDay.set(updated);
          }
          return updated;
        }
        return t;
      })
    );
  }

  updateTaskAhaMoment(dayId: string, ahaMoment: string) {
    this.dailyTasks.update(tasks =>
      tasks.map(t => {
        if (t.id === dayId) {
          const updated = { ...t, ahaMoment };
          if (this.selectedDay()?.id === dayId) {
            this.selectedDay.set(updated);
          }
          return updated;
        }
        return t;
      })
    );
  }

  toggleMilestoneShipped(week: number) {
    this.milestones.update(list =>
      list.map(m => (m.week === week ? { ...m, projectShipped: !m.projectShipped } : m))
    );
  }

  toggleMilestoneReviewComplete(week: number) {
    this.milestones.update(list =>
      list.map(m => (m.week === week ? { ...m, reviewComplete: !m.reviewComplete } : m))
    );
  }

  updateMilestoneProjectUrl(week: number, url: string) {
    this.milestones.update(list =>
      list.map(m => (m.week === week ? { ...m, projectUrl: url } : m))
    );
  }

  updateMilestoneReflection(week: number, field: 'wins' | 'evidence' | 'gaps' | 'nextAdjustment', value: string) {
    this.milestones.update(list =>
      list.map(m => {
        if (m.week === week) {
          const reflection = m.weeklyReflection || {
            wins: '',
            evidence: '',
            gaps: '',
            projectStatus: 'In progress',
            nextAdjustment: ''
          };
          return {
            ...m,
            weeklyReflection: {
              ...reflection,
              [field]: value
            }
          };
        }
        return m;
      })
    );
  }

  toggleSkillCheckbox(skillId: string, field: 'learned' | 'practiced' | 'canExplain' | 'canUseIndependently') {
    this.techStack.update(list =>
      list.map(s => (s.id === skillId ? { ...s, [field]: !s[field] } : s))
    );
  }

  async resetAll() {
    if (confirm('Are you sure you want to reset all progress in MongoDB Atlas back to initial default state?')) {
      this.dailyTasks.set(INITIAL_DAILY_TASKS);
      this.milestones.set(INITIAL_MILESTONES);
      this.techStack.set(INITIAL_TECH_STACK);
      this.selectedDay.set(INITIAL_DAILY_TASKS[0]);
      await this.atlas.resetAtlas();
      await this.atlas.saveProgress({
        dailyTasks: INITIAL_DAILY_TASKS,
        milestones: INITIAL_MILESTONES,
        techStack: INITIAL_TECH_STACK
      });
    }
  }

  exportFullJson(): string {
    return JSON.stringify({
      version: '1.0',
      exportedAt: new Date().toISOString(),
      dailyTasks: this.dailyTasks(),
      milestones: this.milestones(),
      techStack: this.techStack()
    }, null, 2);
  }

  async importFullJson(jsonStr: string) {
    try {
      const data = JSON.parse(jsonStr);
      if (data.dailyTasks) this.dailyTasks.set(data.dailyTasks);
      if (data.milestones) this.milestones.set(data.milestones);
      if (data.techStack) this.techStack.set(this.reconcileTechStack(data.techStack));
      if (this.dailyTasks().length > 0) this.selectedDay.set(this.dailyTasks()[0]);
      await this.atlas.saveProgress({
        dailyTasks: this.dailyTasks(),
        milestones: this.milestones(),
        techStack: this.techStack()
      });
      alert('Successfully imported roadmap progress and synced to MongoDB Atlas!');
    } catch (e) {
      alert('Invalid JSON file format.');
    }
  }
}
