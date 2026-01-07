import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../shared/components/button.component';
import { LayoutComponent } from '../../shared/components/layout.component';
import { LucideAngularModule, Bomb } from 'lucide-angular';

/**
 * Componente de teste para Error Boundary
 * APENAS PARA DESENVOLVIMENTO - Não usar em produção
 * 
 * Este componente tem vários botões que disparam diferentes tipos de erros
 * para testar o Error Boundary
 */
@Component({
  selector: 'app-error-test',
  standalone: true,
  imports: [CommonModule, ButtonComponent, LayoutComponent, LucideAngularModule],
  template: `
    <app-layout>
      <div header>
        <div class="flex items-center gap-2">
          <lucide-icon [img]="Bomb" class="w-5 h-5 text-red-500" />
          Error Boundary - Testes
        </div>
      </div>

      <div class="space-y-6">
        <!-- Warning -->
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div class="flex items-start gap-3">
            <lucide-icon [img]="Bomb" class="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 class="font-semibold text-yellow-900">⚠️ Componente de Teste</h3>
              <p class="text-sm text-yellow-700 mt-1">
                Este componente existe apenas para testar o Error Boundary.
                Os botões abaixo disparam erros propositalmente.
              </p>
            </div>
          </div>
        </div>

        <!-- Testes -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-semibold text-slate-900 mb-4">Tipos de Erro</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Erro Sync -->
            <div class="border border-slate-200 rounded-lg p-4">
              <h3 class="font-medium text-slate-900 mb-2">1. Erro Síncrono</h3>
              <p class="text-sm text-slate-600 mb-3">
                Dispara erro imediato (TypeError)
              </p>
              <app-button
                variant="danger"
                (onClick)="throwSyncError()"
              >
                Disparar Erro Sync
              </app-button>
            </div>

            <!-- Erro Async -->
            <div class="border border-slate-200 rounded-lg p-4">
              <h3 class="font-medium text-slate-900 mb-2">2. Erro Assíncrono</h3>
              <p class="text-sm text-slate-600 mb-3">
                Promise rejeitada não tratada
              </p>
              <app-button
                variant="danger"
                (onClick)="throwAsyncError()"
              >
                Disparar Erro Async
              </app-button>
            </div>

            <!-- Erro de Acesso -->
            <div class="border border-slate-200 rounded-lg p-4">
              <h3 class="font-medium text-slate-900 mb-2">3. Erro de Acesso</h3>
              <p class="text-sm text-slate-600 mb-3">
                Tentar acessar propriedade de undefined
              </p>
              <app-button
                variant="danger"
                (onClick)="throwAccessError()"
              >
                Disparar Erro Acesso
              </app-button>
            </div>

            <!-- Erro de Timeout -->
            <div class="border border-slate-200 rounded-lg p-4">
              <h3 class="font-medium text-slate-900 mb-2">4. Erro Atrasado</h3>
              <p class="text-sm text-slate-600 mb-3">
                Erro após 2 segundos (setTimeout)
              </p>
              <app-button
                variant="danger"
                (onClick)="throwDelayedError()"
              >
                Disparar Erro Atrasado
              </app-button>
            </div>
          </div>
        </div>

        <!-- Instruções -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 class="font-semibold text-blue-900 mb-2">📝 Como testar:</h3>
          <ol class="text-sm text-blue-700 space-y-1 ml-4 list-decimal">
            <li>Clique em qualquer botão de erro</li>
            <li>Observe o Error Boundary capturando o erro</li>
            <li>Veja a interface amigável de erro</li>
            <li>Teste os botões "Tentar Novamente" e "Voltar ao Início"</li>
            <li>Abra o console para ver os logs detalhados</li>
          </ol>
        </div>
      </div>
    </app-layout>
  `,
  styles: []
})
export class ErrorTestComponent {
  Bomb = Bomb;

  /**
   * Dispara um erro síncrono imediato
   */
  throwSyncError(): void {
    console.log('💣 Disparando erro síncrono...');
    throw new Error('Erro síncrono de teste - TypeError');
  }

  /**
   * Dispara um erro assíncrono (Promise rejeitada)
   */
  async throwAsyncError(): Promise<void> {
    console.log('💣 Disparando erro assíncrono...');
    await Promise.reject(new Error('Erro assíncrono de teste - Promise rejeitada'));
  }

  /**
   * Tenta acessar propriedade de objeto undefined
   */
  throwAccessError(): void {
    console.log('💣 Disparando erro de acesso...');
    const obj: any = null;
    console.log(obj.propriedade.naoExiste);
  }

  /**
   * Dispara erro após delay
   */
  throwDelayedError(): void {
    console.log('💣 Disparando erro atrasado em 2 segundos...');
    setTimeout(() => {
      throw new Error('Erro atrasado de teste - setTimeout');
    }, 2000);
  }
}
