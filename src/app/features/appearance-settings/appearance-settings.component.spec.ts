import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppearanceSettingsComponent } from './appearance-settings.component';
import { ThemeService, AppTheme, AppFont } from '../../services/theme.service';

describe('AppearanceSettingsComponent', () => {
  let component: AppearanceSettingsComponent;
  let fixture: ComponentFixture<AppearanceSettingsComponent>;
  let themeService: ThemeService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppearanceSettingsComponent],
      providers: [ThemeService]
    }).compileComponents();

    fixture = TestBed.createComponent(AppearanceSettingsComponent);
    component = fixture.componentInstance;
    themeService = TestBed.inject(ThemeService);
    themeService.openSettings();
    fixture.detectChanges();
  });

  it('should create the appearance settings component', () => {
    expect(component).toBeTruthy();
  });

  it('should show modal when isSettingsOpen is true', () => {
    fixture.detectChanges();
    const backdrop = fixture.nativeElement.querySelector('.settings-modal-backdrop');
    expect(backdrop).toBeTruthy();
  });

  it('should open font dropdown and list all fonts with live typography previews', () => {
    component.toggleFontDropdown();
    fixture.detectChanges();

    const fontOptions = fixture.nativeElement.querySelectorAll('.font-option');
    expect(fontOptions.length).toBe(themeService.availableFonts.length);
  });

  it('should open theme dropdown and list all themes with live color swatch previews', () => {
    component.toggleThemeDropdown();
    fixture.detectChanges();

    const themeOptions = fixture.nativeElement.querySelectorAll('.theme-option');
    expect(themeOptions.length).toBe(themeService.availableThemes.length);
  });

  it('should update theme and close theme dropdown when an option is selected', () => {
    component.toggleThemeDropdown();
    fixture.detectChanges();

    component.selectTheme('theme-2');
    expect(themeService.theme()).toBe('theme-2');
    expect(component.isThemeDropdownOpen()).toBe(false);
  });

  it('should update font and close font dropdown when an option is selected', () => {
    component.toggleFontDropdown();
    fixture.detectChanges();

    component.selectFont('short-stack');
    expect(themeService.font()).toBe('short-stack');
    expect(component.isFontDropdownOpen()).toBe(false);
  });

  it('should close settings modal when close() is called', () => {
    component.close();
    expect(themeService.isSettingsOpen()).toBe(false);
  });

  it('should reset to defaults when reset() is called', () => {
    component.selectTheme('theme-3');
    component.selectFont('finger-paint');
    expect(themeService.theme()).toBe('theme-3');
    expect(themeService.font()).toBe('finger-paint');

    component.reset();
    expect(themeService.theme()).toBe('dark');
    expect(themeService.font()).toBe('default');
  });
});
