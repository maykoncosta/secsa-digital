import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ButtonComponent } from '../../../shared/components/button.component';
import { LucideAngularModule, Lock, Mail, Eye, EyeOff } from 'lucide-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    LucideAngularModule
  ],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-md">
        <!-- Logo e Título -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-lg mb-4">
            <span class="text-3xl" role="img" aria-label="Hospital">🏥</span>
          </div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">SECSA Digital</h1>
          <p class="text-gray-600">Sistema de Controle de Exames</p>
        </div>

        <!-- Card de Login -->
        <div class="bg-white rounded-2xl shadow-xl p-8" role="main">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">
            Acessar sua conta
          </h2>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" novalidate>
            <!-- Email -->
            <div class="mb-4">
              <label for="email" class="block text-sm font-semibold text-gray-700 mb-2">
                <span class="flex items-center gap-2">
                  <lucide-icon [img]="Mail" class="w-4 h-4" aria-hidden="true" />
                  Email
                </span>
              </label>
              <input
                id="email"
                type="email"
                formControlName="email"
                placeholder="seu@email.com"
                autocomplete="email"
                [attr.aria-invalid]="isFieldInvalid('email')"
                [attr.aria-describedby]="isFieldInvalid('email') ? 'email-error' : null"
                class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                [class.border-error]="isFieldInvalid('email')"
              />
              @if (isFieldInvalid('email')) {
                <p id="email-error" class="mt-1 text-sm text-error" role="alert">
                  Email é obrigatório
                </p>
              }
            </div>

            <!-- Senha -->
            <div class="mb-6">
              <label for="password" class="block text-sm font-semibold text-gray-700 mb-2">
                <span class="flex items-center gap-2">
                  <lucide-icon [img]="Lock" class="w-4 h-4" aria-hidden="true" />
                  Senha
                </span>
              </label>
              <div class="relative">
                <input
                  id="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="••••••••"
                  autocomplete="current-password"
                  [attr.aria-invalid]="isFieldInvalid('password')"
                  [attr.aria-describedby]="isFieldInvalid('password') ? 'password-error' : null"
                  class="w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  [class.border-error]="isFieldInvalid('password')"
                />
                <button
                  type="button"
                  (click)="togglePasswordVisibility()"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/30 rounded p-1"
                  [attr.aria-label]="showPassword() ? 'Ocultar senha' : 'Mostrar senha'"
                >
                  <lucide-icon 
                    [img]="showPassword() ? EyeOff : Eye" 
                    class="w-5 h-5" 
                    aria-hidden="true"
                  />
                </button>
              </div>
              @if (isFieldInvalid('password')) {
                <p id="password-error" class="mt-1 text-sm text-error" role="alert">
                  Senha é obrigatória
                </p>
              }
            </div>

            <!-- Mensagem de erro geral -->
            @if (errorMessage()) {
              <div 
                class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
                role="alert"
                aria-live="polite"
              >
                <p class="text-sm text-red-800">{{ errorMessage() }}</p>
              </div>
            }

            <!-- Botão de Login -->
            <app-button
              type="submit"
              variant="primary"
              [fullWidth]="true"
              [loading]="isLoading()"
              [disabled]="loginForm.invalid || isLoading()"
              ariaLabel="Fazer login"
            >
              {{ isLoading() ? 'Entrando...' : 'Entrar' }}
            </app-button>
          </form>

          <!-- Link para recuperação de senha (futuro) -->
          <div class="mt-6 text-center">
            <a 
              href="#" 
              class="text-sm text-primary hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/30 rounded px-1"
              aria-label="Recuperar senha"
            >
              Esqueceu sua senha?
            </a>
          </div>
        </div>

        <!-- Informação adicional -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Sistema restrito a usuários autorizados
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Icons
  Mail = Mail;
  Lock = Lock;
  Eye = Eye;
  EyeOff = EyeOff;

  // Signals
  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal<string>('');

  loginForm: FormGroup;

  constructor() {
    // Redirecionar se já estiver autenticado
    if (this.authService.isAuthenticated()) {
      const role = this.authService.userRole();
      if (role === 'paciente') {
        this.router.navigate(['/meus-exames']);
      } else {
        this.router.navigate(['/dashboard']);
      }
    }

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      await this.authService.login(this.loginForm.value);
      
      // Verificar se há URL de retorno
      const returnUrl = this.route.snapshot.queryParams['returnUrl'];
      if (returnUrl) {
        this.router.navigateByUrl(returnUrl);
      }
      // Caso contrário, o AuthService já redireciona baseado no role
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Erro ao fazer login');
    } finally {
      this.isLoading.set(false);
    }
  }
}
