import { Routes } from '@angular/router';

export const PACIENTE_EXAMES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./meus-exames.component').then(m => m.MeusExamesComponent)
  }
];
