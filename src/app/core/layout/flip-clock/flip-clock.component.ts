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
import { HorologyBulbComponent } from './horology-bulb.component';
import { WorldHorologyComponent } from './world-horology.component';
import {
  FLIP_CLOCK_THEMES,
  FlipClockTheme,
  FlipClockThemeId,
  HorologyThemeId,
  PRISM_NIXIE_BULB_PALETTE
} from './flip-clock.themes';

const CLOCK_THEME_STORAGE_KEY = 'agentic_ai_clock_theme';
const CLOCK_SIDEBAR_STORAGE_KEY = 'agentic_ai_clock_sidebar_expanded';

export type GamutMode = 'theme' | 'orange' | 'custom' | 'rainbow' | 'breathing' | 'river';
export type BulbDateMode = 'sub' | 'full_date' | 'alternate';

export interface HorologyBulbViewModel {
  value: string;
  label: string;
  subText: string;
  glowColor: string;
  secondaryGlow: string;
}

const RAINBOW_PALETTE: readonly string[] = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#a855f7'
];

@Component({
  selector: 'app-flip-clock',
  standalone: true,
  imports: [CommonModule, FlipUnitComponent, HorologyBulbComponent, WorldHorologyComponent],
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
  readonly themeGroups: readonly { title: string; items: readonly FlipClockTheme[] }[] = [
    {
      title: 'Split-Flap Studio (01–20)',
      items: this.themes.filter((t) => t.kind === 'split-flap')
    },
    {
      title: 'Kinetic Timepiece Bulbs (21–42)',
      items: this.themes.filter((t) => t.kind === 'horology')
    },
    {
      title: 'World Horology Museum (43–72)',
      items: this.themes.filter((t) => t.kind === 'world-museum')
    }
  ];

  readonly selectedThemeId = signal<FlipClockThemeId>(this.loadSavedTheme());
  readonly selectedTheme = computed<FlipClockTheme>(
    () => this.themes.find((t) => t.id === this.selectedThemeId()) ?? this.themes[0]
  );
  readonly isHorology = computed(() => this.selectedTheme().kind === 'horology');
  readonly isWorldMuseum = computed(() => this.selectedTheme().kind === 'world-museum');

  readonly isDropdownOpen = signal(false);
  readonly isSidebarExpanded = signal<boolean>(this.loadSavedSidebarExpanded());
  readonly use24Hour = signal(true);
  readonly showSeconds = signal(true);
  readonly dividerMode = signal<0 | 1 | 2>(0); // 0 = NONE, 1 = DOTS, 2 = LINE
  readonly gapPx = signal(24);
  readonly scalePct = signal(100);
  readonly manualFlipCount = signal(0);
  readonly isFullscreen = signal(false);

  // Horology Bulb Lab controls (themes 21-42)
  readonly sixBulbMode = signal(true);
  readonly bulbDateMode = signal<BulbDateMode>('sub');
  readonly showGlassDome = signal(true);
  readonly gamutMode = signal<GamutMode>('theme');
  readonly riverTick = signal(0);

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

  readonly arrayModeLabel = computed(() => (this.sixBulbMode() ? '6-BULB' : '3-TWIN'));

  readonly bulbDateModeLabel = computed(() => {
    const mode = this.bulbDateMode();
    if (mode === 'full_date') return 'DATE';
    if (mode === 'alternate') return 'ALT';
    return 'SUB';
  });

  readonly gamutLabel = computed(() => this.gamutMode().toUpperCase());

  readonly scaleFactor = computed(() => this.scalePct() / 100);
  readonly horologyGapPx = computed(() => Math.max(6, Math.round(this.gapPx() * 0.58)));

  readonly dateFormatted = computed(() => {
    const d = this.now();
    const dayName = d.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dayName} \u2022 ${dd} / ${mm} / ${yyyy}`;
  });

  readonly horologyThemeId = computed<HorologyThemeId>(() => {
    const t = this.selectedTheme();
    return t.kind === 'horology' ? (t.id as HorologyThemeId) : 'prismnixie';
  });

  readonly horologyBulbs = computed<readonly HorologyBulbViewModel[]>(() => {
    const theme = this.selectedTheme();
    const spec = theme.horology;
    if (!spec) {
      return [];
    }

    const d = this.now();
    const sec = d.getSeconds();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = String(d.getFullYear());
    const yy = yyyy.slice(-2);
    const weekday = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const mon = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();

    const dateMode = this.bulbDateMode();
    const showDateInBulbs =
      dateMode === 'full_date' || (dateMode === 'alternate' && Math.floor(sec / 5) % 2 === 1);

    const hours = this.hoursStr();
    const minutes = this.minutesStr();
    const seconds = this.secondsStr();

    let rawEntries: { value: string; label: string; subText: string }[];
    if (this.sixBulbMode()) {
      rawEntries = showDateInBulbs
        ? [
            { value: dd[0], label: 'D', subText: '' },
            { value: dd[1], label: 'D', subText: '' },
            { value: mm[0], label: 'M', subText: '' },
            { value: mm[1], label: 'M', subText: '' },
            { value: yy[0], label: 'Y', subText: '' },
            { value: yy[1], label: 'Y', subText: '' }
          ]
        : [
            { value: hours[0], label: 'H', subText: weekday },
            { value: hours[1], label: 'H', subText: '' },
            { value: minutes[0], label: 'M', subText: dd },
            { value: minutes[1], label: 'M', subText: mon },
            { value: seconds[0], label: 'S', subText: '' },
            { value: seconds[1], label: 'S', subText: yy }
          ];
    } else {
      rawEntries = showDateInBulbs
        ? [
            { value: dd, label: 'DAY', subText: '' },
            { value: mm, label: 'MON', subText: '' },
            { value: yy, label: 'YR', subText: '' }
          ]
        : [
            { value: hours, label: this.use24Hour() ? 'HRS' : this.period(), subText: weekday },
            { value: minutes, label: 'MIN', subText: `${dd} ${mon}` },
            { value: seconds, label: 'SEC', subText: yyyy }
          ];
    }

    return rawEntries.map((entry, idx) => {
      const { glowColor, secondaryGlow } = this.resolveBulbColors(idx, theme, sec);
      return {
        ...entry,
        glowColor,
        secondaryGlow
      };
    });
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

  private resolveBulbColors(
    index: number,
    theme: FlipClockTheme,
    sec: number
  ): { glowColor: string; secondaryGlow: string } {
    const mode = this.gamutMode();
    const spec = theme.horology!;
    const tick = this.riverTick();

    if (mode === 'orange') {
      return { glowColor: '#ff7b00', secondaryGlow: '#ea580c' };
    }
    if (mode === 'custom') {
      return { glowColor: '#00f5d4', secondaryGlow: '#38bdf8' };
    }
    if (mode === 'rainbow') {
      const col = RAINBOW_PALETTE[index % RAINBOW_PALETTE.length];
      return { glowColor: col, secondaryGlow: col };
    }
    if (mode === 'breathing') {
      const hue = (sec * 6) % 360;
      const col = `hsl(${hue}, 92%, 62%)`;
      return { glowColor: col, secondaryGlow: spec.secondaryGlow };
    }
    if (mode === 'river') {
      const col = RAINBOW_PALETTE[(index + tick) % RAINBOW_PALETTE.length];
      return { glowColor: col, secondaryGlow: col };
    }
    if (theme.id === 'prismnixie') {
      const col = PRISM_NIXIE_BULB_PALETTE[index % PRISM_NIXIE_BULB_PALETTE.length];
      return { glowColor: col, secondaryGlow: spec.secondaryGlow };
    }
    return { glowColor: spec.defaultGlow, secondaryGlow: spec.secondaryGlow };
  }

  private scheduleNextTick(): void {
    const nowMs = Date.now();
    // Aim +20ms past the UTC second boundary so getSeconds() has cleanly rolled over.
    const delayMs = 1020 - (nowMs % 1000);
    this.timerId = setTimeout(() => {
      this.ngZone.run(() => {
        this.now.set(new Date());
        this.riverTick.update((t) => t + 1);
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

  toggleArrayMode(): void {
    this.sixBulbMode.update((v) => !v);
    this.triggerManualFlip();
  }

  cycleBulbDateMode(): void {
    const order: readonly BulbDateMode[] = ['sub', 'full_date', 'alternate'];
    this.bulbDateMode.update((cur) => order[(order.indexOf(cur) + 1) % order.length]);
    this.triggerManualFlip();
  }

  toggleGlassDome(): void {
    this.showGlassDome.update((v) => !v);
  }

  cycleGamutMode(): void {
    const order: readonly GamutMode[] = ['theme', 'orange', 'custom', 'rainbow', 'breathing', 'river'];
    this.gamutMode.update((cur) => order[(order.indexOf(cur) + 1) % order.length]);
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
