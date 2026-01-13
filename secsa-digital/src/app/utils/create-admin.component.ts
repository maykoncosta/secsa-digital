import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, doc, setDoc, serverTimestamp } from '@angular/fire/firestore';
import { ButtonComponent } from '../shared/components/button.component';

@Component({
  selector: 'app-create-admin',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 class="text-2xl font-bold text-gray-900 mb-6">Criar Usuário Admin</h1>
        
        @if (success()) {
          <div class="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
            <p class="text-green-800 font-medium">✅ Usuário admin criado com sucesso!</p>
            <p class="text-sm text-green-600 mt-2">UID: PZTdomUMAQRmDcvfY9pqAEUNV713</p>
            <p class="text-sm text-green-600">Email: jj.tech.xxiv@gmail.com</p>
          </div>
        }

        @if (error()) {
          <div class="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
            <p class="text-red-800 font-medium">❌ Erro ao criar usuário</p>
            <p class="text-sm text-red-600 mt-2">{{ error() }}</p>
          </div>
        }

        <div class="space-y-4">
          <div>
            <p class="text-sm text-gray-600"><strong>UID:</strong> PZTdomUMAQRmDcvfY9pqAEUNV713</p>
            <p class="text-sm text-gray-600"><strong>Email:</strong> jj.tech.xxiv@gmail.com</p>
            <p class="text-sm text-gray-600"><strong>Role:</strong> admin</p>
          </div>

          <app-button
            variant="primary"
            [fullWidth]="true"
            (onClick)="createAdmin()"
            [loading]="loading()"
          >
            {{ loading() ? 'Criando...' : 'Criar Usuário Admin' }}
          </app-button>
        </div>
      </div>
    </div>
  `
})
export class CreateAdminComponent {
  private firestore = inject(Firestore);

  loading = signal(false);
  success = signal(false);
  error = signal('');

  async createAdmin() {
    this.loading.set(true);
    this.success.set(false);
    this.error.set('');

    const uid = 'PZTdomUMAQRmDcvfY9pqAEUNV713';
    const email = 'jj.tech.xxiv@gmail.com';

    try {
      await setDoc(doc(this.firestore, 'users', uid), {
        email: email,
        displayName: 'Admin',
        role: 'admin',
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      this.success.set(true);
      console.log('✅ Usuário admin criado com sucesso!');
    } catch (err: any) {
      this.error.set(err.message || 'Erro desconhecido');
      console.error('❌ Erro ao criar usuário:', err);
    } finally {
      this.loading.set(false);
    }
  }
}
