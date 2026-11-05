import { Injectable, signal, effect } from '@angular/core';

export type AppTheme = 'dark' | 'light';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'ml_roadmap_theme';

  readonly theme = signal<AppTheme>(this.getInitialTheme());

  constructor() {
    // Apply theme to document root whenever it changes
    effect(() => {
      const current = this.theme();
      if (typeof document !== 'undefined' && document.documentElement) {
        document.documentElement.setAttribute('data-theme', current);
      }
      try {
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined' && localStorage && typeof localStorage.setItem === 'function') {
          localStorage.setItem(this.STORAGE_KEY, current);
        }
      } catch {}
    });
  }

  toggleTheme() {
    this.theme.update(prev => (prev === 'dark' ? 'light' : 'dark'));
  }

  setTheme(newTheme: AppTheme) {
    this.theme.set(newTheme);
  }

  private getInitialTheme(): AppTheme {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined' && localStorage && typeof localStorage.getItem === 'function') {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved === 'dark' || saved === 'light') {
          return saved;
        }
      }
      // If user OS prefers light, start light; otherwise default to dark cyberpunk
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
      }
    } catch {}
    return 'dark';
  }
}
