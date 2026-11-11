import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Location } from '@angular/common';
import { vi } from 'vitest';
import { FlipClockComponent } from './flip-clock.component';
import { FlipUnitComponent } from './flip-unit.component';
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

  it('exposes all 20 themes in a dropdown and switches active theme with persistence', () => {
    expect(FLIP_CLOCK_THEMES.length).toBe(20);
    const el: HTMLElement = fixture.nativeElement;
    const trigger = el.querySelector('.theme-dropdown-trigger') as HTMLButtonElement;
    expect(trigger.textContent).toContain('01. Fliqlo Matte');

    trigger.click();
    fixture.detectChanges();

    const options = el.querySelectorAll('.theme-option');
    expect(options.length).toBe(20);

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
});
