import { Routes } from '@angular/router';
import { BioquimicoLayoutComponent } from './features/bioquimico/layout/bioquimico-layout.component';
import { ListaPacientesComponent } from './features/bioquimico/components/lista-pacientes/lista-pacientes.component';
import { CadastroPacienteComponent } from './features/bioquimico/components/cadastro-paciente/cadastro-paciente.component';
import { DetalhesPacienteComponent } from './features/bioquimico/components/detalhes-paciente/detalhes-paciente.component';
import { CadastroExameComponent } from './features/bioquimico/components/cadastro-exame/cadastro-exame.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/bioquimico/pacientes',
    pathMatch: 'full'
  },
  {
    path: 'bioquimico',
    component: BioquimicoLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'pacientes',
        pathMatch: 'full'
      },
      {
        path: 'pacientes',
        component: ListaPacientesComponent
      },
      {
        path: 'pacientes/novo',
        component: CadastroPacienteComponent
      },
      {
        path: 'pacientes/editar/:id',
        component: CadastroPacienteComponent
      },
      {
        path: 'pacientes/detalhes/:id',
        component: DetalhesPacienteComponent
      },
      {
        path: 'exames',
        loadComponent: () => import('./features/bioquimico/components/lista-exames/lista-exames.component').then(m => m.ListaExamesComponent)
      },
      {
        path: 'exames/novo',
        component: CadastroExameComponent
      },
      {
        path: 'exames/editar/:id',
        component: CadastroExameComponent
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/bioquimico/pacientes'
  }
];
