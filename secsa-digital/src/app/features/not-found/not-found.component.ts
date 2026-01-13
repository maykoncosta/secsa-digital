import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div class="max-w-2xl w-full text-center">
        <!-- Ilustração do erro 404 -->
        <div class="mb-8">
          <div class="text-9xl font-bold text-indigo-600 mb-4">404</div>
          <div class="flex justify-center mb-6">
            <svg 
              class="w-64 h-64 text-indigo-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="1.5" 
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        <!-- Mensagem de erro -->
        <div class="mb-8">
          <h1 class="text-4xl font-bold text-gray-800 mb-4">
            Página não encontrada
          </h1>
          <p class="text-lg text-gray-600 mb-2">
            Desculpe, a página que você está procurando não existe.
          </p>
          <p class="text-md text-gray-500">
            Ela pode ter sido movida, removida ou o link pode estar incorreto.
          </p>
        </div>

        <!-- Ações -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            (click)="goHome()"
            class="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
          >
            <span class="flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Ir para a página inicial
            </span>
          </button>

          <button
            (click)="goBack()"
            class="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg shadow-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 border-2 border-indigo-600"
          >
            <span class="flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Voltar
            </span>
          </button>
        </div>

        <!-- Links úteis -->
        <div class="mt-12 pt-8 border-t border-gray-300">
          <p class="text-sm text-gray-500 mb-4">Você também pode acessar:</p>
          <div class="flex flex-wrap gap-4 justify-center">
            <a 
              (click)="navigateTo('/pacientes')"
              class="text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer hover:underline"
            >
              Pacientes
            </a>
            <span class="text-gray-300">|</span>
            <a 
              (click)="navigateTo('/exames')"
              class="text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer hover:underline"
            >
              Exames
            </a>
            <span class="text-gray-300">|</span>
            <a 
              (click)="navigateTo('/dashboard')"
              class="text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer hover:underline"
            >
              Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }
  `]
})
export class NotFoundComponent {
  constructor(private router: Router) {}

  goHome(): void {
    this.router.navigate(['/']);
  }

  goBack(): void {
    window.history.back();
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
