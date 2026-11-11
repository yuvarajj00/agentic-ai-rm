import {
  Component,
  DestroyRef,
  NgZone,
  OnInit,
  PLATFORM_ID,
  computed,
  inject,
  signal
} from '@angular/core';
import { CommonModule, isPlatformBrowser, Location } from '@angular/common';
import { Router } from '@angular/router';
import { FlipUnitComponent } from './flip-unit.component';

@Component({
  selector: 'app-flip-clock',
  standalone: true,
  imports: [CommonModule, FlipUnitComponent],
  templateUrl: './flip-clock.component.html',
  styleUrl: './flip-clock.component.css',
  host: {
    '(document:keydown.escape)': 'goBack()'
  }
})
export class FlipClockComponent implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly ngZone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly CLOCK_24H_KEY = 'agentic_ai_clock_24h';

  private timerId: ReturnType<typeof setTimeout> | null = null;

  readonly now = signal<Date>(new Date());
  readonly is24Hour = signal<boolean>(this.load24HourPref());

  readonly hoursText = computed<string>(() => {
    const h = this.now().getHours();
    if (this.is24Hour()) {
      return h.toString().padStart(2, '0');
    }
    const h12 = h % 12 || 12;
    return h12.toString();
  });

  readonly minutesText = computed<string>(() => {
    return this.now().getMinutes().toString().padStart(2, '0');
  });

  readonly secondsText = computed<string>(() => {
    return this.now().getSeconds().toString().padStart(2, '0');
  });

  readonly amPm = computed<string>(() => {
    if (this.is24Hour()) {
      return '';
    }
    return this.now().getHours() >= 12 ? 'PM' : 'AM';
  });

  readonly dateFormatted = computed<string>(() => {
    const d = this.now();
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear().toString();
    return `${day}/${month}/${year}`;
  });

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.scheduleNextTick();
    }

    this.destroyRef.onDestroy(() => {
      if (this.timerId !== null) {
        clearTimeout(this.timerId);
        this.timerId = null;
      }
    });
  }

  private scheduleNextTick(): void {
    const msUntilNextSecond = 1020 - (Date.now() % 1000);
    this.ngZone.runOutsideAngular(() => {
      this.timerId = setTimeout(() => {
        this.ngZone.run(() => {
          this.now.set(new Date());
        });
        this.scheduleNextTick();
      }, msUntilNextSecond);
    });
  }

  toggle24Hour(): void {
    const next = !this.is24Hour();
    this.is24Hour.set(next);
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem(this.CLOCK_24H_KEY, String(next));
      }
    } catch {}
  }

  goBack(): void {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigateByUrl('/dashboard');
    }
  }

  private load24HourPref(): boolean {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        return localStorage.getItem(this.CLOCK_24H_KEY) === 'true';
      }
    } catch {}
    return false;
  }
}
