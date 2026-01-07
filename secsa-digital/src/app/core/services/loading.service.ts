import { Injectable, signal } from '@angular/core';

/**
 * Serviço para gerenciar estado de loading global da aplicação
 * 
 * @example
 * // Em um componente ou serviço
 * constructor(private loadingService: LoadingService) {}
 * 
 * async loadData() {
 *   this.loadingService.show();
 *   try {
 *     await this.fetchData();
 *   } finally {
 *     this.loadingService.hide();
 *   }
 * }
 */
@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loading = signal(false);
  private requestCount = signal(0);

  /**
   * Signal readonly para consumo nos componentes
   */
  isLoading = this.loading.asReadonly();

  /**
   * Mostra o indicador de loading
   * Incrementa o contador de requisições ativas
   */
  show() {
    this.requestCount.update(count => count + 1);
    this.loading.set(true);
    console.log('🔄 Loading iniciado. Requisições ativas:', this.requestCount());
  }

  /**
   * Esconde o indicador de loading
   * Decrementa o contador e só esconde quando chegar a zero
   */
  hide() {
    this.requestCount.update(count => Math.max(0, count - 1));
    
    if (this.requestCount() === 0) {
      this.loading.set(false);
      console.log('✅ Loading finalizado');
    } else {
      console.log('⏳ Ainda há requisições ativas:', this.requestCount());
    }
  }

  /**
   * Força o reset do loading (útil em casos de erro)
   */
  reset() {
    this.requestCount.set(0);
    this.loading.set(false);
    console.log('🔄 Loading resetado');
  }
}
