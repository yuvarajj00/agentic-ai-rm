import { Component, DOCUMENT, effect, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { NavbarComponent } from './core/layout/navbar/navbar.component';
import { FooterComponent } from './core/layout/footer/footer.component';
import { SprintCalendarComponent } from './features/sprint-calendar/sprint-calendar.component';
import { AppearanceSettingsComponent } from './features/appearance-settings/appearance-settings.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, SprintCalendarComponent, AppearanceSettingsComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly router = inject(Router);
  private readonly doc = inject(DOCUMENT);

  readonly isClockRoute = signal<boolean>(this.checkClockUrl(this.router.url));

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe(event => {
        this.isClockRoute.set(this.checkClockUrl(event.urlAfterRedirects));
      });

    effect(() => {
      const clockActive = this.isClockRoute();
      if (this.doc?.body) {
        this.doc.body.classList.toggle('plain-clock-mode', clockActive);
      }
    });
  }

  private checkClockUrl(url: string): boolean {
    return url === '/clock' || url.startsWith('/clock?') || url.startsWith('/clock/');
  }
}
