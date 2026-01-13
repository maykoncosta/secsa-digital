import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LayoutComponent } from '../../shared/components/layout.component';
import { ButtonComponent } from '../../shared/components/button.component';
import { InputComponent } from '../../shared/components/input.component';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { LucideAngularModule, Settings, Users, Bell, Palette, Building2 } from 'lucide-angular';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';

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
          <!-- Instituição -->
          <button
            type="button"
            (click)="activeSection.set('instituicao')"
            [class.ring-2]="activeSection() === 'instituicao'"
            [class.ring-primary]="activeSection() === 'instituicao'"
            class="bg-white rounded-lg shadow-sm p-6 text-left hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <lucide-icon [img]="Building2" class="w-8 h-8 text-primary mb-3" aria-hidden="true" />
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Instituição</h3>
            <p class="text-sm text-gray-600">Dados da instituição</p>
          </button>
          
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
            @case ('instituicao') {
              <div>
                <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <lucide-icon [img]="Building2" class="w-6 h-6 text-primary" aria-hidden="true" />
                  Dados da Instituição
                </h2>
                <p class="text-gray-600 mb-6">
                  Configure as informações da sua instituição que serão exibidas nos laudos e relatórios.
                </p>
                
                <form [formGroup]="instituicaoForm" (ngSubmit)="salvarInstituicao()" class="space-y-6 max-w-3xl">
                  <div class="space-y-4">
                    <app-input
                      [id]="'nomeInstituicao'"
                      [label]="'Nome da Instituição'"
                      [type]="'text'"
                      [placeholder]="'Ex: Laboratório SECSA'"
                      formControlName="nome"
                      [required]="true"
                    />
                    
                    <app-input
                      [id]="'cnpj'"
                      [label]="'CNPJ'"
                      [type]="'text'"
                      [placeholder]="'00.000.000/0000-00'"
                      formControlName="cnpj"
                    />
                    
                    <app-input
                      [id]="'endereco'"
                      [label]="'Endereço Completo'"
                      [type]="'text'"
                      [placeholder]="'Rua, Número, Bairro, Cidade - UF, CEP'"
                      formControlName="endereco"
                    />
                    
                    <app-input
                      [id]="'telefone'"
                      [label]="'Telefone'"
                      [type]="'text'"
                      [placeholder]="'(00) 0000-0000'"
                      formControlName="telefone"
                    />
                    
                    <app-input
                      [id]="'email'"
                      [label]="'E-mail'"
                      [type]="'email'"
                      [placeholder]="'contato@laboratorio.com.br'"
                      formControlName="email"
                    />
                    
                    <div>
                      <label class="block text-sm font-semibold text-gray-700 mb-2">
                        Logo da Instituição
                      </label>
                      <div class="flex items-center gap-4">
                        @if (logoPreview()) {
                          <img [src]="logoPreview()" alt="Logo" class="h-20 w-20 object-contain border rounded" />
                        }
                        <div class="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            (change)="onLogoChange($event)"
                            class="block w-full text-sm text-gray-500
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-lg file:border-0
                              file:text-sm file:font-semibold
                              file:bg-primary file:text-white
                              hover:file:bg-primary-dark
                              file:cursor-pointer cursor-pointer"
                          />
                          <p class="mt-1 text-xs text-gray-500">
                            PNG, JPG ou SVG (máx. 2MB)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="flex gap-3 pt-4 border-t">
                    <app-button
                      type="submit"
                      variant="primary"
                      [loading]="salvandoInstituicao()"
                      [disabled]="instituicaoForm.invalid || salvandoInstituicao()"
                    >
                      {{ salvandoInstituicao() ? 'Salvando...' : 'Salvar Configurações' }}
                    </app-button>
                  </div>
                </form>
              </div>
            }
            
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
  private firestore = inject(Firestore);

  // Icons
  Settings = Settings;
  Users = Users;
  Bell = Bell;
  Palette = Palette;
  Building2 = Building2;

  // Signals
  activeSection = signal<string>('instituicao');
  savingUser = signal(false);
  salvandoInstituicao = signal(false);
  logoPreview = signal<string | null>(null);

  // Data
  currentUser = this.authService.currentUser;

  // Forms
  userForm: FormGroup;
  instituicaoForm: FormGroup;
  logoFile: File | null = null;

  constructor() {
    this.userForm = this.fb.group({
      displayName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', Validators.required]
    });

    this.instituicaoForm = this.fb.group({
      nome: ['', Validators.required],
      cnpj: [''],
      endereco: [''],
      telefone: [''],
      email: ['', Validators.email]
    });

    this.carregarDadosInstituicao();
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

  async carregarDadosInstituicao(): Promise<void> {
    try {
      const configDoc = await getDoc(doc(this.firestore, 'configuracoes', 'instituicao'));
      
      if (configDoc.exists()) {
        const data = configDoc.data();
        this.instituicaoForm.patchValue({
          nome: data['nome'] || '',
          cnpj: data['cnpj'] || '',
          endereco: data['endereco'] || '',
          telefone: data['telefone'] || '',
          email: data['email'] || ''
        });
        
        if (data['logoUrl']) {
          this.logoPreview.set(data['logoUrl']);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados da instituição:', error);
    }
  }

  onLogoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validar tamanho (2MB)
      if (file.size > 2 * 1024 * 1024) {
        this.toastService.error('A imagem deve ter no máximo 2MB');
        return;
      }
      
      // Validar tipo
      if (!file.type.startsWith('image/')) {
        this.toastService.error('Apenas imagens são permitidas');
        return;
      }
      
      this.logoFile = file;
      
      // Preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.logoPreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  async salvarInstituicao(): Promise<void> {
    if (this.instituicaoForm.invalid) {
      this.instituicaoForm.markAllAsTouched();
      this.toastService.error('Preencha todos os campos obrigatórios');
      return;
    }

    this.salvandoInstituicao.set(true);

    try {
      const dados: any = {
        ...this.instituicaoForm.value,
        updatedAt: new Date()
      };
      
      // Se houver logo, converter para base64 e salvar
      if (this.logoFile) {
        const reader = new FileReader();
        const logoBase64 = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(this.logoFile!);
        });
        dados.logoUrl = logoBase64;
      } else if (this.logoPreview()) {
        dados.logoUrl = this.logoPreview();
      }
      
      await setDoc(doc(this.firestore, 'configuracoes', 'instituicao'), dados);
      
      this.toastService.success('Configurações salvas com sucesso!');
      this.logoFile = null;
      
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      this.toastService.error('Erro ao salvar configurações');
    } finally {
      this.salvandoInstituicao.set(false);
    }
  }
}
