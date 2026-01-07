import { Injectable, signal } from '@angular/core';
import * as Sentry from '@sentry/angular';
import { environment } from '../../../environments/environment';

export interface ErrorLog {
  id: string;
  timestamp: Date;
  message: string;
  stack?: string;
  type: 'sync' | 'async' | 'http' | 'firebase' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: any;
  userAgent?: string;
}

/**
 * Serviço para logging e visualização de erros
 * Armazena erros em memória e permite integração com serviços externos
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorLogService {
  private errors = signal<ErrorLog[]>([]);
  private maxErrors = 100; // Limite de erros armazenados

  /**
   * Signal readonly para consumo nos componentes
   */
  readonly errorLogs = this.errors.asReadonly();

  /**
   * Estatísticas computadas
   */
  get totalErrors(): number {
    return this.errors().length;
  }

  get criticalErrors(): number {
    return this.errors().filter(e => e.severity === 'critical').length;
  }

  get highErrors(): number {
    return this.errors().filter(e => e.severity === 'high').length;
  }

  /**
   * Adiciona um erro ao log
   */
  logError(error: any, context?: any): void {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date(),
      message: this.extractMessage(error),
      stack: error?.stack,
      type: this.detectType(error),
      severity: this.detectSeverity(error),
      context,
      userAgent: navigator.userAgent
    };

    // Adiciona no início do array
    this.errors.update(errors => {
      const updated = [errorLog, ...errors];
      // Mantém apenas os últimos N erros
      return updated.slice(0, this.maxErrors);
    });

    console.log('📝 Erro registrado no log:', errorLog);
  }

  /**
   * Limpa todos os erros
   */
  clearLogs(): void {
    this.errors.set([]);
    console.log('🗑️ Logs de erro limpos');
  }

  /**
   * Exporta erros como JSON
   */
  exportAsJSON(): string {
    return JSON.stringify(this.errors(), null, 2);
  }

  /**
   * Exporta erros como CSV
   */
  exportAsCSV(): string {
    const headers = ['Timestamp', 'Tipo', 'Severidade', 'Mensagem'];
    const rows = this.errors().map(e => [
      e.timestamp.toISOString(),
      e.type,
      e.severity,
      `"${e.message.replace(/"/g, '""')}"`
    ]);

    return [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');
  }

  /**
   * Envia erros para Sentry
   */
  async sendToSentry(): Promise<void> {
    if (!environment.sentry.enabled) {
      console.warn('⚠️ Sentry não está habilitado. Configure o DSN em environment.ts');
      alert('Sentry não configurado. Veja o console para instruções.');
      return;
    }

    console.group('📤 Enviando erros para Sentry');
    
    try {
      // Enviar os últimos 10 erros para o Sentry
      const recentErrors = this.errors().slice(0, 10);
      
      for (const errorLog of recentErrors) {
        Sentry.captureException(new Error(errorLog.message), {
          level: this.mapSeverityToSentryLevel(errorLog.severity),
          tags: {
            type: errorLog.type,
            severity: errorLog.severity
          },
          extra: {
            stack: errorLog.stack,
            context: errorLog.context,
            userAgent: errorLog.userAgent,
            timestamp: errorLog.timestamp
          }
        });
      }

      console.log('✅ Enviados', recentErrors.length, 'erros para Sentry');
      console.log('🔗 Acesse:', 'https://sentry.io');
      alert(`✅ ${recentErrors.length} erros enviados para o Sentry!`);
    } catch (error) {
      console.error('❌ Erro ao enviar para Sentry:', error);
      alert('Erro ao enviar para Sentry. Veja o console.');
    }
    
    console.groupEnd();
  }

  private mapSeverityToSentryLevel(severity: ErrorLog['severity']): Sentry.SeverityLevel {
    const map: Record<ErrorLog['severity'], Sentry.SeverityLevel> = {
      'low': 'info',
      'medium': 'warning',
      'high': 'error',
      'critical': 'fatal'
    };
    return map[severity];
  }

  /**
   * Envia erros para LogRocket (simulado)
   */
  async sendToLogRocket(): Promise<void> {
    console.group('📤 Enviando para LogRocket');
    console.log('Total de erros:', this.totalErrors);
    console.log('Últimos 5 erros:', this.errors().slice(0, 5));
    console.log('⚠️ LogRocket não configurado - esta é uma simulação');
    console.log('Para configurar LogRocket:');
    console.log('1. npm install logrocket');
    console.log('2. Configure no app.config.ts');
    console.log('3. Adicione App ID do LogRocket');
    console.groupEnd();
  }

  /**
   * Envia erros para servidor próprio (simulado)
   */
  async sendToCustomServer(): Promise<void> {
    console.group('📤 Enviando para servidor próprio');
    console.log('Endpoint:', 'https://api.secsa.com.br/errors');
    console.log('Método:', 'POST');
    console.log('Payload:', {
      errors: this.errors().slice(0, 10),
      totalErrors: this.totalErrors,
      timestamp: new Date().toISOString()
    });
    console.log('⚠️ Endpoint não configurado - esta é uma simulação');
    console.groupEnd();
  }

  /**
   * Envia email com erros (simulado)
   */
  async sendEmail(): Promise<void> {
    console.group('📧 Enviando email com erros');
    console.log('Para:', 'admin@secsa.com.br');
    console.log('Assunto:', `[SECSA] ${this.criticalErrors} erros críticos detectados`);
    console.log('Conteúdo:', this.errors().slice(0, 5));
    console.log('⚠️ Serviço de email não configurado - esta é uma simulação');
    console.groupEnd();
  }

  // Helpers privados

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private extractMessage(error: any): string {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.error?.message) return error.error.message;
    return 'Erro desconhecido';
  }

  private detectType(error: any): ErrorLog['type'] {
    if (error?.status) return 'http';
    if (error?.code) return 'firebase';
    if (error instanceof Promise) return 'async';
    if (error?.message?.includes('Cannot read properties')) return 'sync';
    return 'unknown';
  }

  private detectSeverity(error: any): ErrorLog['severity'] {
    const message = this.extractMessage(error).toLowerCase();

    // Crítico
    if (message.includes('permission') || 
        message.includes('unauthorized') ||
        message.includes('critical') ||
        error?.status === 401 ||
        error?.status === 403) {
      return 'critical';
    }

    // Alto
    if (message.includes('not found') ||
        message.includes('null') ||
        message.includes('undefined') ||
        error?.status === 500 ||
        error?.status === 404) {
      return 'high';
    }

    // Médio
    if (message.includes('timeout') ||
        message.includes('network') ||
        error?.status === 400) {
      return 'medium';
    }

    // Baixo
    return 'low';
  }
}
