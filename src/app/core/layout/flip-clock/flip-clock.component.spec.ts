import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Location } from '@angular/common';
import { vi } from 'vitest';
import { FlipClockComponent } from './flip-clock.component';
import { FlipUnitComponent } from './flip-unit.component';
import { HorologyBulbComponent } from './horology-bulb.component';
import { FLIP_CLOCK_THEMES } from './flip-clock.themes';

describe('FlipUnitComponent', () => {
  let component: FlipUnitComponent;
  let fixture: ComponentFixture<FlipUnitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlipUnitComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FlipUnitComponent);
    component = fixture.componentInstance;
  });

  it('transitions from 18 -> 19 -> 20 with aligned static and animated halves', () => {
    component.value = '18';
    fixture.detectChanges();
    expect(component.flipTick()).toBe(0);

    component.value = '19';
    fixture.detectChanges();
    const tick1 = component.flipTick();
    expect(tick1).toBe(1);
    expect(component.previous()).toBe('18');
    expect(component.current()).toBe('19');

    const hostEl: HTMLElement = fixture.nativeElement;
    expect(hostEl.querySelector('.flip-housing')?.classList.contains('flip-anim-a')).toBe(true);

    component.value = '20';
    fixture.detectChanges();
    expect(component.flipTick()).toBe(2);
    expect(component.previous()).toBe('19');
    expect(component.current()).toBe('20');
    expect(hostEl.querySelector('.flip-housing')?.classList.contains('flip-anim-b')).toBe(true);

    expect(hostEl.querySelector('.half-top-static .digit-face')?.textContent?.trim()).toBe('20');
    expect(hostEl.querySelector('.half-bottom-static .digit-face')?.textContent?.trim()).toBe('19');
    expect(hostEl.querySelector('.half-top-flip .digit-face')?.textContent?.trim()).toBe('19');
    expect(hostEl.querySelector('.half-bottom-flip .digit-face')?.textContent?.trim()).toBe('20');
  });

  it('applies seconds styling, AM/PM badge, gradient mode, and manual forceFlip replay', () => {
    component.value = '09';
    component.isSeconds = true;
    component.amPmBadge = 'AM';
    component.isGradientText = true;
    fixture.detectChanges();

    const hostEl: HTMLElement = fixture.nativeElement;
    const housing = hostEl.querySelector('.flip-housing');
    expect(housing?.classList.contains('is-seconds')).toBe(true);
    expect(housing?.classList.contains('is-gradient-text')).toBe(true);
    expect(hostEl.querySelector('.ampm-badge')?.textContent?.trim()).toBe('AM');

    component.forceFlipCount = 1;
    fixture.detectChanges();
    expect(component.flipTick()).toBe(1);
    expect(component.previous()).toBe('09');
    expect(component.current()).toBe('09');
  });
});

describe('FlipClockComponent', () => {
  let component: FlipClockComponent;
  let fixture: ComponentFixture<FlipClockComponent>;
  let router: Router;
  let location: Location;
  let storageStore: Map<string, string>;

  beforeEach(async () => {
    storageStore = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storageStore.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storageStore.set(key, String(value));
      },
      removeItem: (key: string) => {
        storageStore.delete(key);
      },
      clear: () => {
        storageStore.clear();
      }
    });

    await TestBed.configureTestingModule({
      imports: [FlipClockComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture = TestBed.createComponent(FlipClockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the plain architectural split-flap clock with 24H default and weekday • DD / MM / YYYY date', () => {
    const fixedDate = new Date(2026, 10, 11, 13, 43, 1); // Wednesday Nov 11, 2026 13:43:01
    component.now.set(fixedDate);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const screen = el.querySelector('.plain-clock-screen');
    expect(screen).toBeTruthy();
    expect(screen?.getAttribute('data-clock-theme')).toBe('fliqlo');

    expect(component.use24Hour()).toBe(true);
    expect(component.hoursStr()).toBe('13');
    expect(component.minutesStr()).toBe('43');
    expect(component.secondsStr()).toBe('01');
    expect(component.dateFormatted()).toBe('WEDNESDAY \u2022 11 / 11 / 2026');
    expect(el.querySelector('.clock-date-readout')?.textContent?.trim()).toBe(
      'WEDNESDAY \u2022 11 / 11 / 2026'
    );
  });

  it('exposes all 72 unique themes (20 split-flap + 22 horology + 30 world museum) in the dropdown with persistence', () => {
    expect(FLIP_CLOCK_THEMES.length).toBe(72);
    expect(new Set(FLIP_CLOCK_THEMES.map((t) => t.id)).size).toBe(72);
    const el: HTMLElement = fixture.nativeElement;
    const trigger = el.querySelector('.theme-dropdown-trigger') as HTMLButtonElement;
    expect(trigger.textContent).toContain('01. Fliqlo Matte');

    trigger.click();
    fixture.detectChanges();

    const options = el.querySelectorAll('.theme-option');
    expect(options.length).toBe(72);
    expect(el.querySelectorAll('.theme-group-label').length).toBe(3);

    // Select 12. Synthwave 84 (index 11)
    (options[11] as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(component.selectedTheme().id).toBe('synthwave');
    expect(el.querySelector('.plain-clock-screen')?.getAttribute('data-clock-theme')).toBe('synthwave');
    expect(localStorage.getItem('agentic_ai_clock_theme')).toBe('synthwave');
    expect(component.isDropdownOpen()).toBe(false);
    expect(el.querySelector('.flip-housing.is-gradient-text')).toBeTruthy();
  });

  it('cycles themes via Left/Right Arrow keys and toggles 12H/24H, Seconds, Dividers, and Sliders', () => {
    const fixedDate = new Date(2026, 10, 11, 14, 5, 9);
    component.now.set(fixedDate);
    fixture.detectChanges();

    // Format toggle: 24H -> 12H reveals AM/PM badge on Hours card
    component.toggle24Hour();
    fixture.detectChanges();
    expect(component.use24Hour()).toBe(false);
    expect(component.hoursStr()).toBe('02');
    expect(component.period()).toBe('PM');
    expect((fixture.nativeElement as HTMLElement).querySelector('.ampm-badge')?.textContent?.trim()).toBe('PM');

    // Divider cycle: NONE -> DOTS -> LINE -> NONE
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelectorAll('.colon-separator').length).toBe(0);
    component.cycleDivider();
    fixture.detectChanges();
    expect(component.dividerLabel()).toBe('DOTS');
    expect(el.querySelectorAll('.colon-separator').length).toBe(2);

    component.cycleDivider();
    fixture.detectChanges();
    expect(component.dividerLabel()).toBe('LINE');
    expect(el.querySelectorAll('.colon-separator.hairline-mode').length).toBe(2);

    // Seconds toggle OFF hides seconds card and second divider
    component.toggleSeconds();
    fixture.detectChanges();
    expect(el.querySelectorAll('app-flip-unit').length).toBe(2);
    expect(el.querySelectorAll('.colon-separator').length).toBe(1);

    // Gap and Scale sliders update stage CSS custom properties
    component.onGapChange({ target: { value: '40' } } as unknown as Event);
    component.onScaleChange({ target: { value: '85' } } as unknown as Event);
    fixture.detectChanges();
    const stage = el.querySelector('.clock-stage') as HTMLElement;
    expect(stage.style.getPropertyValue('--group-gap')).toBe('40px');
    expect(stage.style.getPropertyValue('--scale-factor')).toBe('0.85');

    // ArrowRight steps from fliqlo -> cyber
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    fixture.detectChanges();
    expect(component.selectedTheme().id).toBe('cyber');
  });

  it('closes dropdown on Escape first, then navigates back on next Escape', () => {
    const backSpy = vi.spyOn(location, 'back').mockImplementation(() => {});
    const navSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    const trigger = (fixture.nativeElement as HTMLElement).querySelector(
      '.theme-dropdown-trigger'
    ) as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();
    expect(component.isDropdownOpen()).toBe(true);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(component.isDropdownOpen()).toBe(false);
    expect(backSpy).not.toHaveBeenCalled();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(backSpy.mock.calls.length + navSpy.mock.calls.length).toBe(1);
  });

  it('shows icons only when right sidebar is collapsed and reveals labels and sliders on expand', () => {
    const el: HTMLElement = fixture.nativeElement;
    const sidebar = el.querySelector('.clock-right-sidebar') as HTMLElement;
    expect(sidebar).toBeTruthy();
    expect(component.isSidebarExpanded()).toBe(false);
    expect(sidebar.classList.contains('is-expanded')).toBe(false);

    // Collapsed: icons only, zero text labels, dividers, or sliders rendered
    expect(sidebar.querySelectorAll('.sidebar-icon').length).toBe(7);
    expect(sidebar.querySelectorAll('.sidebar-label').length).toBe(0);
    expect(sidebar.querySelectorAll('.sidebar-slider').length).toBe(0);
    expect(sidebar.querySelectorAll('.sidebar-divider').length).toBe(0);

    // Expand via bottom toggle chevron
    const toggleBtn = sidebar.querySelector('.sidebar-toggle-btn') as HTMLButtonElement;
    toggleBtn.click();
    fixture.detectChanges();

    expect(component.isSidebarExpanded()).toBe(true);
    expect(sidebar.classList.contains('is-expanded')).toBe(true);
    expect(sidebar.querySelectorAll('.sidebar-divider').length).toBe(1);
    expect(localStorage.getItem('agentic_ai_clock_sidebar_expanded')).toBe('true');

    const labels = Array.from(sidebar.querySelectorAll('.sidebar-label')).map((node) =>
      node.textContent?.trim()
    );
    expect(labels).toEqual([
      'Format',
      'Seconds',
      'Divider',
      'Trigger Flip Animation',
      'Card Gap',
      'Scale',
      'Collapse'
    ]);
    expect(sidebar.querySelectorAll('.sidebar-slider').length).toBe(2);

    // Collapse back to icons only
    toggleBtn.click();
    fixture.detectChanges();
    expect(component.isSidebarExpanded()).toBe(false);
    expect(sidebar.querySelectorAll('.sidebar-label').length).toBe(0);

    // Clicking a collapsed slider icon (e.g. Card Gap) expands the sidebar
    const expandSliderBtn = sidebar.querySelector(
      'button[aria-label="Expand sidebar to adjust Card Gap"]'
    ) as HTMLButtonElement;
    expandSliderBtn.click();
    fixture.detectChanges();
    expect(component.isSidebarExpanded()).toBe(true);
    expect(sidebar.querySelectorAll('.sidebar-slider').length).toBe(2);
  });

  it('renders 22 horology timepiece bulb themes with 6-bulb/twin toggle, date modes, glass dome, and gamut controls', () => {
    const fixedDate = new Date(2026, 10, 11, 13, 43, 7); // Wed Nov 11 2026 13:43:07
    component.now.set(fixedDate);

    // Select 21. Acrylic Prism Nixie Bulbs
    component.selectTheme('prismnixie');
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(component.isHorology()).toBe(true);
    expect(el.querySelector('.bulb-array-row')).toBeTruthy();
    expect(el.querySelectorAll('app-horology-bulb').length).toBe(6);
    expect(el.querySelectorAll('app-flip-unit').length).toBe(0);
    expect(el.querySelector('.pedestal-date-plate')?.textContent?.trim()).toBe(
      'WEDNESDAY \u2022 11 / 11 / 2026'
    );

    const bulbDigits = Array.from(el.querySelectorAll('.acrylic-active-digit')).map((n) =>
      n.textContent?.trim()
    );
    expect(bulbDigits).toEqual(['1', '3', '4', '3', '0', '7']);

    // Switch to 3 Twin Pods
    component.toggleArrayMode();
    fixture.detectChanges();
    expect(component.arrayModeLabel()).toBe('3-TWIN');
    expect(el.querySelectorAll('app-horology-bulb').length).toBe(3);

    // Switch Display to DATE mode -> 11 / 11 / 26
    component.cycleBulbDateMode();
    fixture.detectChanges();
    expect(component.bulbDateModeLabel()).toBe('DATE');
    const dateTwinDigits = Array.from(el.querySelectorAll('.acrylic-active-digit')).map((n) =>
      n.textContent?.trim()
    );
    expect(dateTwinDigits).toEqual(['11', '11', '26']);

    // Switch Display to ALT mode at sec=7 -> Math.floor(7 / 5) % 2 === 1 -> shows date; at sec=2 -> shows time
    component.cycleBulbDateMode();
    fixture.detectChanges();
    expect(component.bulbDateModeLabel()).toBe('ALT');
    expect(
      Array.from(el.querySelectorAll('.acrylic-active-digit')).map((n) => n.textContent?.trim())
    ).toEqual(['11', '11', '26']);
    component.now.set(new Date(2026, 10, 11, 13, 43, 2));
    fixture.detectChanges();
    expect(
      Array.from(el.querySelectorAll('.acrylic-active-digit')).map((n) => n.textContent?.trim())
    ).toEqual(['13', '43', '02']);

    // Toggle Glass Dome OFF & Cycle Gamut -> ORANGE
    component.toggleGlassDome();
    component.cycleGamutMode();
    fixture.detectChanges();
    expect(component.showGlassDome()).toBe(false);
    expect(el.querySelectorAll('.glass-specular-overlay').length).toBe(0);
    expect(el.querySelector('.glass-bell-jar')?.classList.contains('no-glass')).toBe(true);
    expect(component.gamutLabel()).toBe('ORANGE');

    // Switch back to Twin OFF (6-bulb) and check belljarflip, flipdot, edison engines
    component.toggleArrayMode();
    component.selectTheme('belljarflip');
    fixture.detectChanges();
    expect(el.querySelectorAll('.bell-flap-pod').length).toBe(6);

    component.selectTheme('flipdot');
    fixture.detectChanges();
    expect(el.querySelectorAll('.flipdot-matrix').length).toBe(6);
    expect(el.querySelectorAll('.flipdot-disc').length).toBe(210);

    component.selectTheme('edison');
    fixture.detectChanges();
    expect(el.querySelectorAll('.glass-bell-jar.shape-pear').length).toBe(6);
    expect(el.querySelectorAll('.edison-post').length).toBe(12);
  });

  it('renders the 30 World Horology Museum architectures with live time/date sync and Format/Scale controls', () => {
    const fixedDate = new Date(2026, 10, 11, 14, 27, 9); // Wed Nov 11 2026 14:27:09
    component.now.set(fixedDate);

    // 43. QLOCKTWO Word Matrix (110 cells + 2 remainder dots for min 27 % 5 === 2)
    component.selectTheme('qlocktwo');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(component.isWorldMuseum()).toBe(true);
    expect(el.querySelector('app-world-horology')).toBeTruthy();
    expect(el.querySelectorAll('.word-cell').length).toBe(110);
    expect(el.querySelectorAll('.wm-corner-dot.lit').length).toBe(2);
    const litChars = Array.from(el.querySelectorAll('.word-cell.lit')).map((n) => n.textContent?.trim()).join('');
    expect(litChars).toContain('ITIS');
    expect(litChars).toContain('TWENTYFIVE');
    expect(litChars).toContain('PAST');
    expect(litChars).toContain('TWO');

    // 44. A Million Times (144 micro analog dials, 288 hands)
    component.selectTheme('milliontimes');
    fixture.detectChanges();
    expect(el.querySelectorAll('.micro-dial').length).toBe(144);
    expect(el.querySelectorAll('.micro-hand').length).toBe(288);

    // 48. Solari Terminal (4 rows x 14 flap tiles = 56 tiles)
    component.selectTheme('solari_terminal');
    fixture.detectChanges();
    expect(el.querySelectorAll('.flap-tile').length).toBe(56);

    // 59. IBM Hollerith Punch Card (12 columns x 10 rows)
    component.selectTheme('ibmcard');
    fixture.detectChanges();
    expect(el.querySelectorAll('.ibm-cell').length).toBe(120);
    expect(el.querySelectorAll('.ibm-cell.punched').length).toBe(12);

    // 70. Bletchley BCD & Morse Rack
    component.selectTheme('bletchley');
    fixture.detectChanges();
    expect(el.querySelectorAll('.bcd-col').length).toBe(8);
    expect(el.querySelector('.morse-strip')?.textContent).toContain('MORSE:');

    // 72. Interstellar 5D Tesseract & sidebar scale/format controls
    component.selectTheme('tesseract');
    fixture.detectChanges();
    expect(el.querySelector('.tesseract-time')?.textContent?.trim()).toBe('14:27:09');

    component.toggle24Hour();
    fixture.detectChanges();
    expect(el.querySelector('.tesseract-time')?.textContent?.trim()).toBe('02:27:09');

    component.onScaleChange({ target: { value: '85' } } as unknown as Event);
    fixture.detectChanges();
    const wrapper = el.querySelector('.world-stage-wrapper') as HTMLElement;
    expect(wrapper.style.transform).toBe('scale(0.85)');
  });
});

describe('HorologyBulbComponent', () => {
  let component: HorologyBulbComponent;
  let fixture: ComponentFixture<HorologyBulbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorologyBulbComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(HorologyBulbComponent);
    component = fixture.componentInstance;
  });

  it('alternates split_flap phases inside glass bell jars on value change and surge', async () => {
    component.engine = 'split_flap';
    component.themeId = 'belljarflip';
    component.value = '8';
    fixture.detectChanges();
    expect(component.flipPhaseClass()).toBe('');

    component.value = '9';
    fixture.detectChanges();
    expect(component.flipPhaseClass()).toBe('flipping-a');
    expect(component.previous()).toBe('8');
    expect(component.current()).toBe('9');

    await Promise.resolve();
    component.forceFlipCount = 1;
    fixture.detectChanges();
    expect(component.flipPhaseClass()).toBe('flipping-b');
  });

  it('builds 7-segment and 5x7 flip-dot matrices accurately', () => {
    const seg8 = component.seg7Segments('8');
    expect(seg8.length).toBe(7);
    expect(seg8.every((s) => s.active)).toBe(true);

    const seg1 = component.seg7Segments('1');
    expect(seg1.filter((s) => s.active).length).toBe(2);

    const dots0 = component.flipDotCells('0');
    expect(dots0.length).toBe(35);
    expect(dots0.filter(Boolean).length).toBeGreaterThan(12);
  });
});
