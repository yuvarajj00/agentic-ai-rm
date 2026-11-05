import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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
export class App {}
