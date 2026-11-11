import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { routes } from './app.routes';
import { App } from './app';
import { CurriculumService } from './services/curriculum.service';
import { ThemeService } from './services/theme.service';
import { MongoAtlasService } from './services/mongo-atlas.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter(routes),
        CurriculumService,
        ThemeService,
        MongoAtlasService
      ]
    }).compileComponents();
  });

  afterEach(() => {
    document.body.classList.remove('plain-clock-mode');
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render Clock text link in the footer and keep navbar free of clock', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.brand-name')?.textContent).toContain('AGENTIC AI FLIGHT DECK');
    expect(compiled.querySelector('app-navbar app-flip-clock')).toBeFalsy();
    const navClockLink = Array.from(compiled.querySelectorAll('app-navbar .nav-btn')).find(
      el => el.textContent?.trim() === 'Clock'
    );
    expect(navClockLink).toBeFalsy();

    const footerClockLink = Array.from(compiled.querySelectorAll('app-footer a')).find(
      el => el.textContent?.trim() === 'Clock'
    );
    expect(footerClockLink).toBeTruthy();
    expect(footerClockLink?.getAttribute('href')).toBe('/clock');
  });

  it('should show only the standalone clock on plain background when navigated to /clock', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/clock');
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(fixture.componentInstance.isClockRoute()).toBe(true);
    expect(compiled.querySelector('app-navbar')).toBeFalsy();
    expect(compiled.querySelector('app-footer')).toBeFalsy();
    expect(compiled.querySelector('.plain-clock-screen')).toBeTruthy();
    expect(document.body.classList.contains('plain-clock-mode')).toBe(true);
  });
});
