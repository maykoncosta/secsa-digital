import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'error-test',
    loadComponent: () => import('./error-test.component').then(m => m.ErrorTestComponent)
  },
  {
    path: 'error-logs',
    loadComponent: () => import('./error-logs.component').then(m => m.ErrorLogsComponent)
  }
];
