import { Routes } from '@angular/router';

export const PACIENTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/pacientes-list.component').then(m => m.PacientesListComponent)
  }
];
