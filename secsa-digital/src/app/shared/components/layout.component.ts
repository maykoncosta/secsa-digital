import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Users, FlaskConical, LayoutDashboard, ListChecks, Menu, X } from 'lucide-angular';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-slate-50">
      <!-- Sidebar -->
      <aside class="fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 z-40">
        <!-- Logo -->
        <div class="h-16 flex items-center px-6 border-b border-slate-200">
          <h1 class="text-xl font-bold text-primary">🏥 SECSA Digital</h1>
        </div>
        
        <!-- Navigation -->
        <nav class="p-4 space-y-1">
          <a
            routerLink="/dashboard"
            routerLinkActive="bg-primary text-white"
            [routerLinkActiveOptions]="{exact: false}"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <lucide-icon [img]="LayoutDashboard" class="w-5 h-5" />
            <span class="font-medium">Dashboard</span>
          </a>
          
          <a
            routerLink="/pacientes"
            routerLinkActive="bg-primary text-white"
            [routerLinkActiveOptions]="{exact: false}"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <lucide-icon [img]="Users" class="w-5 h-5" />
            <span class="font-medium">Pacientes</span>
          </a>
          
          <a
            routerLink="/exames/schemas"
            routerLinkActive="bg-primary text-white"
            [routerLinkActiveOptions]="{exact: false}"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <lucide-icon [img]="FlaskConical" class="w-5 h-5" />
            <span class="font-medium">Schemas de Exames</span>
          </a>
          
          <a
            routerLink="/exames/realizados"
            routerLinkActive="bg-primary text-white"
            [routerLinkActiveOptions]="{exact: false}"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <lucide-icon [img]="ListChecks" class="w-5 h-5" />
            <span class="font-medium">Exames Realizados</span>
          </a>
        </nav>
      </aside>
      
      <!-- Main Content -->
      <main class="ml-64">
        <!-- Header -->
        <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <h2 class="text-lg font-semibold text-slate-800">
            <ng-content select="[header]"></ng-content>
          </h2>
          
          <div class="flex items-center gap-4">
            <span class="text-sm text-slate-600">Usuário Admin</span>
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
  LayoutDashboard = LayoutDashboard;
  Users = Users;
  FlaskConical = FlaskConical;
  ListChecks = ListChecks;
  Menu = Menu;
  X = X;
}
