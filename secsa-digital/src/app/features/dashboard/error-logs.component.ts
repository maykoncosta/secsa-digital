import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from '../../shared/components/layout.component';
import { ButtonComponent } from '../../shared/components/button.component';
import { ErrorLogService, ErrorLog } from '../../core/services/error-log.service';
import { LucideAngularModule, AlertCircle, Download, Trash2, Send, Database, Mail, Server, CheckCircle } from 'lucide-angular';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-error-logs',
  standalone: true,
  imports: [CommonModule, LayoutComponent, ButtonComponent, LucideAngularModule],
  template: `
    <app-layout>
      <div header>Logs de Erros</div>

      <div class="space-y-6">
        <!-- Estatísticas -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-slate-600">Total de Erros</p>
                <p class="text-2xl font-bold text-slate-900 mt-1">
                  {{ errorLogService.totalErrors }}
                </p>
              </div>
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <lucide-icon [img]="AlertCircle" class="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-slate-600">Críticos</p>
                <p class="text-2xl font-bold text-red-600 mt-1">
                  {{ errorLogService.criticalErrors }}
                </p>
              </div>
              <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <lucide-icon [img]="AlertCircle" class="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-slate-600">Altos</p>
                <p class="text-2xl font-bold text-orange-600 mt-1">
                  {{ errorLogService.highErrors }}
                </p>
              </div>
              <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <lucide-icon [img]="AlertCircle" class="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-slate-600">Taxa de Sucesso</p>
                <p class="text-2xl font-bold text-green-600 mt-1">
                  {{ successRate() }}%
                </p>
              </div>
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <lucide-icon [img]="CheckCircle" class="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <!-- Ações -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-semibold text-slate-900 mb-4">Ações</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <!-- Exportar JSON -->
            <app-button
              variant="outline"
              (onClick)="exportJSON()"
            >
              <lucide-icon [img]="Download" class="w-4 h-4 mr-2" />
              Exportar JSON
            </app-button>

            <!-- Exportar CSV -->
            <app-button
              variant="outline"
              (onClick)="exportCSV()"
            >
              <lucide-icon [img]="Download" class="w-4 h-4 mr-2" />
              Exportar CSV
            </app-button>

            <!-- Limpar Logs -->
            <app-button
              variant="outline"
              (onClick)="clearLogs()"
            >
              <lucide-icon [img]="Trash2" class="w-4 h-4 mr-2" />
              Limpar Logs
            </app-button>
          </div>
        </div>

        <!-- Integrações -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-semibold text-slate-900 mb-4">
            Enviar Erros Para
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Sentry -->
            <div class="border border-slate-200 rounded-lg p-4">
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <lucide-icon [img]="Database" class="w-5 h-5 text-purple-600" />
                </div>
                <div class="flex-1">
                  <h3 class="font-semibold text-slate-900">Sentry</h3>
                  <p class="text-sm text-slate-600 mt-1">
                    Monitoramento de erros em tempo real
                  </p>
                  <div class="mt-3 space-y-2">
                    <p class="text-xs text-slate-500">Instalação:</p>
                    <code class="block text-xs bg-slate-50 p-2 rounded">
                      npm install @sentry/angular
                    </code>
                    <p class="text-xs text-slate-500 mt-2">Website:</p>
                    <a href="https://sentry.io" target="_blank" class="text-xs text-primary hover:underline">
                      https://sentry.io
                    </a>
                  </div>
                  <app-button
                    variant="primary"
                    size="sm"
                    (onClick)="sendToSentry()"
                    class="mt-3 w-full"
                  >
                    <lucide-icon [img]="Send" class="w-3 h-3 mr-1" />
                    Enviar (Simulado)
                  </app-button>
                </div>
              </div>
            </div>

            <!-- LogRocket -->
            <div class="border border-slate-200 rounded-lg p-4">
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <lucide-icon [img]="Database" class="w-5 h-5 text-blue-600" />
                </div>
                <div class="flex-1">
                  <h3 class="font-semibold text-slate-900">LogRocket</h3>
                  <p class="text-sm text-slate-600 mt-1">
                    Gravação de sessão + logs
                  </p>
                  <div class="mt-3 space-y-2">
                    <p class="text-xs text-slate-500">Instalação:</p>
                    <code class="block text-xs bg-slate-50 p-2 rounded">
                      npm install logrocket
                    </code>
                    <p class="text-xs text-slate-500 mt-2">Website:</p>
                    <a href="https://logrocket.com" target="_blank" class="text-xs text-primary hover:underline">
                      https://logrocket.com
                    </a>
                  </div>
                  <app-button
                    variant="primary"
                    size="sm"
                    (onClick)="sendToLogRocket()"
                    class="mt-3 w-full"
                  >
                    <lucide-icon [img]="Send" class="w-3 h-3 mr-1" />
                    Enviar (Simulado)
                  </app-button>
                </div>
              </div>
            </div>

            <!-- Servidor Próprio -->
            <div class="border border-slate-200 rounded-lg p-4">
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <lucide-icon [img]="Server" class="w-5 h-5 text-green-600" />
                </div>
                <div class="flex-1">
                  <h3 class="font-semibold text-slate-900">Servidor Próprio</h3>
                  <p class="text-sm text-slate-600 mt-1">
                    API customizada para logs
                  </p>
                  <div class="mt-3 space-y-2">
                    <p class="text-xs text-slate-500">Endpoint:</p>
                    <code class="block text-xs bg-slate-50 p-2 rounded">
                      POST /api/errors
                    </code>
                    <p class="text-xs text-slate-500 mt-2">Configurar em:</p>
                    <code class="text-xs text-slate-600">
                      environment.ts
                    </code>
                  </div>
                  <app-button
                    variant="primary"
                    size="sm"
                    (onClick)="sendToCustomServer()"
                    class="mt-3 w-full"
                  >
                    <lucide-icon [img]="Send" class="w-3 h-3 mr-1" />
                    Enviar (Simulado)
                  </app-button>
                </div>
              </div>
            </div>

            <!-- Email -->
            <div class="border border-slate-200 rounded-lg p-4">
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <lucide-icon [img]="Mail" class="w-5 h-5 text-orange-600" />
                </div>
                <div class="flex-1">
                  <h3 class="font-semibold text-slate-900">Email</h3>
                  <p class="text-sm text-slate-600 mt-1">
                    Notificações por email
                  </p>
                  <div class="mt-3 space-y-2">
                    <p class="text-xs text-slate-500">Para:</p>
                    <code class="block text-xs bg-slate-50 p-2 rounded">
                      admin@secsa.com.br
                    </code>
                    <p class="text-xs text-slate-500 mt-2">Serviço:</p>
                    <code class="text-xs text-slate-600">
                      SendGrid / AWS SES
                    </code>
                  </div>
                  <app-button
                    variant="primary"
                    size="sm"
                    (onClick)="sendEmail()"
                    class="mt-3 w-full"
                  >
                    <lucide-icon [img]="Send" class="w-3 h-3 mr-1" />
                    Enviar (Simulado)
                  </app-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Lista de Erros -->
        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-200">
            <h2 class="text-lg font-semibold text-slate-900">
              Últimos Erros ({{ errors().length }})
            </h2>
          </div>

          @if (errors().length === 0) {
            <div class="p-12 text-center">
              <lucide-icon [img]="CheckCircle" class="w-16 h-16 text-green-300 mx-auto mb-4" />
              <p class="text-slate-600">Nenhum erro registrado</p>
              <p class="text-sm text-slate-500 mt-2">
                Vá para <a href="/dashboard/error-test" class="text-primary hover:underline">Testes de Erro</a> para gerar erros
              </p>
            </div>
          } @else {
            <div class="divide-y divide-slate-200">
              @for (error of errors(); track error.id) {
                <div class="p-6 hover:bg-slate-50 transition-colors">
                  <div class="flex items-start gap-4">
                    <!-- Ícone de Severidade -->
                    <div 
                      class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      [class.bg-red-100]="error.severity === 'critical'"
                      [class.bg-orange-100]="error.severity === 'high'"
                      [class.bg-yellow-100]="error.severity === 'medium'"
                      [class.bg-blue-100]="error.severity === 'low'"
                    >
                      <lucide-icon 
                        [img]="AlertCircle" 
                        class="w-5 h-5"
                        [class.text-red-600]="error.severity === 'critical'"
                        [class.text-orange-600]="error.severity === 'high'"
                        [class.text-yellow-600]="error.severity === 'medium'"
                        [class.text-blue-600]="error.severity === 'low'"
                      />
                    </div>

                    <!-- Conteúdo -->
                    <div class="flex-1 min-w-0">
                      <!-- Cabeçalho -->
                      <div class="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <div class="flex items-center gap-2">
                            <span 
                              class="px-2 py-1 text-xs font-semibold rounded-full"
                              [class.bg-red-100]="error.severity === 'critical'"
                              [class.text-red-700]="error.severity === 'critical'"
                              [class.bg-orange-100]="error.severity === 'high'"
                              [class.text-orange-700]="error.severity === 'high'"
                              [class.bg-yellow-100]="error.severity === 'medium'"
                              [class.text-yellow-700]="error.severity === 'medium'"
                              [class.bg-blue-100]="error.severity === 'low'"
                              [class.text-blue-700]="error.severity === 'low'"
                            >
                              {{ error.severity.toUpperCase() }}
                            </span>
                            <span class="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded">
                              {{ error.type }}
                            </span>
                          </div>
                        </div>
                        <span class="text-xs text-slate-500 whitespace-nowrap">
                          {{ formatDate(error.timestamp) }}
                        </span>
                      </div>

                      <!-- Mensagem -->
                      <p class="text-sm text-slate-900 font-medium mb-2">
                        {{ error.message }}
                      </p>

                      <!-- Stack (collapsible) -->
                      @if (error.stack) {
                        <details class="mt-2">
                          <summary class="cursor-pointer text-xs text-slate-600 hover:text-slate-900">
                            Ver stack trace
                          </summary>
                          <pre class="mt-2 text-xs bg-slate-50 p-3 rounded overflow-auto max-h-40">{{ error.stack }}</pre>
                        </details>
                      }
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </app-layout>
  `,
  styles: []
})
export class ErrorLogsComponent {
  // Icons
  AlertCircle = AlertCircle;
  Download = Download;
  Trash2 = Trash2;
  Send = Send;
  Database = Database;
  Mail = Mail;
  Server = Server;
  CheckCircle = CheckCircle;

  // Services
  errorLogService = inject(ErrorLogService);
  private toastService = inject(ToastService);

  // State
  errors = this.errorLogService.errorLogs;
  
  successRate = computed(() => {
    const total = this.errorLogService.totalErrors;
    if (total === 0) return 100;
    const failed = total;
    const success = Math.max(0, total * 10 - failed); // Simulado
    return Math.round((success / (success + failed)) * 100);
  });

  formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Agora';
    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days < 7) return `${days}d atrás`;
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  exportJSON(): void {
    const json = this.errorLogService.exportAsJSON();
    this.downloadFile(json, 'error-logs.json', 'application/json');
    this.toastService.show('JSON exportado com sucesso', 'success');
  }

  exportCSV(): void {
    const csv = this.errorLogService.exportAsCSV();
    this.downloadFile(csv, 'error-logs.csv', 'text/csv');
    this.toastService.show('CSV exportado com sucesso', 'success');
  }

  clearLogs(): void {
    if (confirm('Tem certeza que deseja limpar todos os logs?')) {
      this.errorLogService.clearLogs();
      this.toastService.show('Logs limpos com sucesso', 'success');
    }
  }

  async sendToSentry(): Promise<void> {
    await this.errorLogService.sendToSentry();
    this.toastService.show('Verifique o console para detalhes', 'info');
  }

  async sendToLogRocket(): Promise<void> {
    await this.errorLogService.sendToLogRocket();
    this.toastService.show('Verifique o console para detalhes', 'info');
  }

  async sendToCustomServer(): Promise<void> {
    await this.errorLogService.sendToCustomServer();
    this.toastService.show('Verifique o console para detalhes', 'info');
  }

  async sendEmail(): Promise<void> {
    await this.errorLogService.sendEmail();
    this.toastService.show('Verifique o console para detalhes', 'info');
  }

  private downloadFile(content: string, filename: string, type: string): void {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
