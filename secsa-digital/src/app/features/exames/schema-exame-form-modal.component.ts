import { Component, input, output, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { ButtonComponent } from '../../shared/components/button.component';
import { LucideAngularModule, X, Plus, Trash2, Calculator } from 'lucide-angular';
import { SchemaExame, ParametroExame } from '../../data/interfaces/exame.interface';
import { SchemaExameRepository } from '../../data/repositories/schema-exame.repository';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-schema-exame-form-modal',
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
      <div class="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
           (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 class="text-xl font-semibold text-slate-900">
            {{ isEditMode() ? 'Editar Schema de Exame' : 'Novo Schema de Exame' }}
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
            
            <!-- Informações Básicas -->
            <div>
              <h3 class="text-lg font-medium text-slate-900 mb-4">📋 Informações Básicas</h3>
              <div class="grid grid-cols-2 gap-4">
                <div class="col-span-2">
                  <label class="block text-xs font-semibold text-slate-600 mb-1">
                    Nome do Exame <span class="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    formControlName="nome"
                    placeholder="Ex: Hemograma Completo"
                    [class]="getInputClass('nome')"
                  />
                  @if (isFieldInvalid('nome')) {
                    <p class="text-xs text-error mt-1">Nome do exame é obrigatório</p>
                  }
                </div>
                
                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-1">
                    Categoria <span class="text-error">*</span>
                  </label>
                  <select
                    formControlName="categoria"
                    [class]="getInputClass('categoria')"
                  >
                    <option value="">Selecione...</option>
                    <option value="Hematologia">Hematologia</option>
                    <option value="Bioquímica">Bioquímica</option>
                    <option value="Lipidograma">Lipidograma</option>
                    <option value="Hormônios">Hormônios</option>
                    <option value="Sorologias">Sorologias</option>
                    <option value="Microbiologia">Microbiologia</option>
                    <option value="Parasitologia">Parasitologia</option>
                    <option value="Urinálise">Urinálise</option>
                  </select>
                  @if (isFieldInvalid('categoria')) {
                    <p class="text-xs text-error mt-1">Categoria é obrigatória</p>
                  }
                </div>
                
                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                  <select
                    formControlName="ativo"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option [value]="true">Ativo</option>
                    <option [value]="false">Inativo</option>
                  </select>
                </div>
                
                <div class="col-span-2">
                  <label class="block text-xs font-semibold text-slate-600 mb-1">
                    Observações
                  </label>
                  <textarea
                    formControlName="observacoes"
                    rows="2"
                    placeholder="Orientações gerais sobre o exame..."
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  ></textarea>
                </div>
              </div>
            </div>
            
            <!-- Parâmetros -->
            <div>
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-medium text-slate-900">🔬 Parâmetros do Exame</h3>
                <app-button
                  type="button"
                  variant="secondary"
                  size="sm"
                  (onClick)="addParametro()"
                >
                  <lucide-icon [img]="Plus" class="w-4 h-4 mr-1" />
                  Adicionar Parâmetro
                </app-button>
              </div>
              
              @if (parametros.length === 0) {
                <div class="p-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300 text-center">
                  <p class="text-slate-600">Nenhum parâmetro adicionado</p>
                  <p class="text-sm text-slate-500 mt-1">Clique em "Adicionar Parâmetro" para começar</p>
                </div>
              } @else {
                <div formArrayName="parametros" class="space-y-4">
                  @for (parametro of parametros.controls; track $index) {
                    <div [formGroupName]="$index" class="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div class="flex items-start justify-between gap-4">
                        <div class="flex-1 grid grid-cols-4 gap-3">
                          <!-- ID -->
                          <div>
                            <label class="block text-xs font-semibold text-slate-600 mb-1">
                              ID <span class="text-error">*</span>
                            </label>
                            <input
                              type="text"
                              formControlName="id"
                              placeholder="Ex: hemoglobina"
                              class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                          </div>
                          
                          <!-- Label -->
                          <div>
                            <label class="block text-xs font-semibold text-slate-600 mb-1">
                              Nome <span class="text-error">*</span>
                            </label>
                            <input
                              type="text"
                              formControlName="label"
                              placeholder="Ex: Hemoglobina"
                              class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                          </div>
                          
                          <!-- Unidade -->
                          <div>
                            <label class="block text-xs font-semibold text-slate-600 mb-1">
                              Unidade
                            </label>
                            <input
                              type="text"
                              formControlName="unidade"
                              placeholder="Ex: g/dL"
                              class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                          </div>
                          
                          <!-- Tipo -->
                          <div>
                            <label class="block text-xs font-semibold text-slate-600 mb-1">
                              Tipo <span class="text-error">*</span>
                            </label>
                            <select
                              formControlName="tipo"
                              class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            >
                              <option value="number">Numérico</option>
                              <option value="text">Texto</option>
                              <option value="boolean">Sim/Não</option>
                              <option value="select">Seleção</option>
                            </select>
                          </div>
                          
                          <!-- Grupo -->
                          <div>
                            <label class="block text-xs font-semibold text-slate-600 mb-1">
                              Grupo
                            </label>
                            <input
                              type="text"
                              formControlName="grupo"
                              placeholder="Ex: Série Vermelha"
                              class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                          </div>
                          
                          <!-- Opções para tipo select -->
                          @if (getParametroTipo($index) === 'select') {
                            <div class="col-span-3">
                              <label class="block text-xs font-semibold text-slate-600 mb-1">
                                Opções (separadas por vírgula)
                              </label>
                              <input
                                type="text"
                                formControlName="opcoes"
                                placeholder="Ex: Positivo, Negativo, Indeterminado"
                                class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                              />
                            </div>
                          }
                          
                          <!-- Checkboxes -->
                          <div class="col-span-4 flex items-center gap-4 mt-2">
                            <label class="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                formControlName="obrigatorio"
                                class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary/20"
                              />
                              <span class="text-sm text-slate-700">Obrigatório</span>
                            </label>
                            
                            <label class="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                formControlName="isCalculado"
                                class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary/20"
                              />
                              <span class="text-sm text-slate-700 flex items-center gap-1">
                                <lucide-icon [img]="Calculator" class="w-3 h-3" />
                                Calculado
                              </span>
                            </label>
                          </div>
                          
                          <!-- Fórmula (se calculado) -->
                          @if (getParametroIsCalculado($index)) {
                            <div class="col-span-4 mt-2">
                              <label class="block text-xs font-semibold text-slate-600 mb-1">
                                Fórmula
                              </label>
                              <input
                                type="text"
                                formControlName="formula"
                                placeholder="Ex: colesterolTotal - hdl - (triglicerideos / 5)"
                                class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                              />
                              <p class="text-xs text-slate-500 mt-1">
                                Use os IDs dos parâmetros e operadores: +, -, *, /, ( )
                              </p>
                            </div>
                          }
                        </div>
                        
                        <!-- Botão Remover -->
                        <button
                          type="button"
                          (click)="removeParametro($index)"
                          class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Remover parâmetro"
                        >
                          <lucide-icon [img]="Trash2" class="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
            
          </div>
          
          <!-- Footer -->
          <div class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
            <app-button
              type="button"
              variant="ghost"
              (onClick)="close.emit()"
            >
              Cancelar
            </app-button>
            
            <app-button
              type="submit"
              variant="primary"
              [disabled]="submitting() || form.invalid"
            >
              {{ submitting() ? 'Salvando...' : (isEditMode() ? 'Atualizar' : 'Criar Schema') }}
            </app-button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class SchemaExameFormModalComponent implements OnInit {
  // Icons
  X = X;
  Plus = Plus;
  Trash2 = Trash2;
  Calculator = Calculator;

  // Inputs
  schema = input<SchemaExame | null>(null);
  
  // Outputs
  close = output<void>();
  saved = output<void>();

  // Services
  private fb = inject(FormBuilder);
  private schemaRepository = inject(SchemaExameRepository);
  private toastService = inject(ToastService);

  // State
  form!: FormGroup;
  submitting = signal(false);
  isEditMode = signal(false);

  ngOnInit() {
    this.isEditMode.set(!!this.schema());
    this.initForm();
  }

  initForm() {
    const schemaData = this.schema();
    
    this.form = this.fb.group({
      nome: [schemaData?.nome || '', [Validators.required, Validators.minLength(3)]],
      categoria: [schemaData?.categoria || '', Validators.required],
      ativo: [schemaData?.ativo ?? true],
      observacoes: [schemaData?.observacoes || ''],
      parametros: this.fb.array([])
    });

    // Se está editando, carregar parâmetros existentes
    if (schemaData?.parametros) {
      schemaData.parametros.forEach(param => {
        this.addParametro(param);
      });
    }
  }

  get parametros(): FormArray {
    return this.form.get('parametros') as FormArray;
  }

  addParametro(param?: ParametroExame) {
    const parametroGroup = this.fb.group({
      id: [param?.id || '', Validators.required],
      label: [param?.label || '', Validators.required],
      unidade: [param?.unidade || ''],
      tipo: [param?.tipo || 'number', Validators.required],
      obrigatorio: [param?.obrigatorio ?? false],
      grupo: [param?.grupo || ''],
      isCalculado: [param?.isCalculado ?? false],
      formula: [param?.formula || ''],
      min: [param?.min],
      max: [param?.max],
      opcoes: [param?.opcoes?.join(', ') || '']
    });

    this.parametros.push(parametroGroup);
  }

  removeParametro(index: number) {
    if (confirm('Deseja remover este parâmetro?')) {
      this.parametros.removeAt(index);
    }
  }

  getParametroTipo(index: number): string {
    return this.parametros.at(index).get('tipo')?.value;
  }

  getParametroIsCalculado(index: number): boolean {
    return this.parametros.at(index).get('isCalculado')?.value;
  }

  getInputClass(fieldName: string): string {
    const field = this.form.get(fieldName);
    const isInvalid = field?.invalid && (field?.dirty || field?.touched);
    
    return `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 ${
      isInvalid 
        ? 'border-error focus:border-error' 
        : 'border-gray-300 focus:border-primary'
    }`;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field?.invalid && (field?.dirty || field?.touched));
  }

  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('fixed')) {
      this.close.emit();
    }
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastService.showError('Preencha todos os campos obrigatórios');
      return;
    }

    if (this.parametros.length === 0) {
      this.toastService.showError('Adicione pelo menos um parâmetro ao exame');
      return;
    }

    this.submitting.set(true);

    try {
      const formValue = this.form.value;
      
      // Processar parâmetros
      const parametros: ParametroExame[] = formValue.parametros.map((p: any) => ({
        id: p.id,
        label: p.label,
        unidade: p.unidade,
        tipo: p.tipo,
        obrigatorio: p.obrigatorio,
        grupo: p.grupo || undefined,
        isCalculado: p.isCalculado,
        formula: p.isCalculado ? p.formula : undefined,
        min: p.min || undefined,
        max: p.max || undefined,
        opcoes: p.tipo === 'select' && p.opcoes 
          ? p.opcoes.split(',').map((o: string) => o.trim()).filter(Boolean)
          : undefined
      }));

      const schemaData = {
        nome: formValue.nome,
        categoria: formValue.categoria,
        ativo: formValue.ativo,
        observacoes: formValue.observacoes || undefined,
        parametros
      };

      if (this.isEditMode() && this.schema()) {
        await this.schemaRepository.update(this.schema()!.id, schemaData);
        this.toastService.showSuccess('Schema atualizado com sucesso');
      } else {
        // Verificar se já existe schema com o mesmo nome
        const existentes = await new Promise<SchemaExame[]>((resolve) => {
          this.schemaRepository.getByNome(formValue.nome).subscribe(resolve);
        });

        if (existentes.length > 0) {
          this.toastService.showError('Já existe um schema ativo com este nome');
          this.submitting.set(false);
          return;
        }

        await this.schemaRepository.add({
          ...schemaData,
          criadoPor: 'current-user-id' // TODO: Pegar do auth
        });
        this.toastService.showSuccess('Schema criado com sucesso');
      }

      this.saved.emit();
      this.close.emit();
    } catch (error) {
      console.error('Erro ao salvar schema:', error);
      this.toastService.showError('Erro ao salvar schema');
    } finally {
      this.submitting.set(false);
    }
  }
}
