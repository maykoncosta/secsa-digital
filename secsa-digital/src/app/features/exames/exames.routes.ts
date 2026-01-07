import { Routes } from '@angular/router';

export const EXAMES_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'schemas',
    pathMatch: 'full'
  },
  {
    path: 'schemas',
    loadComponent: () => import('./pages/schemas-exames-list.component').then(m => m.SchemasExamesListComponent)
  },
  {
    path: 'realizados',
    loadComponent: () => import('./pages/exames-realizados-list.component').then(m => m.ExamesRealizadosListComponent)
  }
];
