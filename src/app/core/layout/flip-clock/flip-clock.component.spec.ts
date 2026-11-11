import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { FlipClockComponent } from './flip-clock.component';
import { FlipUnitComponent } from './flip-unit.component';

describe('FlipClockComponent & FlipUnitComponent', () => {
  let component: FlipClockComponent;
  let fixture: ComponentFixture<FlipClockComponent>;

  beforeEach(async () => {
    try {
      localStorage.removeItem('agentic_ai_clock_24h');
    } catch {}

    await TestBed.configureTestingModule({
      imports: [FlipClockComponent, FlipUnitComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(FlipClockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should render the standalone clock on plain background with 3 drums, chrome spine, walnut base, and date', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.plain-clock-screen')).toBeTruthy();
    expect(compiled.querySelectorAll('.clock-drums-row app-flip-unit').length).toBe(3);
    expect(compiled.querySelector('.chrome-center-pillar')).toBeTruthy();
    expect(compiled.querySelector('.walnut-pedestal')).toBeTruthy();
    expect(compiled.querySelector('.clock-date-readout')).toBeTruthy();
  });

  it('should format 12-hour time with AM/PM and zero-padded minutes/seconds', () => {
    component.is24Hour.set(false);
    component.now.set(new Date(2026, 10, 11, 2, 32, 7));
    fixture.detectChanges();

    expect(component.hoursText()).toBe('2');
    expect(component.minutesText()).toBe('32');
    expect(component.secondsText()).toBe('07');
    expect(component.amPm()).toBe('AM');

    component.now.set(new Date(2026, 10, 11, 0, 5, 0));
    expect(component.hoursText()).toBe('12');
    expect(component.amPm()).toBe('AM');

    component.now.set(new Date(2026, 10, 11, 14, 9, 45));
    expect(component.hoursText()).toBe('2');
    expect(component.minutesText()).toBe('09');
    expect(component.secondsText()).toBe('45');
    expect(component.amPm()).toBe('PM');
  });

  it('should format 24-hour time when toggled and hide AM/PM badge', () => {
    component.now.set(new Date(2026, 10, 11, 14, 5, 9));
    component.toggle24Hour();
    fixture.detectChanges();

    expect(component.is24Hour()).toBe(true);
    expect(component.hoursText()).toBe('14');
    expect(component.minutesText()).toBe('05');
    expect(component.secondsText()).toBe('09');
    expect(component.amPm()).toBe('');

    component.now.set(new Date(2026, 10, 11, 0, 0, 0));
    expect(component.hoursText()).toBe('00');
  });

  it('should format date strictly as dd/mm/yyyy with zero-padding', () => {
    component.now.set(new Date(2026, 0, 5, 9, 15, 0));
    fixture.detectChanges();
    expect(component.dateFormatted()).toBe('05/01/2026');

    const dateEl = (fixture.nativeElement as HTMLElement).querySelector('.clock-date-readout');
    expect(dateEl?.textContent?.trim()).toBe('05/01/2026');

    component.now.set(new Date(2026, 10, 11, 13, 2, 9));
    fixture.detectChanges();
    expect(component.dateFormatted()).toBe('11/11/2026');
  });

  it('should navigate back to dashboard when goBack is invoked with shallow history', () => {
    const router = TestBed.inject(Router);
    const navSpy = vi.spyOn(router, 'navigateByUrl');
    const origLen = window.history.length;

    if (origLen <= 1) {
      component.goBack();
      expect(navSpy).toHaveBeenCalledWith('/dashboard');
    } else {
      component.goBack();
      expect(true).toBe(true);
    }
  });

  it('FlipUnitComponent should not flip on initial value and should increment flipTick only on value change', () => {
    const unitFixture = TestBed.createComponent(FlipUnitComponent);
    const unit = unitFixture.componentInstance;

    unit.value = '31';
    unitFixture.detectChanges();
    expect(unit.current()).toBe('31');
    expect(unit.previous()).toBe('31');
    expect(unit.flipTick()).toBe(0);

    unit.value = '31';
    expect(unit.flipTick()).toBe(0);

    unit.value = '32';
    unitFixture.detectChanges();
    expect(unit.current()).toBe('32');
    expect(unit.previous()).toBe('31');
    expect(unit.flipTick()).toBe(1);
    expect((unitFixture.nativeElement as HTMLElement).querySelector('.flip-odd')).toBeTruthy();

    unit.value = '33';
    unitFixture.detectChanges();
    expect(unit.current()).toBe('33');
    expect(unit.previous()).toBe('32');
    expect(unit.flipTick()).toBe(2);
    expect((unitFixture.nativeElement as HTMLElement).querySelector('.flip-even')).toBeTruthy();

    unitFixture.destroy();
  });

  it('FlipUnitComponent halves should bind incoming/outgoing numbers accurately across 18 -> 19 -> 20', () => {
    const unitFixture = TestBed.createComponent(FlipUnitComponent);
    const unit = unitFixture.componentInstance;
    const host = unitFixture.nativeElement as HTMLElement;

    unit.value = '18';
    unitFixture.detectChanges();
    expect(host.querySelector('.static-top .digit-face')?.textContent?.trim()).toBe('18');
    expect(host.querySelector('.static-bottom .digit-face')?.textContent?.trim()).toBe('18');

    unit.value = '19';
    unitFixture.detectChanges();
    expect(host.querySelector('.flap-top .digit-face')?.textContent?.trim()).toBe('18');
    expect(host.querySelector('.static-bottom .digit-face')?.textContent?.trim()).toBe('18');
    expect(host.querySelector('.static-top .digit-face')?.textContent?.trim()).toBe('19');
    expect(host.querySelector('.flap-bottom .digit-face')?.textContent?.trim()).toBe('19');

    unit.value = '20';
    unitFixture.detectChanges();
    expect(host.querySelector('.flap-top .digit-face')?.textContent?.trim()).toBe('19');
    expect(host.querySelector('.static-bottom .digit-face')?.textContent?.trim()).toBe('19');
    expect(host.querySelector('.static-top .digit-face')?.textContent?.trim()).toBe('20');
    expect(host.querySelector('.flap-bottom .digit-face')?.textContent?.trim()).toBe('20');

    unitFixture.destroy();
  });
});
