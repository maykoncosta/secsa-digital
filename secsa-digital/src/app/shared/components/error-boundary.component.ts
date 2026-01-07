import { Component, signal, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, AlertTriangle, RefreshCw, Home } from 'lucide-angular';
import { Router } from '@angular/router';

/**
 * Componente Error Boundary
 * Captura erros não tratados e exibe interface amigável
 * 
 * @example
 * // No app.component.ts ou componente pai
 * <app-error-boundary>
 *   <router-outlet />
 * </app-error-boundary>
 */
@Component({
  selector: 'app-error-boundary',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    @if (hasError()) {
      <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
        <div class="max-w-md w-full">
          <!-- Card de Erro -->
          <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
            <!-- Header -->
            <div class="bg-gradient-to-r from-red-500 to-red-600 px-6 py-8 text-center">
              <div class="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <lucide-icon 
                  [img]="AlertTriangle" 
                  class="w-10 h-10 text-white"
                />
              </div>
              <h1 class="text-2xl font-bold text-white mb-2">
                Ops! Algo deu errado
              </h1>
              <p class="text-red-50 text-sm">
                Encontramos um erro inesperado
              </p>
            </div>

            <!-- Body -->
            <div class="p-6">
              <div class="bg-red-50 border border-red-100 rounded-lg p-4 mb-6">
                <p class="text-sm text-red-800 font-medium mb-1">
                  Mensagem de erro:
                </p>
                <p class="text-sm text-red-600 font-mono">
                  {{ errorMessage() }}
                </p>
              </div>

              <div class="space-y-3">
                <!-- Botão Tentar Novamente -->
                <button
                  (click)="retry()"
                  class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
                >
                  <lucide-icon [img]="RefreshCw" class="w-4 h-4" />
                  Tentar Novamente
                </button>

                <!-- Botão Voltar ao Início -->
                <button
                  (click)="goHome()"
                  class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors border border-slate-200"
                >
                  <lucide-icon [img]="Home" class="w-4 h-4" />
                  Voltar ao Início
                </button>
              </div>

              <!-- Detalhes técnicos (apenas dev) -->
              @if (showDetails()) {
                <details class="mt-6">
                  <summary class="cursor-pointer text-sm text-slate-600 hover:text-slate-900 font-medium">
                    Detalhes técnicos
                  </summary>
                  <div class="mt-3 p-4 bg-slate-50 rounded-lg">
                    <pre class="text-xs text-slate-700 overflow-auto max-h-40">{{ errorStack() }}</pre>
                  </div>
                </details>
              }

              <!-- Informações de suporte -->
              <div class="mt-6 pt-6 border-t border-slate-200">
                <p class="text-xs text-slate-500 text-center">
                  Se o problema persistir, entre em contato com o suporte
                </p>
              </div>
            </div>
          </div>

          <!-- Dica -->
          <div class="mt-4 text-center">
            <p class="text-sm text-slate-600">
              💡 Dica: Tente atualizar a página ou limpar o cache do navegador
            </p>
          </div>
        </div>
      </div>
    } @else {
      <ng-content />
    }
  `,
  styles: [`
    @keyframes bounce {
      0%, 100% {
        transform: translateY(-10%);
        animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
      }
      50% {
        transform: translateY(0);
        animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
      }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }
  `]
})
export class ErrorBoundaryComponent {
  // Icons
  AlertTriangle = AlertTriangle;
  RefreshCw = RefreshCw;
  Home = Home;

  // Services
  private router = inject(Router);

  // State
  hasError = signal(false);
  errorMessage = signal('');
  errorStack = signal('');
  showDetails = signal(!this.isProduction());

  /**
   * Captura erros não tratados globalmente
   */
  @HostListener('window:error', ['$event'])
  handleError(event: ErrorEvent): void {
    event.preventDefault();
    this.captureError(event.error || event.message, event.error?.stack);
  }

  /**
   * Captura erros de promises não tratadas
   */
  @HostListener('window:unhandledrejection', ['$event'])
  handleUnhandledRejection(event: PromiseRejectionEvent): void {
    event.preventDefault();
    this.captureError(event.reason?.message || event.reason, event.reason?.stack);
  }

  /**
   * Registra o erro e atualiza o estado
   */
  private captureError(message: string, stack?: string): void {
    console.group('🛑 Error Boundary capturou erro');
    console.error('Mensagem:', message);
    console.error('Stack:', stack);
    console.groupEnd();

    this.hasError.set(true);
    this.errorMessage.set(this.formatErrorMessage(message));
    this.errorStack.set(stack || 'Stack trace não disponível');
  }

  /**
   * Formata mensagem de erro para exibição amigável
   */
  private formatErrorMessage(message: string): string {
    if (!message) return 'Erro desconhecido';

    // Simplificar mensagens técnicas
    if (message.includes('Cannot read properties')) {
      return 'Erro ao acessar dados. Alguns dados podem estar indisponíveis.';
    }
    if (message.includes('Network')) {
      return 'Erro de conexão. Verifique sua internet.';
    }
    if (message.includes('timeout')) {
      return 'A operação demorou muito. Tente novamente.';
    }

    return message.length > 100 
      ? message.substring(0, 100) + '...' 
      : message;
  }

  /**
   * Tenta recuperar do erro recarregando a página
   */
  retry(): void {
    this.hasError.set(false);
    this.errorMessage.set('');
    this.errorStack.set('');
    window.location.reload();
  }

  /**
   * Navega para a página inicial
   */
  goHome(): void {
    this.hasError.set(false);
    this.errorMessage.set('');
    this.errorStack.set('');
    this.router.navigate(['/']);
  }

  /**
   * Verifica se está em produção
   */
  private isProduction(): boolean {
    return false; // TODO: Implementar detecção de ambiente
  }
}
