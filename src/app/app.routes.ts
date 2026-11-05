import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'Command Center | Agentic AI Flight Deck'
  },
  {
    path: 'daily',
    loadComponent: () =>
      import('./features/daily-tracker/daily-tracker.component').then(m => m.DailyTrackerComponent),
    title: '35-Day Daily Tracker | Agentic AI Flight Deck'
  },
  {
    path: 'milestones',
    loadComponent: () =>
      import('./features/milestones/milestones.component').then(m => m.MilestonesComponent),
    title: '5-Week Milestones | Agentic AI Flight Deck'
  },
  {
    path: 'skills',
    loadComponent: () =>
      import('./features/tech-stack/tech-stack.component').then(m => m.TechStackComponent),
    title: 'Tech Stack Matrix | Agentic AI Flight Deck'
  },
  {
    path: 'detailedview/:day',
    loadComponent: () =>
      import('./features/detailed-view/detailed-view.component').then(m => m.DetailedViewComponent),
    title: 'Detailed Learning Guide | Agentic AI Flight Deck'
  },
  {
    path: 'detailedview',
    redirectTo: 'detailedview/day1',
    pathMatch: 'full'
  },
  {
    path: 'detailed-view/:day',
    redirectTo: (route) => 'detailedview/' + (route.params['day'] || 'day1')
  },
  {
    path: 'detailed-view',
    redirectTo: 'detailedview/day1',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
