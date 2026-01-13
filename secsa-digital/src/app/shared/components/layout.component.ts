import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Users, FlaskConical, LayoutDashboard, ListChecks, LogOut, Settings } from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-slate-50">
      <!-- Sidebar -->
      <aside 
        class="fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 z-40"
        role="complementary"
        aria-label="Menu de navegação principal"
      >
        <!-- Logo -->
        <div class="h-16 flex items-center px-6 border-b border-slate-200">
          <h1 class="text-xl font-bold text-primary">
            <span aria-hidden="true">🏥</span> 
            <span>SECSA Digital</span>
          </h1>
        </div>
        
        <!-- Navigation -->
        <nav class="p-4 space-y-1" aria-label="Menu principal">
          @if (showAdminMenu()) {
            <a
              routerLink="/dashboard"
              routerLinkActive="bg-primary text-white"
              [routerLinkActiveOptions]="{exact: false}"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-4 focus:ring-primary/30 focus:ring-offset-2"
              aria-label="Ir para Dashboard"
            >
              <lucide-icon [img]="LayoutDashboard" class="w-5 h-5" aria-hidden="true" />
              <span class="font-medium">Dashboard</span>
            </a>
            
            <a
              routerLink="/pacientes"
              routerLinkActive="bg-primary text-white"
              [routerLinkActiveOptions]="{exact: false}"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-4 focus:ring-primary/30 focus:ring-offset-2"
              aria-label="Ir para Pacientes"
            >
              <lucide-icon [img]="Users" class="w-5 h-5" aria-hidden="true" />
              <span class="font-medium">Pacientes</span>
            </a>
            
            <a
              routerLink="/exames/schemas"
              routerLinkActive="bg-primary text-white"
              [routerLinkActiveOptions]="{exact: false}"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-4 focus:ring-primary/30 focus:ring-offset-2"
              aria-label="Ir para Schemas de Exames"
            >
              <lucide-icon [img]="FlaskConical" class="w-5 h-5" aria-hidden="true" />
              <span class="font-medium">Schemas de Exames</span>
            </a>
            
            <a
              routerLink="/exames/realizados"
              routerLinkActive="bg-primary text-white"
              [routerLinkActiveOptions]="{exact: false}"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-4 focus:ring-primary/30 focus:ring-offset-2"
              aria-label="Ir para Exames Realizados"
            >
              <lucide-icon [img]="ListChecks" class="w-5 h-5" aria-hidden="true" />
              <span class="font-medium">Exames Realizados</span>
            </a>

            @if (isAdmin()) {
              <a
                routerLink="/configuracoes"
                routerLinkActive="bg-primary text-white"
                [routerLinkActiveOptions]="{exact: false}"
                class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-4 focus:ring-primary/30 focus:ring-offset-2"
                aria-label="Ir para Configurações"
              >
                <lucide-icon [img]="Settings" class="w-5 h-5" aria-hidden="true" />
                <span class="font-medium">Configurações</span>
              </a>
            }
          }

          @if (showPacienteMenu()) {
            <a
              routerLink="/meus-exames"
              routerLinkActive="bg-primary text-white"
              [routerLinkActiveOptions]="{exact: false}"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-4 focus:ring-primary/30 focus:ring-offset-2"
              aria-label="Ir para Meus Exames"
            >
              <lucide-icon [img]="ListChecks" class="w-5 h-5" aria-hidden="true" />
              <span class="font-medium">Meus Exames</span>
            </a>
          }
        </nav>

        <!-- User Info & Logout (Sticky at bottom) -->
        <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 bg-white">
          <div class="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-lg">
            <div class="flex-shrink-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
              {{ getUserInitials() }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-slate-900 truncate">
                {{ currentUser()?.displayName }}
              </p>
              <p class="text-xs text-slate-500 truncate">
                {{ getRoleName() }}
              </p>
            </div>
          </div>
          <button
            type="button"
            (click)="onLogout()"
            class="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/30"
            aria-label="Sair do sistema"
          >
            <lucide-icon [img]="LogOut" class="w-4 h-4" aria-hidden="true" />
            <span>Sair</span>
          </button>
        </div>
      </aside>
      
      <!-- Main Content -->
      <main class="ml-64" role="main">
        <!-- Header -->
        <header 
          class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8"
          role="banner"
        >
          <h2 class="text-lg font-semibold text-slate-800">
            <ng-content select="[header]"></ng-content>
          </h2>
          
          <div class="flex items-center gap-4">
            <span class="text-sm text-slate-600">
              {{ currentUser()?.email }}
            </span>
          </div>
        </header>
        
        <!-- Page Content -->
        <div class="p-8">
          <ng-content></ng-content>
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    a.bg-primary:hover {
      background-color: rgb(37 99 235) !important;
    }
  `]
})
export class LayoutComponent {
  private authService = inject(AuthService);

  // Icons
  LayoutDashboard = LayoutDashboard;
  Users = Users;
  FlaskConical = FlaskConical;
  ListChecks = ListChecks;
  LogOut = LogOut;
  Settings = Settings;

  // Computed
  currentUser = this.authService.currentUser;
  isAdmin = this.authService.isAdmin;
  showAdminMenu = computed(() => {
    const role = this.authService.userRole();
    return role === 'admin' || role === 'funcionario';
  });
  showPacienteMenu = computed(() => {
    return this.authService.userRole() === 'paciente';
  });

  getUserInitials(): string {
    const name = this.currentUser()?.displayName || '';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getRoleName(): string {
    const role = this.authService.userRole();
    const roleNames: Record<string, string> = {
      'admin': 'Administrador',
      'funcionario': 'Funcionário',
      'paciente': 'Paciente'
    };
    return roleNames[role || ''] || 'Usuário';
  }

  async onLogout(): Promise<void> {
    await this.authService.logout();
  }
}
