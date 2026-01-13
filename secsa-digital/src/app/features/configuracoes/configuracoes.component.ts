import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LayoutComponent } from '../../shared/components/layout.component';
import { ButtonComponent } from '../../shared/components/button.component';
import { InputComponent } from '../../shared/components/input.component';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { LucideAngularModule, Settings, Users, Database, Shield, Bell, Palette } from 'lucide-angular';

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LayoutComponent,
    ButtonComponent,
    InputComponent,
    LucideAngularModule
  ],
  template: `
    <app-layout>
      <span header>Configurações do Sistema</span>

      <div class="space-y-6">
        <!-- Seções de Configuração -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Gerenciar Usuários -->
          <button
            type="button"
            (click)="activeSection.set('usuarios')"
            [class.ring-2]="activeSection() === 'usuarios'"
            [class.ring-primary]="activeSection() === 'usuarios'"
            class="bg-white rounded-lg shadow-sm p-6 text-left hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <lucide-icon [img]="Users" class="w-8 h-8 text-primary mb-3" aria-hidden="true" />
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Usuários</h3>
            <p class="text-sm text-gray-600">Gerenciar usuários do sistema</p>
          </button>

          <!-- Banco de Dados -->
          <button
            type="button"
            (click)="activeSection.set('database')"
            [class.ring-2]="activeSection() === 'database'"
            [class.ring-primary]="activeSection() === 'database'"
            class="bg-white rounded-lg shadow-sm p-6 text-left hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <lucide-icon [img]="Database" class="w-8 h-8 text-primary mb-3" aria-hidden="true" />
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Banco de Dados</h3>
            <p class="text-sm text-gray-600">Backup e manutenção</p>
          </button>

          <!-- Segurança -->
          <button
            type="button"
            (click)="activeSection.set('seguranca')"
            [class.ring-2]="activeSection() === 'seguranca'"
            [class.ring-primary]="activeSection() === 'seguranca'"
            class="bg-white rounded-lg shadow-sm p-6 text-left hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <lucide-icon [img]="Shield" class="w-8 h-8 text-primary mb-3" aria-hidden="true" />
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Segurança</h3>
            <p class="text-sm text-gray-600">Configurações de segurança</p>
          </button>

          <!-- Notificações -->
          <button
            type="button"
            (click)="activeSection.set('notificacoes')"
            [class.ring-2]="activeSection() === 'notificacoes'"
            [class.ring-primary]="activeSection() === 'notificacoes'"
            class="bg-white rounded-lg shadow-sm p-6 text-left hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <lucide-icon [img]="Bell" class="w-8 h-8 text-primary mb-3" aria-hidden="true" />
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Notificações</h3>
            <p class="text-sm text-gray-600">Configurar alertas e emails</p>
          </button>

          <!-- Aparência -->
          <button
            type="button"
            (click)="activeSection.set('aparencia')"
            [class.ring-2]="activeSection() === 'aparencia'"
            [class.ring-primary]="activeSection() === 'aparencia'"
            class="bg-white rounded-lg shadow-sm p-6 text-left hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <lucide-icon [img]="Palette" class="w-8 h-8 text-primary mb-3" aria-hidden="true" />
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Aparência</h3>
            <p class="text-sm text-gray-600">Personalizar interface</p>
          </button>

          <!-- Sistema -->
          <button
            type="button"
            (click)="activeSection.set('sistema')"
            [class.ring-2]="activeSection() === 'sistema'"
            [class.ring-primary]="activeSection() === 'sistema'"
            class="bg-white rounded-lg shadow-sm p-6 text-left hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <lucide-icon [img]="Settings" class="w-8 h-8 text-primary mb-3" aria-hidden="true" />
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Sistema</h3>
            <p class="text-sm text-gray-600">Informações do sistema</p>
          </button>
        </div>

        <!-- Conteúdo da Seção Ativa -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          @switch (activeSection()) {
            @case ('usuarios') {
              <div>
                <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <lucide-icon [img]="Users" class="w-6 h-6 text-primary" aria-hidden="true" />
                  Gerenciamento de Usuários
                </h2>
                <p class="text-gray-600 mb-6">
                  Aqui você pode criar, editar e gerenciar os usuários do sistema.
                </p>
                
                <div class="border-t pt-6">
                  <h3 class="font-semibold text-gray-900 mb-4">Criar Novo Usuário</h3>
                  <form [formGroup]="userForm" (ngSubmit)="onCreateUser()" class="space-y-4 max-w-2xl">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <app-input
                        [id]="'displayName'"
                        [label]="'Nome completo'"
                        [type]="'text'"
                        [placeholder]="'Digite o nome'"
                        formControlName="displayName"
                        [required]="true"
                        [error]="getFieldError('displayName')"
                      />
                      
                      <app-input
                        [id]="'email'"
                        [label]="'Email'"
                        [type]="'email'"
                        [placeholder]="'email@exemplo.com'"
                        formControlName="email"
                        [required]="true"
                        [error]="getFieldError('email')"
                      />
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <app-input
                        [id]="'password'"
                        [label]="'Senha'"
                        [type]="'password'"
                        [placeholder]="'Mínimo 6 caracteres'"
                        formControlName="password"
                        [required]="true"
                        [error]="getFieldError('password')"
                        [helperText]="'A senha deve ter pelo menos 6 caracteres'"
                      />
                      
                      <div>
                        <label for="role" class="block text-xs font-semibold text-slate-600 mb-2">
                          Tipo de usuário
                          <span class="text-error">*</span>
                        </label>
                        <select
                          id="role"
                          formControlName="role"
                          class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                          [class.border-error]="isFieldInvalid('role')"
                        >
                          <option value="">Selecione...</option>
                          <option value="admin">Administrador</option>
                          <option value="funcionario">Funcionário</option>
                          <option value="paciente">Paciente</option>
                        </select>
                        @if (isFieldInvalid('role')) {
                          <p class="mt-1 text-xs text-error">Selecione um tipo de usuário</p>
                        }
                      </div>
                    </div>

                    <div class="flex gap-3 pt-4">
                      <app-button
                        type="submit"
                        variant="primary"
                        [loading]="savingUser()"
                        [disabled]="userForm.invalid || savingUser()"
                      >
                        Criar Usuário
                      </app-button>
                      <app-button
                        type="button"
                        variant="secondary"
                        (onClick)="userForm.reset()"
                      >
                        Limpar
                      </app-button>
                    </div>
                  </form>
                </div>
              </div>
            }

            @case ('database') {
              <div>
                <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <lucide-icon [img]="Database" class="w-6 h-6 text-primary" aria-hidden="true" />
                  Banco de Dados
                </h2>
                <p class="text-gray-600 mb-6">
                  Ferramentas de manutenção e backup do banco de dados.
                </p>
                <div class="text-center py-8">
                  <p class="text-gray-500">Funcionalidade em desenvolvimento</p>
                </div>
              </div>
            }

            @case ('seguranca') {
              <div>
                <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <lucide-icon [img]="Shield" class="w-6 h-6 text-primary" aria-hidden="true" />
                  Segurança
                </h2>
                <p class="text-gray-600 mb-6">
                  Configure políticas de segurança e permissões.
                </p>
                <div class="text-center py-8">
                  <p class="text-gray-500">Funcionalidade em desenvolvimento</p>
                </div>
              </div>
            }

            @case ('notificacoes') {
              <div>
                <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <lucide-icon [img]="Bell" class="w-6 h-6 text-primary" aria-hidden="true" />
                  Notificações
                </h2>
                <p class="text-gray-600 mb-6">
                  Configure alertas e notificações por email.
                </p>
                <div class="text-center py-8">
                  <p class="text-gray-500">Funcionalidade em desenvolvimento</p>
                </div>
              </div>
            }

            @case ('aparencia') {
              <div>
                <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <lucide-icon [img]="Palette" class="w-6 h-6 text-primary" aria-hidden="true" />
                  Aparência
                </h2>
                <p class="text-gray-600 mb-6">
                  Personalize cores e tema da interface.
                </p>
                <div class="text-center py-8">
                  <p class="text-gray-500">Funcionalidade em desenvolvimento</p>
                </div>
              </div>
            }

            @case ('sistema') {
              <div>
                <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <lucide-icon [img]="Settings" class="w-6 h-6 text-primary" aria-hidden="true" />
                  Informações do Sistema
                </h2>
                <div class="space-y-4">
                  <div class="grid grid-cols-2 gap-4">
                    <div class="border rounded-lg p-4">
                      <p class="text-sm text-gray-600 mb-1">Versão</p>
                      <p class="text-lg font-semibold text-gray-900">1.0.0</p>
                    </div>
                    <div class="border rounded-lg p-4">
                      <p class="text-sm text-gray-600 mb-1">Ambiente</p>
                      <p class="text-lg font-semibold text-gray-900">Desenvolvimento</p>
                    </div>
                    <div class="border rounded-lg p-4">
                      <p class="text-sm text-gray-600 mb-1">Usuário Atual</p>
                      <p class="text-lg font-semibold text-gray-900">{{ currentUser()?.displayName }}</p>
                    </div>
                    <div class="border rounded-lg p-4">
                      <p class="text-sm text-gray-600 mb-1">Perfil</p>
                      <p class="text-lg font-semibold text-gray-900">Administrador</p>
                    </div>
                  </div>
                </div>
              </div>
            }

            @default {
              <div class="text-center py-12">
                <lucide-icon [img]="Settings" class="w-16 h-16 text-gray-300 mx-auto mb-4" aria-hidden="true" />
                <p class="text-gray-500">Selecione uma seção de configuração</p>
              </div>
            }
          }
        </div>
      </div>
    </app-layout>
  `
})
export class ConfiguracoesComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  // Icons
  Settings = Settings;
  Users = Users;
  Database = Database;
  Shield = Shield;
  Bell = Bell;
  Palette = Palette;

  // Signals
  activeSection = signal<string>('usuarios');
  savingUser = signal(false);

  // Data
  currentUser = this.authService.currentUser;

  // Form
  userForm: FormGroup;

  constructor() {
    this.userForm = this.fb.group({
      displayName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', Validators.required]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (field && field.invalid && field.touched) {
      if (field.errors?.['required']) {
        return 'Campo obrigatório';
      }
      if (field.errors?.['email']) {
        return 'Email inválido';
      }
      if (field.errors?.['minlength']) {
        return 'Mínimo de 6 caracteres';
      }
    }
    return '';
  }

  async onCreateUser(): Promise<void> {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.savingUser.set(true);

    try {
      const formData = this.userForm.value;
      await this.authService.register(formData);
      this.toastService.success('Usuário criado com sucesso!');
      this.userForm.reset();
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      // O AuthService já exibe o toast de erro
    } finally {
      this.savingUser.set(false);
    }
  }
}
