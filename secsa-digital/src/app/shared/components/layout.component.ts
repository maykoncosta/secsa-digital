import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Users, FlaskConical, LayoutDashboard, ListChecks, LogOut, Settings, Menu, X } from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';
import { TooltipDirective } from '../directives/tooltip.directive';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, TooltipDirective],
  template: `
    <div class="min-h-screen bg-slate-50">
      <!-- Overlay -->
      @if (sidebarOpen()) {
        <div 
          class="fixed inset-0 bg-black/30 z-30 backdrop-blur-sm"
          (click)="toggleSidebar()"
          aria-hidden="true"
        ></div>
      }
      
      <!-- Sidebar -->
      <aside 
        [class.translate-x-0]="sidebarOpen()"
        [class.-translate-x-full]="!sidebarOpen()"
        class="fixed top-0 left-0 h-full w-72 sm:w-64 bg-gradient-to-b from-slate-900 to-slate-800 shadow-2xl z-40 transition-transform duration-300 ease-in-out"
        role="complementary"
        aria-label="Menu de navegação principal"
      >
        <!-- Logo -->
        <div class="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-slate-700/50">
          <h1 class="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <span aria-hidden="true" class="text-xl sm:text-2xl">🏥</span> 
            <span class="truncate">SECSA Digital</span>
          </h1>
          <button
            type="button"
            (click)="toggleSidebar()"
            class="text-slate-400 hover:text-white transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-white/30"
            [appTooltip]="'Fechar menu (Esc)'"
            tooltipPosition="right"
            aria-label="Fechar menu"
          >
            <lucide-icon [img]="X" class="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
        
        <!-- Navigation -->
        <nav class="p-3 sm:p-4 space-y-1 overflow-y-auto" style="height: calc(100vh - 220px);" aria-label="Menu principal">
          @if (showAdminMenu()) {
            <a
              routerLink="/dashboard"
              routerLinkActive="bg-primary/90 text-white shadow-lg"
              [routerLinkActiveOptions]="{exact: false}"
              (click)="closeSidebarOnMobile()"              [appTooltip]="'Visualizar estatísticas e resumo'"
              tooltipPosition="right"              class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-slate-900"
              aria-label="Ir para Dashboard"
            >
              <lucide-icon [img]="LayoutDashboard" class="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              <span class="font-medium text-sm sm:text-base">Dashboard</span>
            </a>
            
            <a
              routerLink="/pacientes"
              routerLinkActive="bg-primary/90 text-white shadow-lg"
              [routerLinkActiveOptions]="{exact: false}"
              (click)="closeSidebarOnMobile()"
              [appTooltip]="'Gerenciar cadastro de pacientes'"
              tooltipPosition="right"
              class="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-slate-900"
              aria-label="Ir para Pacientes"
            >
              <lucide-icon [img]="Users" class="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              <span class="font-medium text-sm sm:text-base">Pacientes</span>
            </a>
            
            <a
              routerLink="/exames/schemas"
              routerLinkActive="bg-primary/90 text-white shadow-lg"
              [routerLinkActiveOptions]="{exact: false}"
              (click)="closeSidebarOnMobile()"
              [appTooltip]="'Configurar modelos de exames'"
              tooltipPosition="right"
              class="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-slate-900"
              aria-label="Ir para Schemas de Exames"
            >
              <lucide-icon [img]="FlaskConical" class="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              <span class="font-medium text-sm sm:text-base">Schemas de Exames</span>
            </a>
            
            <a
              routerLink="/exames/realizados"
              routerLinkActive="bg-primary/90 text-white shadow-lg"
              [routerLinkActiveOptions]="{exact: false}"
              (click)="closeSidebarOnMobile()"
              [appTooltip]="'Gerenciar exames realizados'"
              tooltipPosition="right"
              class="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-slate-900"
              aria-label="Ir para Exames Realizados"
            >
              <lucide-icon [img]="ListChecks" class="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              <span class="font-medium text-sm sm:text-base">Exames Realizados</span>
            </a>

            @if (isAdmin()) {
              <a
                routerLink="/configuracoes"
                routerLinkActive="bg-primary/90 text-white shadow-lg"
                [routerLinkActiveOptions]="{exact: false}"
                (click)="closeSidebarOnMobile()"
                [appTooltip]="'Configurações do sistema'"
                tooltipPosition="right"
                class="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-slate-900"
                aria-label="Ir para Configurações"
              >
                <lucide-icon [img]="Settings" class="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <span class="font-medium text-sm sm:text-base">Configurações</span>
              </a>
            }
          }

          @if (showPacienteMenu()) {
            <a
              routerLink="/meus-exames"
              routerLinkActive="bg-primary/90 text-white shadow-lg"
              [routerLinkActiveOptions]="{exact: false}"
              (click)="closeSidebarOnMobile()"
              [appTooltip]="'Ver meus exames e resultados'"
              tooltipPosition="right"
              class="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-slate-900"
              aria-label="Ir para Meus Exames"
            >
              <lucide-icon [img]="ListChecks" class="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              <span class="font-medium text-sm sm:text-base">Meus Exames</span>
            </a>
          }
        </nav>

        <!-- User Info & Logout (Sticky at bottom) -->
        <div class="absolute bottom-0 left-0 right-0 p-3 sm:p-4 border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
          <div class="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <div class="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
              {{ getUserInitials() }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-white truncate">
                {{ currentUser()?.displayName }}
              </p>
              <p class="text-xs text-slate-400 truncate">
                {{ getRoleName() }}
              </p>
            </div>
          </div>
          <button
            type="button"
            (click)="onLogout()"
            [appTooltip]="'Sair do sistema'"
            tooltipPosition="top"
            class="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-950/30 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/30 border border-red-900/30 hover:border-red-800/50"
            aria-label="Sair do sistema"
          >
            <lucide-icon [img]="LogOut" class="w-4 h-4" aria-hidden="true" />
            <span>Sair</span>
          </button>
        </div>
      </aside>
      
      <!-- Main Content -->
      <main 
        [class.sm:ml-64]="sidebarOpen()"
        [class.ml-72]="sidebarOpen()"
        [class.ml-0]="!sidebarOpen()"
        class="transition-all duration-300" 
        role="main"
      >
        <!-- Header -->
        <header 
          class="h-16 sm:h-18 bg-white/80 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-20 shadow-sm"
          role="banner"
        >
          <div class="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            <!-- Hamburger Button -->
            <button
              type="button"
              (click)="toggleSidebar()"
              [appTooltip]="sidebarOpen() ? 'Fechar menu' : 'Abrir menu'"
              tooltipPosition="bottom"
              class="text-slate-600 hover:text-primary hover:bg-primary/5 transition-all duration-200 p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 flex-shrink-0"
              [attr.aria-label]="sidebarOpen() ? 'Fechar menu' : 'Abrir menu'"
            >
              <lucide-icon [img]="Menu" class="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
            </button>
            
            <!-- Page Title -->
            <div class="flex-1 min-w-0">
              <h2 class="text-base sm:text-lg lg:text-xl font-bold text-slate-900 truncate flex items-center gap-2">
                <ng-content select="[header]"></ng-content>
              </h2>
              <p class="hidden lg:block text-xs text-slate-500 mt-0.5">{{ getGreeting() }}</p>
            </div>
          </div>
          
          <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <!-- User Badge Mobile -->
            <button
              type="button"
              class="sm:hidden w-9 h-9 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2"
              [appTooltip]="currentUser()?.displayName || ''"
              tooltipPosition="bottom"
            >
              {{ getUserInitials() }}
            </button>
            
            <!-- User Badge Desktop -->
            <div class="hidden sm:flex items-center gap-3 bg-gradient-to-r from-slate-50 to-slate-100/50 px-4 py-2 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 group">
              <div class="w-9 h-9 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md group-hover:shadow-lg transition-shadow">
                {{ getUserInitials() }}
              </div>
              <div class="hidden md:block">
                <p class="text-sm font-semibold text-slate-900 truncate max-w-[140px] lg:max-w-[180px]">
                  {{ currentUser()?.displayName }}
                </p>
                <div class="flex items-center gap-1.5 mt-0.5">
                  <span class="inline-block w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  <p class="text-xs text-slate-500 truncate max-w-[140px] lg:max-w-[180px]">
                    {{ getRoleName() }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <!-- Page Content -->
        <div class="p-3 sm:p-4 md:p-6 lg:p-8">
          <ng-content></ng-content>
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    a.bg-primary\\/90 {
      background-color: rgba(59, 130, 246, 0.9) !important;
    }
    
    a.bg-primary\\/90:hover {
      background-color: rgb(37, 99, 235) !important;
    }
  `]
})
export class LayoutComponent {
  private authService = inject(AuthService);

  // State
  sidebarOpen = signal(false);

  // Icons
  LayoutDashboard = LayoutDashboard;
  Users = Users;
  FlaskConical = FlaskConical;
  ListChecks = ListChecks;
  LogOut = LogOut;
  Settings = Settings;
  Menu = Menu;
  X = X;

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

  getGreeting(): string {
    const hour = new Date().getHours();
    const name = this.currentUser()?.displayName?.split(' ')[0] || 'Usuário';
    
    if (hour < 12) return `Bom dia, ${name}!`;
    if (hour < 18) return `Boa tarde, ${name}!`;
    return `Boa noite, ${name}!`;
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(value => !value);
  }

  closeSidebarOnMobile(): void {
    // Fecha o sidebar ao clicar em um link
    this.sidebarOpen.set(false);
  }

  async onLogout(): Promise<void> {
    await this.authService.logout();
  }
}
