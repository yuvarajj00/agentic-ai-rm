import { Injectable, signal, effect } from '@angular/core';

export type AppTheme = 'dark' | 'light' | 'theme-1' | 'theme-2' | 'theme-3' | 'theme-4';

export type AppFont =
  | 'default'
  | 'short-stack'
  | 'basic'
  | 'pt-sans'
  | 'love-ya'
  | 'finger-paint'
  | 'crafty-girls'
  | 'life-savers'
  | 'schoolbell'
  | 'edu-vic';

export interface FontOption {
  id: AppFont;
  name: string;
  cssFamily: string;
  category: 'Cursive' | 'Sans-Serif' | 'Serif' | 'Handwriting' | 'Monospace';
  className: string;
  sampleText: string;
}

export interface ThemeOption {
  id: AppTheme;
  name: string;
  subtitle: string;
  description: string;
  colors: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'agentic_ai_theme';
  private readonly FONT_KEY = 'agentic_ai_font';

  readonly theme = signal<AppTheme>(this.getInitialTheme());
  readonly font = signal<AppFont>(this.getInitialFont());
  readonly isSettingsOpen = signal<boolean>(false);

  readonly availableFonts: FontOption[] = [
    {
      id: 'default',
      name: 'Default (DM Mono & Syne)',
      cssFamily: "'DM Mono', monospace",
      category: 'Monospace',
      className: 'font-default',
      sampleText: 'Deterministic agentic loops & state transitions'
    },
    {
      id: 'short-stack',
      name: 'Short Stack',
      cssFamily: '"Short Stack", cursive',
      category: 'Cursive',
      className: 'short-stack-regular',
      sampleText: 'Playful and clean cursive handwriting'
    },
    {
      id: 'basic',
      name: 'Basic',
      cssFamily: '"Basic", sans-serif',
      category: 'Sans-Serif',
      className: 'basic-regular',
      sampleText: 'Clear, modern geometric sans-serif'
    },
    {
      id: 'pt-sans',
      name: 'PT Sans',
      cssFamily: '"PT Sans", sans-serif',
      category: 'Sans-Serif',
      className: 'pt-sans-regular',
      sampleText: 'Professional universal editorial sans-serif'
    },
    {
      id: 'love-ya',
      name: 'Love Ya Like A Sister',
      cssFamily: '"Love Ya Like A Sister", cursive',
      category: 'Cursive',
      className: 'love-ya-like-a-sister-regular',
      sampleText: 'Expressive hand-drawn chalk styling'
    },
    {
      id: 'finger-paint',
      name: 'Finger Paint',
      cssFamily: '"Finger Paint", sans-serif',
      category: 'Sans-Serif',
      className: 'finger-paint-regular',
      sampleText: 'Bold artistic brushed typography'
    },
    {
      id: 'crafty-girls',
      name: 'Crafty Girls',
      cssFamily: '"Crafty Girls", cursive',
      category: 'Cursive',
      className: 'crafty-girls-regular',
      sampleText: 'Creative casual notebook script'
    },
    {
      id: 'life-savers',
      name: 'Life Savers',
      cssFamily: '"Life Savers", serif',
      category: 'Serif',
      className: 'life-savers-regular',
      sampleText: 'Distinctive curved retro serif lettering'
    },
    {
      id: 'schoolbell',
      name: 'Schoolbell',
      cssFamily: '"Schoolbell", cursive',
      category: 'Cursive',
      className: 'schoolbell-regular',
      sampleText: 'Friendly neat cursive school script'
    },
    {
      id: 'edu-vic',
      name: 'Edu VIC WA NT Hand',
      cssFamily: '"Edu VIC WA NT Hand", cursive',
      category: 'Handwriting',
      className: 'edu-vic-wa-nt-hand-regular',
      sampleText: 'Natural cursive cursive educational penmanship'
    }
  ];

  readonly availableThemes: ThemeOption[] = [
    {
      id: 'theme-1',
      name: 'Theme 1: Royal Amethyst',
      subtitle: '#4C2365 • #7F5D99 • #9E7EB5 • #C4A4DA',
      description: 'Deep royal purple, lavender surface & light lilac text',
      colors: ['#4C2365', '#7F5D99', '#9E7EB5', '#C4A4DA']
    },
    {
      id: 'theme-2',
      name: 'Theme 2: Navy Sunset',
      subtitle: '#253C6D • #30497D • #455B8A • #F2842F',
      description: 'Deep ocean blues with warm sunset orange accents',
      colors: ['#253C6D', '#30497D', '#455B8A', '#F2842F']
    },
    {
      id: 'theme-3',
      name: 'Theme 3: Midnight Obsidian',
      subtitle: '#010736 • #0D1C42 • #22396F • #FCF1D0',
      description: 'Cosmic night abyss with soft cream gold highlights',
      colors: ['#010736', '#0D1C42', '#22396F', '#FCF1D0']
    },
    {
      id: 'theme-4',
      name: 'Theme 4: Nordic Slate',
      subtitle: '#27374D • #526D82 • #9DB2BF • #DDE6ED',
      description: 'Subdued slate fjord gray with arctic frost ice accents',
      colors: ['#27374D', '#526D82', '#9DB2BF', '#DDE6ED']
    },
    {
      id: 'dark',
      name: 'Cyberpunk Dark (Default)',
      subtitle: '#0a0a0f • #13131c • #7fff6e • #6eb5ff',
      description: 'Original obsidian dark mode with matrix neon emerald & cyan',
      colors: ['#0a0a0f', '#13131c', '#7fff6e', '#6eb5ff']
    },
    {
      id: 'light',
      name: 'Clean Light',
      subtitle: '#f8fafc • #ffffff • #047857 • #0369a1',
      description: 'High-contrast clean minimalist white with emerald & slate',
      colors: ['#f8fafc', '#ffffff', '#047857', '#0369a1']
    }
  ];

  constructor() {
    // Synchronize data-theme on <html> root element
    effect(() => {
      const currentTheme = this.theme();
      if (typeof document !== 'undefined' && document.documentElement) {
        document.documentElement.setAttribute('data-theme', currentTheme);
      }
      try {
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          localStorage.setItem(this.THEME_KEY, currentTheme);
          localStorage.setItem('ml_roadmap_theme', currentTheme);
        }
      } catch {}
    });

    // Synchronize data-font on <html> root element
    effect(() => {
      const currentFont = this.font();
      if (typeof document !== 'undefined' && document.documentElement) {
        document.documentElement.setAttribute('data-font', currentFont);
      }
      try {
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          localStorage.setItem(this.FONT_KEY, currentFont);
        }
      } catch {}
    });
  }

  setTheme(newTheme: AppTheme): void {
    this.theme.set(newTheme);
  }

  setFont(newFont: AppFont): void {
    this.font.set(newFont);
  }

  toggleTheme(): void {
    const list: AppTheme[] = ['dark', 'light', 'theme-1', 'theme-2', 'theme-3', 'theme-4'];
    const idx = list.indexOf(this.theme());
    const next = list[(idx + 1) % list.length];
    this.setTheme(next);
  }

  toggleSettings(): void {
    this.isSettingsOpen.update(v => !v);
  }

  openSettings(): void {
    this.isSettingsOpen.set(true);
  }

  closeSettings(): void {
    this.isSettingsOpen.set(false);
  }

  resetDefaults(): void {
    this.setTheme('dark');
    this.setFont('default');
  }

  private getInitialTheme(): AppTheme {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const saved = (localStorage.getItem(this.THEME_KEY) || localStorage.getItem('ml_roadmap_theme')) as AppTheme;
        if (['dark', 'light', 'theme-1', 'theme-2', 'theme-3', 'theme-4'].includes(saved)) {
          return saved;
        }
      }
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
      }
    } catch {}
    return 'dark';
  }

  private getInitialFont(): AppFont {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(this.FONT_KEY) as AppFont;
        if ([
          'default',
          'short-stack',
          'basic',
          'pt-sans',
          'love-ya',
          'finger-paint',
          'crafty-girls',
          'life-savers',
          'schoolbell',
          'edu-vic'
        ].includes(saved)) {
          return saved;
        }
      }
    } catch {}
    return 'default';
  }
}
