import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LayoutComponent } from '../../shared/components/layout.component';
import { LucideAngularModule, FlaskConical, ListChecks } from 'lucide-angular';

@Component({
  selector: 'app-exames',
  standalone: true,
  imports: [RouterModule, LayoutComponent, LucideAngularModule],
  template: `
    <app-layout>
      <div header>Exames</div>
      
      <div class="space-y-6">
        <!-- Menu de Navegação -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex gap-4">
            <a
              routerLink="/exames/schemas"
              routerLinkActive="bg-primary text-white"
              class="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors hover:bg-slate-100"
              [routerLinkActiveOptions]="{exact: false}"
            >
              <lucide-icon [img]="FlaskConical" class="w-4 h-4" />
              <span class="font-medium">Schemas de Exames</span>
            </a>
            
            <a
              routerLink="/exames/realizados"
              routerLinkActive="bg-primary text-white"
              class="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors hover:bg-slate-100"
              [routerLinkActiveOptions]="{exact: false}"
            >
              <lucide-icon [img]="ListChecks" class="w-4 h-4" />
              <span class="font-medium">Exames Realizados</span>
            </a>
          </div>
        </div>
        
        <!-- Conteúdo da Rota -->
        <router-outlet />
      </div>
    </app-layout>
  `
})
export class ExamesComponent {
  FlaskConical = FlaskConical;
  ListChecks = ListChecks;
}
