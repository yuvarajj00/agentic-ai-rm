import { Component, inject, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, AppTheme, AppFont, FontOption, ThemeOption } from '../../services/theme.service';

@Component({
  selector: 'app-appearance-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appearance-settings.component.html',
  styleUrl: './appearance-settings.component.css'
})
export class AppearanceSettingsComponent {
  readonly themeService = inject(ThemeService);

  readonly isFontDropdownOpen = signal<boolean>(false);
  readonly isThemeDropdownOpen = signal<boolean>(false);

  get isOpen(): boolean {
    return this.themeService.isSettingsOpen();
  }

  get currentTheme(): AppTheme {
    return this.themeService.theme();
  }

  get currentFont(): AppFont {
    return this.themeService.font();
  }

  get activeFontOption(): FontOption | undefined {
    return this.themeService.availableFonts.find((f) => f.id === this.currentFont);
  }

  get activeThemeOption(): ThemeOption | undefined {
    return this.themeService.availableThemes.find((t) => t.id === this.currentTheme);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isFontDropdownOpen() || this.isThemeDropdownOpen()) {
      this.closeDropdowns();
      return;
    }
    if (this.isOpen) {
      this.close();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-select-wrapper')) {
      this.closeDropdowns();
    }
  }

  toggleFontDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const next = !this.isFontDropdownOpen();
    this.isFontDropdownOpen.set(next);
    if (next) {
      this.isThemeDropdownOpen.set(false);
    }
  }

  toggleThemeDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const next = !this.isThemeDropdownOpen();
    this.isThemeDropdownOpen.set(next);
    if (next) {
      this.isFontDropdownOpen.set(false);
    }
  }

  closeDropdowns(): void {
    this.isFontDropdownOpen.set(false);
    this.isThemeDropdownOpen.set(false);
  }

  selectFont(fontId: AppFont): void {
    this.themeService.setFont(fontId);
    this.isFontDropdownOpen.set(false);
  }

  onFontChange(fontId: AppFont): void {
    this.selectFont(fontId);
  }

  selectTheme(themeId: AppTheme): void {
    this.themeService.setTheme(themeId);
    this.isThemeDropdownOpen.set(false);
  }

  close(): void {
    this.closeDropdowns();
    this.themeService.closeSettings();
  }

  reset(): void {
    this.closeDropdowns();
    this.themeService.resetDefaults();
  }
}
