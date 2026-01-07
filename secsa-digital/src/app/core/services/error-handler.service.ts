import { Injectable, ErrorHandler, inject } from '@angular/core';
import { ToastService } from './toast.service';
import { ErrorLogService } from './error-log.service';
import * as Sentry from '@sentry/angular';
import { environment } from '../../../environments/environment';

/**
 * Serviço global de tratamento de erros
 * Implementa ErrorHandler do Angular para capturar erros não tratados
 * 
 * @example
 * // No app.config.ts
 * providers: [
 *   { provide: ErrorHandler, useClass: GlobalErrorHandlerService }
 * ]
 */
@Injectable({
  providedIn: 'root'
})
export class GlobalErrorHandlerService implements ErrorHandler {
  private toastService = inject(ToastService);
  private errorLogService = inject(ErrorLogService);

  handleError(error: any): void {
    console.group('❌ Erro capturado pelo ErrorHandler');
    console.error('Erro:', error);
    console.error('Stack:', error?.stack);
    console.error('Mensagem:', error?.message);
    console.groupEnd();

    // Registrar no log
    this.errorLogService.logError(error);

    // Enviar para Sentry se habilitado
    if (environment.sentry.enabled) {
      Sentry.captureException(error);
    }

    // Determinar tipo de erro e mensagem apropriada
    const errorMessage = this.getErrorMessage(error);
    
    // Mostrar toast para o usuário
    this.toastService.show(errorMessage, 'error');
  }

  private getErrorMessage(error: any): string {
    // Erros de HTTP
    if (error?.status) {
      switch (error.status) {
        case 400:
          return 'Requisição inválida. Verifique os dados enviados.';
        case 401:
          return 'Não autorizado. Faça login novamente.';
        case 403:
          return 'Acesso negado.';
        case 404:
          return 'Recurso não encontrado.';
        case 500:
          return 'Erro no servidor. Tente novamente mais tarde.';
        default:
          return `Erro HTTP ${error.status}`;
      }
    }

    // Erros do Firebase
    if (error?.code) {
      return this.getFirebaseErrorMessage(error.code);
    }

    // Erros de validação
    if (error?.message?.includes('required')) {
      return 'Preencha todos os campos obrigatórios.';
    }

    // Erro genérico
    return error?.message || 'Ocorreu um erro inesperado. Tente novamente.';
  }

  private getFirebaseErrorMessage(code: string): string {
    const firebaseErrors: Record<string, string> = {
      'permission-denied': 'Você não tem permissão para acessar este recurso.',
      'not-found': 'Documento não encontrado.',
      'already-exists': 'Este registro já existe.',
      'resource-exhausted': 'Limite de requisições excedido. Aguarde um momento.',
      'unauthenticated': 'Você precisa fazer login.',
      'unavailable': 'Serviço temporariamente indisponível. Tente novamente.',
      'deadline-exceeded': 'Operação demorou muito. Tente novamente.',
      'cancelled': 'Operação cancelada.',
      'invalid-argument': 'Dados inválidos fornecidos.',
      'failed-precondition': 'Operação não pode ser executada no estado atual.'
    };

    return firebaseErrors[code] || `Erro do Firebase: ${code}`;
  }
}
