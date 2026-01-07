import { Component, signal, inject, output, input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button.component';
import { LucideAngularModule, X, Search, Calendar } from 'lucide-angular';
import { ExameRealizado } from '../../../../data/interfaces/exame.interface';
import { ExameRealizadoRepository } from '../../../../data/repositories/exame-realizado.repository';
import { SchemaExameRepository } from '../../../../data/repositories/schema-exame.repository';
import { PacienteRepository } from '../../../../data/repositories/paciente.repository';
import { ToastService } from '../../../../core/services/toast.service';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-exame-realizado-form-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonComponent,
    LucideAngularModule
  ],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 overflow-y-auto" (click)="onBackdropClick($event)">
        <div class="flex min-h-screen items-center justify-center p-4">
          <!-- Backdrop -->
          <div class="fixed inset-0 bg-black/50 transition-opacity"></div>
          
          <!-- Modal -->
          <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl" (click)="$event.stopPropagation()">
            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 class="text-xl font-semibold text-slate-900">
                {{ exameToEdit() ? 'Editar Exame' : 'Novo Exame Realizado' }}
              </h2>
              <button
                (click)="close()"
                class="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
              >
                <lucide-icon [img]="X" class="w-5 h-5" />
              </button>
            </div>

            <!-- Body -->
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <!-- Seleção de Paciente -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">
                  Paciente <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <lucide-icon [img]="Search" class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    [(ngModel)]="pacienteSearch"
                    [ngModelOptions]="{standalone: true}"
                    (ngModelChange)="onPacienteSearch()"
                    placeholder="Buscar por nome, CPF ou CNS..."
                    class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    [class.border-red-500]="form.get('pacienteId')?.invalid && form.get('pacienteId')?.touched"
                  />
                </div>
                
                <!-- Lista de Pacientes -->
                @if (showPacienteList() && filteredPacientes().length > 0) {
                  <div class="mt-2 border border-slate-200 rounded-lg max-h-48 overflow-y-auto">
                    @for (paciente of filteredPacientes(); track paciente.id) {
                      <button
                        type="button"
                        (click)="selectPaciente(paciente)"
                        class="w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                      >
                        <div class="font-medium text-slate-900">{{ paciente.nomeCompleto }}</div>
                        <div class="text-sm text-slate-600">CPF: {{ paciente.cpf }} | Prontuário: {{ paciente.numeroProntuario }}</div>
                      </button>
                    }
                  </div>
                }
                
                <!-- Paciente Selecionado -->
                @if (selectedPaciente()) {
                  <div class="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div class="flex items-center justify-between">
                      <div>
                        <div class="font-medium text-green-900">{{ selectedPaciente()!.nomeCompleto }}</div>
                        <div class="text-sm text-green-700">
                          CPF: {{ selectedPaciente()!.cpf }} | Prontuário: {{ selectedPaciente()!.numeroProntuario }}
                        </div>
                      </div>
                      <button
                        type="button"
                        (click)="clearPaciente()"
                        class="text-green-600 hover:text-green-800"
                      >
                        <lucide-icon [img]="X" class="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                }
                
                @if (form.get('pacienteId')?.invalid && form.get('pacienteId')?.touched) {
                  <p class="mt-1 text-sm text-red-500">Selecione um paciente</p>
                }
              </div>

              <!-- Seleção de Schema de Exame -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">
                  Tipo de Exame <span class="text-red-500">*</span>
                </label>
                <select
                  formControlName="schemaId"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  [class.border-red-500]="form.get('schemaId')?.invalid && form.get('schemaId')?.touched"
                >
                  <option value="">Selecione o tipo de exame</option>
                  @for (schema of schemas(); track schema.id) {
                    <option [value]="schema.id">{{ schema.nome }} - {{ schema.categoria }}</option>
                  }
                </select>
                @if (form.get('schemaId')?.invalid && form.get('schemaId')?.touched) {
                  <p class="mt-1 text-sm text-red-500">Selecione um tipo de exame</p>
                }
              </div>

              <!-- Data da Coleta -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">
                  Data da Coleta <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <lucide-icon [img]="Calendar" class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    formControlName="dataColeta"
                    class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    [class.border-red-500]="form.get('dataColeta')?.invalid && form.get('dataColeta')?.touched"
                  />
                </div>
                @if (form.get('dataColeta')?.invalid && form.get('dataColeta')?.touched) {
                  @if (form.get('dataColeta')?.errors?.['required']) {
                    <p class="mt-1 text-sm text-red-500">Informe a data da coleta</p>
                  }
                  @if (form.get('dataColeta')?.errors?.['dataFutura']) {
                    <p class="mt-1 text-sm text-red-500">A data da coleta não pode ser futura</p>
                  }
                  @if (form.get('dataColeta')?.errors?.['dataAntigas']) {
                    <p class="mt-1 text-sm text-red-500">A data da coleta não pode ser anterior a 90 dias</p>
                  }
                }
              </div>

              <!-- Observações Técnicas -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">
                  Observações Técnicas
                </label>
                <textarea
                  formControlName="observacoesTecnicas"
                  rows="3"
                  placeholder="Observações sobre a coleta, condições da amostra, etc..."
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                ></textarea>
              </div>
            </form>

            <!-- Footer -->
            <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200">
              <app-button
                variant="secondary"
                (onClick)="close()"
                type="button"
              >
                Cancelar
              </app-button>
              <app-button
                variant="primary"
                (onClick)="onSubmit()"
                [disabled]="form.invalid || saving()"
                type="submit"
              >
                @if (saving()) {
                  <span class="flex items-center gap-2">
                    <span class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    Salvando...
                  </span>
                } @else {
                  {{ exameToEdit() ? 'Atualizar' : 'Cadastrar' }} Exame
                }
              </app-button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class ExameRealizadoFormModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private exameRepository = inject(ExameRealizadoRepository);
  private schemaRepository = inject(SchemaExameRepository);
  private pacienteRepository = inject(PacienteRepository);
  private toastService = inject(ToastService);

  // Inputs/Outputs
  isOpen = input(false);
  exameToEdit = input<ExameRealizado | null>(null);
  onClose = output<void>();
  onSave = output<void>();

  // State
  form: FormGroup;
  saving = signal(false);
  schemas = signal<any[]>([]);
  pacientes = signal<any[]>([]);
  filteredPacientes = signal<any[]>([]);
  selectedPaciente = signal<any | null>(null);
  showPacienteList = signal(false);
  pacienteSearch = '';

  // Icons
  X = X;
  Search = Search;
  Calendar = Calendar;

  constructor() {
    this.form = this.fb.group({
      pacienteId: ['', Validators.required],
      schemaId: ['', Validators.required],
      dataColeta: ['', [Validators.required, this.dataColetaValidator.bind(this)]],
      observacoesTecnicas: ['']
    });
  }

  /**
   * Validador customizado para data de coleta
   * - Não pode ser futura
   * - Não pode ser anterior a 90 dias
   */
  dataColetaValidator(control: any) {
    if (!control.value) return null;

    const dataColeta = new Date(control.value);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const limite90Dias = new Date();
    limite90Dias.setDate(limite90Dias.getDate() - 90);
    limite90Dias.setHours(0, 0, 0, 0);

    // Verificar se é futura
    if (dataColeta > hoje) {
      return { dataFutura: true };
    }

    // Verificar se é muito antiga (> 90 dias)
    if (dataColeta < limite90Dias) {
      return { dataAntigas: true };
    }

    return null;
  }

  ngOnInit() {
    this.loadSchemas();
    this.loadPacientes();

    if (this.exameToEdit()) {
      this.populateForm(this.exameToEdit()!);
    }
  }

  loadSchemas() {
    this.schemaRepository.getAll().subscribe({
      next: (schemas) => {
        this.schemas.set(schemas);
      },
      error: (error) => {
        console.error('Erro ao carregar schemas:', error);
        this.toastService.show('Erro ao carregar tipos de exame', 'error');
      }
    });
  }

  loadPacientes() {
    this.pacienteRepository.getAll().subscribe({
      next: (pacientes) => {
        this.pacientes.set(pacientes);
      },
      error: (error) => {
        console.error('Erro ao carregar pacientes:', error);
        this.toastService.show('Erro ao carregar pacientes', 'error');
      }
    });
  }

  onPacienteSearch() {
    const term = this.pacienteSearch.toLowerCase().trim();
    
    if (!term) {
      this.filteredPacientes.set([]);
      this.showPacienteList.set(false);
      return;
    }

    const filtered = this.pacientes().filter(p =>
      p.nomeCompleto.toLowerCase().includes(term) ||
      p.cpf?.includes(term) ||
      p.cns?.includes(term) ||
      p.numeroProntuario.includes(term)
    );

    this.filteredPacientes.set(filtered);
    this.showPacienteList.set(true);
  }

  selectPaciente(paciente: any) {
    this.selectedPaciente.set(paciente);
    this.form.patchValue({ pacienteId: paciente.id });
    this.pacienteSearch = paciente.nomeCompleto;
    this.showPacienteList.set(false);
  }

  clearPaciente() {
    this.selectedPaciente.set(null);
    this.form.patchValue({ pacienteId: '' });
    this.pacienteSearch = '';
  }

  populateForm(exame: ExameRealizado) {
    const dataColeta = exame.dataColeta.toDate();
    const dataColetaStr = dataColeta.toISOString().split('T')[0];

    this.form.patchValue({
      pacienteId: exame.pacienteId,
      schemaId: exame.schemaId,
      dataColeta: dataColetaStr,
      observacoesTecnicas: exame.observacoesTecnicas || ''
    });
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Validar se paciente está ativo
    const paciente = this.selectedPaciente();
    if (paciente && paciente.status !== 'ativo') {
      this.toastService.show('Não é possível cadastrar exame para paciente inativo', 'error');
      return;
    }

    this.saving.set(true);

    try {
      const formValue = this.form.value;
      const schema = this.schemas().find(s => s.id === formValue.schemaId)!;

      // Converter data string para Timestamp
      const dataColetaDate = new Date(formValue.dataColeta);
      const dataColeta = Timestamp.fromDate(dataColetaDate);

      // Calcular idade na data da coleta
      const dataNascimento = paciente.dataNascimento.toDate();
      const idadeNaData = this.calculateAge(dataNascimento, dataColetaDate);

      const exameData: Omit<ExameRealizado, 'uid'> = {
        schemaId: formValue.schemaId,
        schemaNome: schema.nome,
        pacienteId: paciente.id,
        paciente: {
          id: paciente.id,
          nome: paciente.nomeCompleto,
          cpf: paciente.cpf || '',
          sexo: paciente.genero === 'M' || paciente.genero === 'F' ? paciente.genero : 'M',
          dataNascimento: paciente.dataNascimento,
          idadeNaData: idadeNaData
        },
        status: 'pendente',
        dataColeta: dataColeta,
        dataCadastro: Timestamp.now(),
        resultados: {},
        cadastradoPor: 'current-user-id', // TODO: Pegar do auth
        observacoesTecnicas: formValue.observacoesTecnicas || undefined
      };

      if (this.exameToEdit()) {
        await this.exameRepository.update(this.exameToEdit()!.uid, exameData);
        this.toastService.show('Exame atualizado com sucesso', 'success');
      } else {
        await this.exameRepository.add(exameData);
        this.toastService.show('Exame cadastrado com sucesso', 'success');
      }

      this.onSave.emit();
      this.close();
    } catch (error) {
      console.error('Erro ao salvar exame:', error);
      this.toastService.show('Erro ao salvar exame', 'error');
    } finally {
      this.saving.set(false);
    }
  }

  calculateAge(birthDate: Date, referenceDate: Date): number {
    let age = referenceDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = referenceDate.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  close() {
    this.form.reset();
    this.selectedPaciente.set(null);
    this.pacienteSearch = '';
    this.showPacienteList.set(false);
    this.onClose.emit();
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }
}
