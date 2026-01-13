import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule],
  template: `
    <main 
      role="main" 
      class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4"
      aria-labelledby="error-title"
    >
      <div class="max-w-2xl w-full text-center">
        <!-- Ilustração do erro 404 -->
        <div class="mb-8" role="img" aria-label="Erro 404 - Página não encontrada">
          <div class="text-9xl font-bold text-indigo-600 mb-4" aria-hidden="true">404</div>
          <div class="flex justify-center mb-6">
            <svg 
              class="w-64 h-64 text-indigo-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
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
          <h1 id="error-title" class="text-4xl font-bold text-gray-800 mb-4">
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
        <nav aria-label="Ações de navegação" class="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            type="button"
            (click)="goHome()"
            (keydown.enter)="goHome()"
            (keydown.space)="goHome()"
            class="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
            aria-label="Ir para a página inicial do sistema"
          >
            <span class="flex items-center gap-2">
              <svg 
                class="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Ir para a página inicial</span>
            </span>
          </button>

          <button
            type="button"
            (click)="goBack()"
            (keydown.enter)="goBack()"
            (keydown.space)="goBack()"
            class="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg shadow-md hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 border-2 border-indigo-600"
            aria-label="Voltar para a página anterior"
          >
            <span class="flex items-center gap-2">
              <svg 
                class="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Voltar</span>
            </span>
          </button>
        </nav>

        <!-- Links úteis -->
        <nav aria-label="Links rápidos" class="mt-12 pt-8 border-t border-gray-300">
          <p class="text-sm text-gray-500 mb-4">Você também pode acessar:</p>
          <ul class="flex flex-wrap gap-4 justify-center list-none" role="list">
            <li>
              <a 
                (click)="navigateTo('/pacientes')"
                (keydown.enter)="navigateTo('/pacientes')"
                (keydown.space)="navigateTo('/pacientes')"
                tabindex="0"
                role="link"
                class="text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded px-1"
                aria-label="Ir para a página de pacientes"
              >
                Pacientes
              </a>
            </li>
            <li aria-hidden="true" class="text-gray-300">|</li>
            <li>
              <a 
                (click)="navigateTo('/exames')"
                (keydown.enter)="navigateTo('/exames')"
                (keydown.space)="navigateTo('/exames')"
                tabindex="0"
                role="link"
                class="text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded px-1"
                aria-label="Ir para a página de exames"
              >
                Exames
              </a>
            </li>
            <li aria-hidden="true" class="text-gray-300">|</li>
            <li>
              <a 
                (click)="navigateTo('/dashboard')"
                (keydown.enter)="navigateTo('/dashboard')"
                (keydown.space)="navigateTo('/dashboard')"
                tabindex="0"
                role="link"
                class="text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded px-1"
                aria-label="Ir para o dashboard"
              >
                Dashboard
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </main>
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

  navigateTo(path: string, event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    this.router.navigate([path]);
  }
}
