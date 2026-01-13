import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../core/services/loading.service';
import { LucideAngularModule, Loader2 } from 'lucide-angular';

/**
 * Componente de indicador de loading global
 * Mostra um spinner no topo da tela quando há requisições em andamento
 * 
 * @example
 * // No app.component.ts (template)
 * <app-loading-indicator />
 * <router-outlet />
 */
@Component({
  selector: 'app-loading-indicator',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    @if (isLoading()) {
      <div 
        class="fixed top-0 left-0 right-0 z-50 bg-primary shadow-lg"
        role="status"
        aria-live="polite"
        aria-label="Carregando conteúdo"
      >
        <div class="h-1 bg-primary-dark animate-pulse" aria-hidden="true"></div>
        <div class="flex items-center justify-center gap-2 py-2 px-4 bg-primary/95 backdrop-blur-sm">
          <lucide-icon 
            [img]="Loader2" 
            class="w-4 h-4 text-white animate-spin"
            aria-hidden="true"
          />
          <span class="text-sm font-medium text-white">
            Carregando...
          </span>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
    
    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
    
    .animate-spin {
      animation: spin 1s linear infinite;
    }
  `]
})
export class LoadingIndicatorComponent {
  Loader2 = Loader2;
  
  private loadingService = inject(LoadingService);
  isLoading = computed(() => this.loadingService.isLoading());
}
