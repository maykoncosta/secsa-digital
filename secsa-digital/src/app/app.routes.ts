import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'pacientes',
    pathMatch: 'full'
  },
  {
    path: 'pacientes',
    loadComponent: () => import('./features/pacientes/pages/pacientes-list.component').then(m => m.PacientesListComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'exames/schemas',
    loadComponent: () => import('./features/exames/pages/schemas-exames-list.component').then(m => m.SchemasExamesListComponent)
  },
  {
    path: 'exames/realizados',
    loadComponent: () => import('./features/exames/pages/exames-realizados-list.component').then(m => m.ExamesRealizadosListComponent)
  }
];

