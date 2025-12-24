import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'pacientes',
    pathMatch: 'full'
  },
  {
    path: 'pacientes',
    loadComponent: () => import('./features/pacientes/pacientes-list.component').then(m => m.PacientesListComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'exames',
    loadComponent: () => import('./features/exames/exames.component').then(m => m.ExamesComponent)
  }
];
