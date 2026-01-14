import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, collection, getDocs, updateDoc, doc, deleteField } from '@angular/fire/firestore';
import { EncryptionService } from '../core/services/encryption.service';

interface MigrationResult {
  total: number;
  migrados: number;
  jaCriptografados: number;
  erros: number;
  detalhes: string[];
}

@Component({
  selector: 'app-migrar-criptografia',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-6">
      <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        <h1 class="text-3xl font-bold text-slate-800 mb-2">
          🔒 Migração de Criptografia
        </h1>
        <p class="text-slate-600 mb-6">
          Este script irá criptografar todos os CPFs e CNS dos pacientes existentes.
        </p>

        <!-- Alerta de Aviso -->
        <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-yellow-700">
                <strong>⚠️ ATENÇÃO:</strong> Esta operação é irreversível. 
                Certifique-se de ter um backup do banco de dados antes de continuar.
              </p>
            </div>
          </div>
        </div>

        <!-- Botão de Migração -->
        <button
          (click)="iniciarMigracao()"
          [disabled]="migrando || migracaoConcluida"
          class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 
                 text-white font-semibold py-3 px-6 rounded-lg 
                 transition-colors duration-200 mb-4
                 disabled:cursor-not-allowed"
        >
          @if (migrando) {
            <span class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Migrando...
            </span>
          } @else if (migracaoConcluida) {
            ✅ Migração Concluída
          } @else {
            🚀 Iniciar Migração
          }
        </button>

        <!-- Progresso -->
        @if (migrando || migracaoConcluida) {
          <div class="bg-slate-50 rounded-lg p-4 mb-4">
            <div class="flex justify-between text-sm text-slate-600 mb-2">
              <span>Progresso</span>
              <span>{{ resultado.migrados + resultado.jaCriptografados + resultado.erros }}/{{ resultado.total }}</span>
            </div>
            <div class="w-full bg-slate-200 rounded-full h-2">
              <div 
                class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                [style.width.%]="getProgresso()"
              ></div>
            </div>
          </div>

          <!-- Estatísticas -->
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div class="bg-green-50 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-green-600">{{ resultado.migrados }}</div>
              <div class="text-sm text-green-700">Migrados</div>
            </div>
            <div class="bg-blue-50 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-blue-600">{{ resultado.jaCriptografados }}</div>
              <div class="text-sm text-blue-700">Já Criptografados</div>
            </div>
            <div class="bg-slate-50 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-slate-600">{{ resultado.total }}</div>
              <div class="text-sm text-slate-700">Total</div>
            </div>
            <div class="bg-red-50 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-red-600">{{ resultado.erros }}</div>
              <div class="text-sm text-red-700">Erros</div>
            </div>
          </div>

          <!-- Log de Detalhes -->
          @if (resultado.detalhes.length > 0) {
            <div class="bg-slate-900 rounded-lg p-4 max-h-64 overflow-y-auto">
              <div class="text-xs font-mono text-slate-300 space-y-1">
                @for (detalhe of resultado.detalhes; track detalhe) {
                  <div>{{ detalhe }}</div>
                }
              </div>
            </div>
          }
        }

        <!-- Botão Voltar -->
        @if (migracaoConcluida) {
          <a 
            href="/dashboard" 
            class="mt-4 block w-full text-center bg-slate-600 hover:bg-slate-700 
                   text-white font-semibold py-3 px-6 rounded-lg 
                   transition-colors duration-200"
          >
            ← Voltar ao Dashboard
          </a>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class MigrarCriptografiaComponent {
  private firestore = inject(Firestore);
  private encryption = inject(EncryptionService);

  migrando = false;
  migracaoConcluida = false;
  
  resultado: MigrationResult = {
    total: 0,
    migrados: 0,
    jaCriptografados: 0,
    erros: 0,
    detalhes: []
  };

  async iniciarMigracao(): Promise<void> {
    if (!confirm('⚠️ ATENÇÃO: Você tem certeza que deseja iniciar a migração?\n\nEsta operação irá criptografar todos os CPFs e CNS no banco de dados.\n\nCertifique-se de ter um backup antes de continuar!')) {
      return;
    }

    this.migrando = true;
    this.resultado = {
      total: 0,
      migrados: 0,
      jaCriptografados: 0,
      erros: 0,
      detalhes: ['🚀 Iniciando migração...']
    };

    try {
      // Buscar todos os pacientes
      const pacientesRef = collection(this.firestore, 'pacientes');
      const snapshot = await getDocs(pacientesRef);
      
      this.resultado.total = snapshot.size;
      this.log(`📊 Total de pacientes encontrados: ${this.resultado.total}`);

      // Processar cada paciente
      for (const docSnapshot of snapshot.docs) {
        const id = docSnapshot.id;
        const data = docSnapshot.data();
        
        try {
          await this.migrarPaciente(id, data);
        } catch (error: any) {
          this.resultado.erros++;
          this.log(`❌ Erro ao migrar paciente ${id}: ${error.message}`, 'error');
        }
      }

      // Resumo final
      this.log('');
      this.log('✅ ===== MIGRAÇÃO CONCLUÍDA =====');
      this.log(`📊 Total: ${this.resultado.total}`);
      this.log(`✅ Migrados: ${this.resultado.migrados}`);
      this.log(`ℹ️ Já criptografados: ${this.resultado.jaCriptografados}`);
      this.log(`❌ Erros: ${this.resultado.erros}`);
      
      this.migracaoConcluida = true;

    } catch (error: any) {
      this.log(`❌ ERRO CRÍTICO: ${error.message}`, 'error');
      alert('Erro crítico durante a migração. Verifique o console.');
    } finally {
      this.migrando = false;
    }
  }

  private async migrarPaciente(id: string, data: any): Promise<void> {
    const updates: any = {};
    let precisaMigrar = false;

    // Verificar e migrar CPF
    if (data.cpf && !data.cpfEncrypted) {
      // Tem CPF em texto plano, precisa criptografar
      const cpf = data.cpf.replace(/\D/g, ''); // Limpar formatação
      
      if (this.encryption.validateCPF(cpf)) {
        const cpfData = this.encryption.encryptCPF(cpf);
        updates.cpfEncrypted = cpfData.encrypted;
        updates.cpfHash = cpfData.hash;
        updates.cpf = deleteField(); // Remover CPF em texto plano
        precisaMigrar = true;
        this.log(`🔐 CPF criptografado para paciente ${data.nomeCompleto || id}`);
      } else {
        this.log(`⚠️ CPF inválido para paciente ${data.nomeCompleto || id}`, 'warn');
      }
    }

    // Verificar e migrar CNS
    if (data.cns && !data.cnsEncrypted) {
      // Tem CNS em texto plano, precisa criptografar
      const cns = data.cns.replace(/\D/g, ''); // Limpar formatação
      
      if (this.encryption.validateCNS(cns)) {
        const cnsData = this.encryption.encryptCNS(cns);
        updates.cnsEncrypted = cnsData.encrypted;
        updates.cnsHash = cnsData.hash;
        updates.cns = deleteField(); // Remover CNS em texto plano
        precisaMigrar = true;
        this.log(`🔐 CNS criptografado para paciente ${data.nomeCompleto || id}`);
      } else {
        this.log(`⚠️ CNS inválido para paciente ${data.nomeCompleto || id}`, 'warn');
      }
    }

    if (precisaMigrar) {
      // Atualizar documento
      const docRef = doc(this.firestore, 'pacientes', id);
      await updateDoc(docRef, updates);
      this.resultado.migrados++;
      this.log(`✅ Paciente migrado: ${data.nomeCompleto || id}`);
    } else {
      // Já estava criptografado ou não tinha dados para migrar
      this.resultado.jaCriptografados++;
      this.log(`ℹ️ Paciente já criptografado ou sem dados: ${data.nomeCompleto || id}`);
    }
  }

  private log(mensagem: string, tipo: 'info' | 'warn' | 'error' = 'info'): void {
    const timestamp = new Date().toLocaleTimeString();
    const prefixo = `[${timestamp}]`;
    
    this.resultado.detalhes.push(`${prefixo} ${mensagem}`);
    
    // Log no console também
    if (tipo === 'error') {
      console.error(prefixo, mensagem);
    } else if (tipo === 'warn') {
      console.warn(prefixo, mensagem);
    } else {
      console.log(prefixo, mensagem);
    }
    
    // Auto-scroll para o final
    setTimeout(() => {
      const logContainer = document.querySelector('.overflow-y-auto');
      if (logContainer) {
        logContainer.scrollTop = logContainer.scrollHeight;
      }
    }, 0);
  }

  getProgresso(): number {
    if (this.resultado.total === 0) return 0;
    return ((this.resultado.migrados + this.resultado.jaCriptografados + this.resultado.erros) / this.resultado.total) * 100;
  }
}
