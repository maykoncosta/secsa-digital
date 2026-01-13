import { Component, input, output, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button.component';
import { LucideAngularModule, X } from 'lucide-angular';
import { Paciente } from '../../../../data/interfaces/paciente.interface';
import { PacienteRepository } from '../../../../data/repositories/paciente.repository';
import { ToastService } from '../../../../core/services/toast.service';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-paciente-form-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    LucideAngularModule
  ],
  template: `
    <!-- Overlay -->
    <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
         (click)="onOverlayClick($event)">
      
      <!-- Modal -->
      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
           (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 class="text-xl font-semibold text-slate-900">
            {{ isEditMode() ? 'Editar Paciente' : 'Novo Paciente' }}
          </h2>
          <button
            (click)="close.emit()"
            class="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <lucide-icon [img]="X" class="w-5 h-5" />
          </button>
        </div>
        
        <!-- Body -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div class="p-6 space-y-6">
            
            <!-- Dados Pessoais -->
            <div>
              <h3 class="text-lg font-medium text-slate-900 mb-4">👤 Dados Pessoais</h3>
              <div class="grid grid-cols-2 gap-4">
                <div class="col-span-2">
                  <label class="block text-xs font-semibold text-slate-600 mb-1">
                    Nome Completo <span class="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    formControlName="nomeCompleto"
                    placeholder="Nome completo do paciente"
                    [class]="getInputClass('nomeCompleto')"
                  />
                  @if (isFieldInvalid('nomeCompleto')) {
                    <p class="text-xs text-error mt-1">Nome completo é obrigatório (mín. 3 caracteres)</p>
                  }
                </div>
                
                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-1">
                    Data de Nascimento <span class="text-error">*</span>
                  </label>
                  <input
                    type="date"
                    formControlName="dataNascimento"
                    [class]="getInputClass('dataNascimento')"
                  />
                  @if (isFieldInvalid('dataNascimento')) {
                    <p class="text-xs text-error mt-1">Data de nascimento é obrigatória</p>
                  }
                </div>
                
                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-1">
                    Gênero <span class="text-error">*</span>
                  </label>
                  <select
                    formControlName="genero"
                    [class]="getInputClass('genero')"
                  >
                    <option value="">Selecione...</option>
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                    <option value="Outro">Outro</option>
                    <option value="NaoInformado">Não Informado</option>
                  </select>
                  @if (isFieldInvalid('genero')) {
                    <p class="text-xs text-error mt-1">Gênero é obrigatório</p>
                  }
                </div>
              </div>
            </div>
            
            <!-- Identificação -->
            <div>
              <h3 class="text-lg font-medium text-slate-900 mb-4">🆔 Identificação</h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-1">
                    CPF <span class="text-warning">⚠️</span>
                  </label>
                  <input
                    type="text"
                    formControlName="cpf"
                    placeholder="000.000.000-00"
                    maxlength="14"
                    [class]="getInputClass('cpf')"
                  />
                  @if (showCpfCnsError()) {
                    <p class="text-xs text-error mt-1">Informe CPF ou CNS</p>
                  }
                </div>
                
                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-1">
                    CNS <span class="text-warning">⚠️</span>
                  </label>
                  <input
                    type="text"
                    formControlName="cns"
                    placeholder="000 0000 0000 0000"
                    maxlength="15"
                    [class]="getInputClass('cns')"
                  />
                  @if (showCpfCnsError()) {
                    <p class="text-xs text-error mt-1">Informe CPF ou CNS</p>
                  }
                </div>
                
                @if (!isEditMode()) {
                  <div class="col-span-2">
                    <p class="text-xs text-slate-500">
                      <strong>Atenção:</strong> É obrigatório informar pelo menos um dos documentos (CPF ou CNS).
                    </p>
                  </div>
                }
              </div>
            </div>
            
            <!-- Contato -->
            <div>
              <h3 class="text-lg font-medium text-slate-900 mb-4">📞 Contato</h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-1">
                    Telefone <span class="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    formControlName="telefone"
                    placeholder="(00) 00000-0000"
                    maxlength="15"
                    [class]="getInputClass('telefone')"
                  />
                  @if (isFieldInvalid('telefone')) {
                    <p class="text-xs text-error mt-1">Telefone é obrigatório</p>
                  }
                </div>
                
                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    formControlName="email"
                    placeholder="email@exemplo.com"
                    [class]="getInputClass('email')"
                  />
                  @if (isFieldInvalid('email')) {
                    <p class="text-xs text-error mt-1">E-mail inválido</p>
                  }
                </div>
              </div>
            </div>
            
            <!-- Endereço -->
            <div>
              <h3 class="text-lg font-medium text-slate-900 mb-4">📍 Endereço</h3>
              <div formGroupName="endereco" class="grid grid-cols-3 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-1">CEP</label>
                  <input
                    type="text"
                    formControlName="cep"
                    placeholder="00000-000"
                    maxlength="9"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                
                <div class="col-span-2">
                  <label class="block text-xs font-semibold text-slate-600 mb-1">Rua</label>
                  <input
                    type="text"
                    formControlName="rua"
                    placeholder="Nome da rua"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                
                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-1">Número</label>
                  <input
                    type="text"
                    formControlName="numero"
                    placeholder="Nº"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                
                <div class="col-span-2">
                  <label class="block text-xs font-semibold text-slate-600 mb-1">Bairro</label>
                  <input
                    type="text"
                    formControlName="bairro"
                    placeholder="Bairro"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                
                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-1">Cidade</label>
                  <input
                    type="text"
                    formControlName="cidade"
                    placeholder="Cidade"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                
                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-1">Estado</label>
                  <input
                    type="text"
                    formControlName="estado"
                    placeholder="UF"
                    maxlength="2"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
            </div>
            
          </div>
          
          <!-- Footer -->
          <div class="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3 bg-slate-50">
            <app-button
              variant="ghost"
              type="button"
              (onClick)="close.emit()"
            >
              Cancelar
            </app-button>
            
            <app-button
              variant="primary"
              type="submit"
              [loading]="saving()"
              [disabled]="saving()"
            >
              {{ isEditMode() ? 'Atualizar' : 'Cadastrar' }}
            </app-button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: []
})
export class PacienteFormModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private pacienteRepo = inject(PacienteRepository);
  private toastService = inject(ToastService);
  
  X = X;
  
  paciente = input<Paciente | null>(null);
  close = output<void>();
  save = output<Paciente>();
  
  form!: FormGroup;
  saving = signal(false);
  isEditMode = signal(false);

  ngOnInit(): void {
    this.isEditMode.set(!!this.paciente());
    this.initForm();
  }

  initForm(): void {
    const p = this.paciente();
    
    this.form = this.fb.group({
      nomeCompleto: [p?.nomeCompleto || '', [Validators.required, Validators.minLength(3)]],
      dataNascimento: [p?.dataNascimento ? this.formatDate(p.dataNascimento) : '', Validators.required],
      genero: [p?.genero || '', Validators.required],
      cpf: [p?.cpf || ''],
      cns: [p?.cns || ''],
      telefone: [p?.telefone || '', Validators.required],
      email: [p?.email || '', Validators.email],
      endereco: this.fb.group({
        cep: [p?.endereco?.cep || ''],
        rua: [p?.endereco?.rua || ''],
        numero: [p?.endereco?.numero || ''],
        bairro: [p?.endereco?.bairro || ''],
        cidade: [p?.endereco?.cidade || ''],
        estado: [p?.endereco?.estado || '']
      })
    });
  }

  async onSubmit(): Promise<void> {
    // Validação CPF ou CNS
    if (!this.form.value.cpf && !this.form.value.cns) {
      this.toastService.error('Informe CPF ou CNS');
      return;
    }
    
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastService.error('Preencha todos os campos obrigatórios');
      return;
    }
    
    this.saving.set(true);
    
    try {
      const formValue = this.form.value;
      
      if (this.isEditMode()) {
        // Converter data de nascimento sem timezone (manter a data exata)
        const [ano, mes, dia] = formValue.dataNascimento.split('-');
        const dataNascimento = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia), 12, 0, 0);
        
        // Atualizar paciente existente
        await this.pacienteRepo.update(this.paciente()!.id, {
          ...formValue,
          dataNascimento
        });
        this.toastService.success('Paciente atualizado com sucesso!');
      } else {
        // Gerar número do prontuário (implementação simplificada)
        const numeroProntuario = `PAC-${Date.now().toString().slice(-5)}`;
        
        // Converter data de nascimento sem timezone (manter a data exata)
        const [ano, mes, dia] = formValue.dataNascimento.split('-');
        const dataNascimento = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia), 12, 0, 0);
        
        const novoPaciente = {
          ...formValue,
          numeroProntuario,
          status: 'ativo' as const,
          dataNascimento
        };
        
        await this.pacienteRepo.add(novoPaciente);
        this.toastService.success('Paciente cadastrado com sucesso!');
      }
      
      this.close.emit();
    } catch (error: any) {
      console.error('Erro ao salvar paciente:', error);
      
      if (error.message?.includes('cpf')) {
        this.toastService.error('CPF já cadastrado no sistema');
      } else if (error.message?.includes('cns')) {
        this.toastService.error('CNS já cadastrado no sistema');
      } else {
        this.toastService.error('Erro ao salvar paciente');
      }
    } finally {
      this.saving.set(false);
    }
  }

  onOverlayClick(event: MouseEvent): void {
    this.close.emit();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  showCpfCnsError(): boolean {
    const cpf = this.form.get('cpf');
    const cns = this.form.get('cns');
    return !!(cpf?.touched && cns?.touched && !cpf?.value && !cns?.value);
  }

  getInputClass(fieldName: string): string {
    const baseClass = 'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors';
    
    if (this.isFieldInvalid(fieldName)) {
      return `${baseClass} border-error focus:border-error focus:ring-error/20`;
    }
    
    return `${baseClass} border-gray-300 focus:border-primary focus:ring-primary/20`;
  }

  private formatDate(date: Date | any): string {
    if (!date) return '';
    
    // Se for Timestamp do Firestore, converter para Date
    if (date.toDate && typeof date.toDate === 'function') {
      date = date.toDate();
    }
    
    // Se for Date, formatar
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    
    // Se for string já formatada
    if (typeof date === 'string') {
      return date.split('T')[0];
    }
    
    return '';
  }
}
