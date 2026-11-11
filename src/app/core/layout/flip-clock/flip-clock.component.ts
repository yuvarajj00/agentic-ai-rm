import {
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  NgZone,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { FlipUnitComponent } from './flip-unit.component';
import {
  FLIP_CLOCK_THEMES,
  FlipClockTheme,
  FlipClockThemeId
} from './flip-clock.themes';

const CLOCK_THEME_STORAGE_KEY = 'agentic_ai_clock_theme';
const CLOCK_SIDEBAR_STORAGE_KEY = 'agentic_ai_clock_sidebar_expanded';

@Component({
  selector: 'app-flip-clock',
  standalone: true,
  imports: [CommonModule, FlipUnitComponent],
  templateUrl: './flip-clock.component.html',
  styleUrl: './flip-clock.component.css'
})
export class FlipClockComponent implements OnInit {
  private readonly ngZone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private timerId: ReturnType<typeof setTimeout> | null = null;

  @ViewChild('themeDropdownWrapper') themeDropdownWrapper?: ElementRef<HTMLElement>;

  readonly themes = FLIP_CLOCK_THEMES;
  readonly selectedThemeId = signal<FlipClockThemeId>(this.loadSavedTheme());
  readonly selectedTheme = computed<FlipClockTheme>(
    () => this.themes.find((t) => t.id === this.selectedThemeId()) ?? this.themes[0]
  );

  readonly isDropdownOpen = signal(false);
  readonly isSidebarExpanded = signal<boolean>(this.loadSavedSidebarExpanded());
  readonly use24Hour = signal(true);
  readonly showSeconds = signal(true);
  readonly dividerMode = signal<0 | 1 | 2>(0); // 0 = NONE, 1 = DOTS, 2 = LINE
  readonly gapPx = signal(24);
  readonly scalePct = signal(100);
  readonly manualFlipCount = signal(0);
  readonly isFullscreen = signal(false);

  readonly now = signal(new Date());

  readonly hoursStr = computed(() => {
    let h = this.now().getHours();
    if (!this.use24Hour()) {
      h = h % 12 || 12;
    }
    return String(h).padStart(2, '0');
  });

  readonly minutesStr = computed(() => String(this.now().getMinutes()).padStart(2, '0'));
  readonly secondsStr = computed(() => String(this.now().getSeconds()).padStart(2, '0'));
  readonly period = computed(() => (this.now().getHours() >= 12 ? 'PM' : 'AM'));

  readonly dividerLabel = computed(() => {
    const mode = this.dividerMode();
    if (mode === 1) return 'DOTS';
    if (mode === 2) return 'LINE';
    return 'NONE';
  });

  readonly scaleFactor = computed(() => this.scalePct() / 100);

  readonly dateFormatted = computed(() => {
    const d = this.now();
    const dayName = d.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dayName} \u2022 ${dd} / ${mm} / ${yyyy}`;
  });

  ngOnInit(): void {
    this.syncFullscreenState();

    // Run timeout chain outside Angular zone and re-enter strictly on second boundaries.
    this.ngZone.runOutsideAngular(() => {
      this.scheduleNextTick();
    });

    this.destroyRef.onDestroy(() => {
      if (this.timerId !== null) {
        clearTimeout(this.timerId);
        this.timerId = null;
      }
    });
  }

  private scheduleNextTick(): void {
    const nowMs = Date.now();
    // Aim +20ms past the UTC second boundary so getSeconds() has cleanly rolled over.
    const delayMs = 1020 - (nowMs % 1000);
    this.timerId = setTimeout(() => {
      this.ngZone.run(() => {
        this.now.set(new Date());
      });
      this.scheduleNextTick();
    }, delayMs);
  }

  private readStorage(key: string): string | null {
    try {
      if (typeof localStorage === 'undefined' || typeof localStorage.getItem !== 'function') {
        return null;
      }
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private writeStorage(key: string, value: string): void {
    try {
      if (typeof localStorage === 'undefined' || typeof localStorage.setItem !== 'function') {
        return;
      }
      localStorage.setItem(key, value);
    } catch {
      // Ignore storage failures in restricted contexts
    }
  }

  private loadSavedTheme(): FlipClockThemeId {
    const saved = this.readStorage(CLOCK_THEME_STORAGE_KEY);
    if (saved && this.themes.some((t) => t.id === saved)) {
      return saved as FlipClockThemeId;
    }
    return 'fliqlo';
  }

  private saveTheme(themeId: FlipClockThemeId): void {
    this.writeStorage(CLOCK_THEME_STORAGE_KEY, themeId);
  }

  private loadSavedSidebarExpanded(): boolean {
    return this.readStorage(CLOCK_SIDEBAR_STORAGE_KEY) === 'true';
  }

  toggleSidebar(): void {
    this.isSidebarExpanded.update((v) => {
      const next = !v;
      this.writeStorage(CLOCK_SIDEBAR_STORAGE_KEY, String(next));
      return next;
    });
  }

  expandSidebar(): void {
    if (!this.isSidebarExpanded()) {
      this.isSidebarExpanded.set(true);
      this.writeStorage(CLOCK_SIDEBAR_STORAGE_KEY, 'true');
    }
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.isDropdownOpen.update((v) => !v);
  }

  selectTheme(themeId: FlipClockThemeId): void {
    this.selectedThemeId.set(themeId);
    this.saveTheme(themeId);
    this.isDropdownOpen.set(false);
    this.triggerManualFlip();
  }

  stepTheme(delta: number): void {
    const currentIdx = this.themes.findIndex((t) => t.id === this.selectedThemeId());
    const nextIdx = (currentIdx + delta + this.themes.length) % this.themes.length;
    this.selectTheme(this.themes[nextIdx].id);
  }

  toggle24Hour(): void {
    this.use24Hour.update((v) => !v);
    this.triggerManualFlip();
  }

  toggleSeconds(): void {
    this.showSeconds.update((v) => !v);
  }

  cycleDivider(): void {
    this.dividerMode.update((mode) => ((mode + 1) % 3) as 0 | 1 | 2);
  }

  triggerManualFlip(): void {
    this.manualFlipCount.update((c) => c + 1);
  }

  onGapChange(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    if (!Number.isNaN(val)) {
      this.gapPx.set(val);
    }
  }

  onScaleChange(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    if (!Number.isNaN(val)) {
      this.scalePct.set(val);
    }
  }

  toggleFullscreen(): void {
    const doc = document;
    if (!doc.fullscreenElement) {
      doc.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      doc.exitFullscreen?.().catch(() => {});
    }
  }

  @HostListener('document:fullscreenchange')
  syncFullscreenState(): void {
    this.isFullscreen.set(Boolean(document.fullscreenElement));
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isDropdownOpen()) {
      return;
    }
    const wrapper = this.themeDropdownWrapper?.nativeElement;
    if (wrapper && !wrapper.contains(event.target as Node)) {
      this.isDropdownOpen.set(false);
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    const tag = (event.target as HTMLElement | null)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
      return;
    }

    if (event.key === 'Escape') {
      if (this.isDropdownOpen()) {
        this.isDropdownOpen.set(false);
        return;
      }
      this.goBack();
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.stepTheme(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.stepTheme(-1);
    } else if (event.key.toLowerCase() === 'f') {
      this.toggleFullscreen();
    }
  }

  goBack(): void {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      this.location.back();
      return;
    }
    this.router.navigateByUrl('/dashboard');
  }
}
