import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { homeGuard } from './core/guards/home.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [homeGuard],
    children: []
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'create-admin',
    loadComponent: () => import('./utils/create-admin.component').then(m => m.CreateAdminComponent)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin', 'funcionario'] }
  },
  {
    path: 'pacientes',
    loadChildren: () => import('./features/pacientes/pacientes.routes').then(m => m.PACIENTES_ROUTES),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin', 'funcionario'] }
  },
  {
    path: 'exames',
    loadChildren: () => import('./features/exames/exames.routes').then(m => m.EXAMES_ROUTES),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin', 'funcionario'] }
  },
  {
    path: 'meus-exames',
    loadChildren: () => import('./features/paciente-exames/paciente-exames.routes').then(m => m.PACIENTE_EXAMES_ROUTES),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['paciente'] }
  },
  {
    path: 'configuracoes',
    loadChildren: () => import('./features/configuracoes/configuracoes.routes').then(m => m.CONFIGURACOES_ROUTES),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] }
  },
  {
    path: '404',
    loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent)
  },
  {
    path: '**',
    redirectTo: '/404'
  }
];

