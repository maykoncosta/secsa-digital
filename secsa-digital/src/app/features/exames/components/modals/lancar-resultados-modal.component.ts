import { Component, signal, inject, output, input, OnInit, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button.component';
import { LucideAngularModule, X, AlertTriangle, CheckCircle, Calculator } from 'lucide-angular';
import { ExameRealizado, SchemaExame, ParametroExame, FaixaReferencia } from '../../../../data/interfaces/exame.interface';
import { ExameRealizadoRepository } from '../../../../data/repositories/exame-realizado.repository';
import { SchemaExameRepository } from '../../../../data/repositories/schema-exame.repository';
import { ToastService } from '../../../../core/services/toast.service';
import { FaixaReferenciaService } from '../../../../core/services/faixa-referencia.service';
import { Timestamp } from '@angular/fire/firestore';

interface ParametroComStatus extends ParametroExame {
  valor?: any;
  dentroFaixa?: boolean;
}

@Component({
  selector: 'app-lancar-resultados-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
          <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl" (click)="$event.stopPropagation()">
            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h2 class="text-xl font-semibold text-slate-900">Lançar Resultados</h2>
                @if (schema() && exame()) {
                  <p class="text-sm text-slate-600 mt-1">{{ schema()!.nome }} - {{ exame()!.paciente.nome }}</p>
                }
              </div>
              <button
                (click)="close()"
                class="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
              >
                <lucide-icon [img]="X" class="w-5 h-5" />
              </button>
            </div>

            <!-- Body -->
            <div class="px-6 py-4 max-h-[70vh] overflow-y-auto">
              @if (loading()) {
                <div class="py-12 text-center">
                  <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p class="mt-4 text-slate-600">Carregando schema...</p>
                </div>
              } @else if (schema()) {
                <form [formGroup]="form" (ngSubmit)="onSubmit()">
                  <!-- Informações do Paciente -->
                  <div class="bg-slate-50 rounded-lg p-4 mb-6">
                    <h3 class="text-sm font-semibold text-slate-700 mb-2">Informações do Paciente</h3>
                    @if (exame()) {
                      <div class="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span class="text-slate-500">Nome:</span>
                          <span class="ml-2 text-slate-900 font-medium">{{ exame()!.paciente.nome }}</span>
                        </div>
                        <div>
                          <span class="text-slate-500">Idade:</span>
                          <span class="ml-2 text-slate-900 font-medium">{{ exame()!.paciente.idadeNaData }} anos</span>
                        </div>
                        <div>
                          <span class="text-slate-500">Sexo:</span>
                          <span class="ml-2 text-slate-900 font-medium">{{ exame()!.paciente.sexo }}</span>
                        </div>
                        <div>
                          <span class="text-slate-500">Data Coleta:</span>
                          <span class="ml-2 text-slate-900 font-medium">{{ formatDate(exame()!.dataColeta) }}</span>
                        </div>
                      </div>
                    }
                  </div>

                  <!-- Parâmetros Agrupados -->
                  @for (grupo of gruposParametros(); track grupo) {
                    <div class="mb-6">
                      <h3 class="text-lg font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
                        {{ grupo }}
                      </h3>
                      
                      <div class="grid grid-cols-2 gap-4">
                        @for (parametro of getParametrosPorGrupo(grupo); track parametro.id) {
                          <div class="space-y-1">
                            <label class="block text-sm font-medium text-slate-700">
                              {{ parametro.label }}
                              @if (parametro.obrigatorio) {
                                <span class="text-red-500">*</span>
                              }
                              @if (parametro.isCalculado) {
                                <span class="ml-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                  <lucide-icon [img]="Calculator" class="w-3 h-3" />
                                  Calculado
                                </span>
                              }
                            </label>
                            
                            <div class="relative">
                              <input
                                type="number"
                                step="0.01"
                                [formControlName]="parametro.id"
                                [readonly]="parametro.isCalculado"
                                (blur)="onParametroChange()"
                                placeholder="Digite o valor"
                                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary pr-16"
                                [class.border-red-500]="form.get(parametro.id)?.invalid && form.get(parametro.id)?.touched"
                                [class.bg-slate-50]="parametro.isCalculado"
                              />
                              <div class="absolute right-2 top-1/2 -translate-y-1/2">
                                <span class="text-xs text-slate-500">{{ parametro.unidade }}</span>
                              </div>
                            </div>
                            
                            <!-- Faixa de Referência -->
                            @if (getFaixaReferencia(parametro.id)) {
                              <div class="text-xs text-slate-500">
                                Referência: {{ getFaixaReferencia(parametro.id)!.min }} - {{ getFaixaReferencia(parametro.id)!.max }} {{ parametro.unidade }}
                                @if (getFaixaReferencia(parametro.id)!.descricao && getFaixaReferencia(parametro.id)!.descricao !== 'Padrão') {
                                  <span class="ml-1 text-primary font-medium">({{ getFaixaReferencia(parametro.id)!.descricao }})</span>
                                }
                              </div>
                            }
                            
                            <!-- Fórmula para calculados -->
                            @if (parametro.isCalculado && parametro.formula) {
                              <div class="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                {{ parametro.formula }}
                              </div>
                            }
                            
                            @if (form.get(parametro.id)?.invalid && form.get(parametro.id)?.touched) {
                              <p class="text-xs text-red-500">Campo obrigatório</p>
                            }
                          </div>
                        }
                      </div>
                      
                      <!-- Observação do Grupo -->
                      <div class="mt-4">
                        <label class="block text-sm font-medium text-slate-700 mb-1">
                          Observações - {{ grupo }}
                        </label>
                        <textarea
                          [formControlName]="'obs_' + grupo"
                          rows="2"
                          placeholder="Observações específicas sobre {{ grupo }}..."
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none text-sm"
                        ></textarea>
                      </div>
                    </div>
                  }

                  <!-- Observações Técnicas -->
                  <div class="mt-6">
                    <label class="block text-sm font-medium text-slate-700 mb-1">
                      Observações Técnicas
                    </label>
                    <textarea
                      formControlName="observacoesTecnicas"
                      rows="3"
                      placeholder="Observações sobre a análise, qualidade da amostra, etc..."
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    ></textarea>
                  </div>
                </form>
              }
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
              <div class="text-sm text-slate-600">
                <!-- Validação removida -->
              </div>
              
              <div class="flex gap-3">
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
                  [disabled]="!form || form.invalid || saving()"
                  type="submit"
                >
                  @if (saving()) {
                    <span class="flex items-center gap-2">
                      <span class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                      Salvando...
                    </span>
                  } @else {
                    Finalizar Exame
                  }
                </app-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class LancarResultadosModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private exameRepository = inject(ExameRealizadoRepository);
  private schemaRepository = inject(SchemaExameRepository);
  private toastService = inject(ToastService);
  private faixaReferenciaService = inject(FaixaReferenciaService);

  // Inputs/Outputs
  isOpen = input(false);
  exame = input<ExameRealizado | null>(null);
  onClose = output<void>();
  onSave = output<void>();

  // State
  form!: FormGroup;
  saving = signal(false);
  loading = signal(true);
  schema = signal<SchemaExame | null>(null);
  parametrosStatus = signal<Map<string, boolean>>(new Map());
  faixasPorParametro = new Map<string, FaixaReferencia | null>();

  // Icons
  X = X;
  AlertTriangle = AlertTriangle;
  CheckCircle = CheckCircle;
  Calculator = Calculator;

  // Computed
  gruposParametros = computed(() => {
    const schema = this.schema();
    if (!schema) return [];
    
    const grupos = new Set<string>();
    schema.parametros.forEach(p => {
      if (p.grupo) grupos.add(p.grupo);
    });
    
    return Array.from(grupos);
  });

  parametrosForaFaixa = computed(() => {
    let count = 0;
    this.schema()?.parametros.forEach(p => {
      if (!p.isCalculado && !this.isDentroFaixa(p.id) && this.form?.get(p.id)?.value) {
        count++;
      }
    });
    return count;
  });

  constructor() {
    this.form = this.fb.group({});
    
    // Reagir quando o exame mudar
    effect(() => {
      const exame = this.exame();
      if (exame && this.isOpen()) {
        this.loadSchema();
      }
    });
  }

  ngOnInit() {
    // Não precisa fazer nada aqui, o effect cuida do carregamento
  }

  loadSchema() {
    this.loading.set(true);
    const exame = this.exame();
    
    if (!exame) {
      this.loading.set(false);
      return;
    }

    this.schemaRepository.getById(exame.schemaId).subscribe({
      next: (schema) => {
        if (schema) {
          this.schema.set(schema);
          this.buildForm(schema);
          this.loadExistingResults();
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar schema:', error);
        this.toastService.show('Erro ao carregar schema do exame', 'error');
        this.loading.set(false);
      }
    });
  }

  buildForm(schema: SchemaExame) {
    const exame = this.exame();
    if (!exame) return;

    // Calcular faixas de referência baseadas no paciente
    this.calcularFaixasPaciente(schema, exame);

    const formControls: any = {};
    
    schema.parametros.forEach(parametro => {
      const validators = [];
      if (parametro.obrigatorio && !parametro.isCalculado) {
        validators.push(Validators.required);
      }
      
      formControls[parametro.id] = [
        { value: '', disabled: parametro.isCalculado },
        validators
      ];
    });

    // Adicionar campos de observação por grupo
    const grupos = new Set<string>();
    schema.parametros.forEach(p => {
      if (p.grupo) grupos.add(p.grupo);
    });
    
    grupos.forEach(grupo => {
      formControls['obs_' + grupo] = [''];
    });

    formControls['observacoesTecnicas'] = [''];

    this.form = this.fb.group(formControls);
  }

  calcularFaixasPaciente(schema: SchemaExame, exame: ExameRealizado) {
    // Preparar dados do paciente
    const dataNascimento = exame.paciente.dataNascimento.toDate();
    const dataExame = exame.dataColeta.toDate();
    
    const idades = this.faixaReferenciaService.calcularIdades(dataNascimento, dataExame);
    const dadosPaciente = {
      ...idades,
      sexo: exame.paciente.sexo
    };

    // Calcular faixa para cada parâmetro (incluindo calculados)
    this.faixasPorParametro.clear();
    schema.parametros.forEach(parametro => {
      const faixa = this.faixaReferenciaService.selecionarFaixa(parametro, dadosPaciente);
      this.faixasPorParametro.set(parametro.id, faixa);
    });
  }

  loadExistingResults() {
    const exame = this.exame();
    if (exame && exame.resultados) {
      const formValues: any = {};
      
      Object.keys(exame.resultados).forEach(key => {
        formValues[key] = exame.resultados[key].valor;
      });
      
      if (exame.observacoesTecnicas) {
        formValues['observacoesTecnicas'] = exame.observacoesTecnicas;
      }

      this.form.patchValue(formValues);
      this.calcularParametros();
    }
  }

  getParametrosPorGrupo(grupo: string): ParametroExame[] {
    const schema = this.schema();
    if (!schema) return [];
    
    return schema.parametros.filter(p => p.grupo === grupo);
  }

  onParametroChange() {
    this.calcularParametros();
  }

  calcularParametros() {
    const schema = this.schema();
    if (!schema) return;

    const formValues = this.form.getRawValue();
    const parametrosCalculados = schema.parametros.filter(p => p.isCalculado);

    parametrosCalculados.forEach(parametro => {
      if (parametro.formula) {
        const valor = this.avaliarFormula(parametro.formula, formValues);
        
        if (valor !== null && !isNaN(valor)) {
          this.form.get(parametro.id)?.setValue(valor.toFixed(2), { emitEvent: false });
        }
      }
    });
  }

  avaliarFormula(formula: string, valores: any): number | null {
    try {
      // Substituir os IDs dos parâmetros pelos valores
      let expressao = formula;
      
      Object.keys(valores).forEach(key => {
        const valor = valores[key];
        if (valor !== null && valor !== undefined && valor !== '') {
          expressao = expressao.replace(new RegExp(key, 'g'), valor.toString());
        }
      });

      // Avaliar a expressão matemática de forma segura
      const resultado = Function(`'use strict'; return (${expressao})`)();
      
      return typeof resultado === 'number' ? resultado : null;
    } catch (error) {
      console.error('Erro ao calcular fórmula:', error);
      return null;
    }
  }

  getFaixaReferencia(parametroId: string): FaixaReferencia | null {
    return this.faixasPorParametro.get(parametroId) || null;
  }

  isDentroFaixa(parametroId: string): boolean {
    const faixa = this.getFaixaReferencia(parametroId);
    if (!faixa) return true;

    const valor = this.form?.get(parametroId)?.value;
    if (!valor) return true;

    const numValor = parseFloat(valor);
    return numValor >= faixa.min && numValor <= faixa.max;
  }

  formatDate(timestamp: any): string {
    if (!timestamp) return '-';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('pt-BR').format(date);
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastService.show('Preencha todos os campos obrigatórios', 'error');
      return;
    }

    const exame = this.exame();
    const schema = this.schema();
    
    if (!exame || !schema) return;

    this.saving.set(true);

    try {
      const formValues = this.form.getRawValue();
      const resultados: any = {};

      schema.parametros.forEach(parametro => {
        const valor = formValues[parametro.id];
        if (valor !== null && valor !== undefined && valor !== '') {
          resultados[parametro.id] = {
            valor: parseFloat(valor),
            unidade: parametro.unidade
          };
        }
      });

      // Coletar observações por grupo
      const observacoesGrupos: any = {};
      const grupos = new Set<string>();
      schema.parametros.forEach(p => {
        if (p.grupo) grupos.add(p.grupo);
      });
      
      grupos.forEach(grupo => {
        const obs = formValues['obs_' + grupo];
        if (obs && obs.trim()) {
          observacoesGrupos[grupo] = obs.trim();
        }
      });

      const updateData: any = {
        resultados,
        observacoesTecnicas: formValues.observacoesTecnicas || undefined,
        observacoesGrupos: Object.keys(observacoesGrupos).length > 0 ? observacoesGrupos : undefined,
        status: 'finalizado',
        dataFinalizacao: Timestamp.now(),
        finalizadoPor: 'current-user-id' // TODO: Pegar do auth
      };

      // Usar o ID do documento corretamente
      const exameId = (exame as any).id || exame.uid;
      if (!exameId) {
        throw new Error('ID do exame não encontrado');
      }

      await this.exameRepository.update(exameId, updateData);
      
      this.toastService.show('Resultados salvos e exame finalizado com sucesso', 'success');
      this.onSave.emit();
      this.close();
    } catch (error) {
      console.error('Erro ao salvar resultados:', error);
      this.toastService.show('Erro ao salvar resultados', 'error');
    } finally {
      this.saving.set(false);
    }
  }

  close() {
    this.form?.reset();
    this.schema.set(null);
    this.onClose.emit();
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }
}
