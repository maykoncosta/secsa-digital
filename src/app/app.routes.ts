import { Routes } from '@angular/router';
import { BioquimicoLayoutComponent } from './features/bioquimico/layout/bioquimico-layout.component';
import { ListaPacientesComponent } from './features/bioquimico/components/lista-pacientes/lista-pacientes.component';
import { CadastroPacienteComponent } from './features/bioquimico/components/cadastro-paciente/cadastro-paciente.component';
import { DetalhesPacienteComponent } from './features/bioquimico/components/detalhes-paciente/detalhes-paciente.component';
// import { CadastroExameComponent } from './features/bioquimico/components/cadastro-exame/cadastro-exame.component';
import { CadastroExameV2Component } from './features/bioquimico/components/cadastro-exame-v2/cadastro-exame-v2.component';
import { ValoresReferenciaComponent } from './features/bioquimico/components/valores-referencia/valores-referencia.component';
import { RelatoriosComponent } from './features/bioquimico/components/relatorios/relatorios.component';
import { PacienteLayoutComponent } from './features/paciente/layout/paciente-layout.component';
import { MeusExamesComponent } from './features/paciente/components/meus-exames/meus-exames.component';
import { VisualizarExameComponent } from './features/paciente/components/visualizar-exame/visualizar-exame.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/paciente/exames',
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
        component: CadastroExameV2Component
      },
      // NOTA: Componente v1 desabilitado - usar v2 (dinâmico)
      // {
      //   path: 'exames/novo-v1',
      //   component: CadastroExameComponent
      // },
      {
        path: 'exames/editar/:id',
        component: CadastroExameV2Component
      },
      {
        path: 'valores-referencia',
        component: ValoresReferenciaComponent
      },
      {
        path: 'relatorios',
        component: RelatoriosComponent
      }
    ]
  },
  {
    path: 'paciente',
    component: PacienteLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'exames',
        pathMatch: 'full'
      },
      {
        path: 'exames',
        component: MeusExamesComponent
      },
      {
        path: 'exames/:id',
        component: VisualizarExameComponent
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/paciente/exames'
  }
];
