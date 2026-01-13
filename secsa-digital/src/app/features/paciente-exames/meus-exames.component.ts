import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { LayoutComponent } from '../../shared/components/layout.component';

@Component({
  selector: 'app-meus-exames',
  standalone: true,
  imports: [CommonModule, LayoutComponent],
  template: `
    <app-layout>
      <span header>Meus Exames</span>
      
      <div class="space-y-6">
        <!-- Boas-vindas -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">
            Olá, {{ currentUser()?.displayName }}!
          </h2>
          <p class="text-gray-600">
            Aqui você pode visualizar todos os seus exames realizados.
          </p>
        </div>

        <!-- Área de exames (a ser implementada) -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            Seus Exames
          </h3>
          <div class="text-center py-12">
            <div class="text-6xl mb-4">🧪</div>
            <p class="text-gray-500 mb-2">
              Área de exames do paciente em desenvolvimento
            </p>
            <p class="text-sm text-gray-400">
              Em breve você poderá visualizar e baixar seus resultados de exames
            </p>
          </div>
        </div>
      </div>
    </app-layout>
  `
})
export class MeusExamesComponent implements OnInit {
  private authService = inject(AuthService);
  
  currentUser = this.authService.currentUser;

  ngOnInit(): void {
    console.log('Área do paciente - Usuário:', this.currentUser());
  }
}
