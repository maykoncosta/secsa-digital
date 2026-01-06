import { Component, signal, inject, output, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button.component';
import { LucideAngularModule, X, Plus, Trash2, Save, Edit2 } from 'lucide-angular';
import { SchemaExame, ParametroExame, FaixaReferencia, CondicaoReferencia } from '../../../../data/interfaces/exame.interface';
import { SchemaExameRepository } from '../../../../data/repositories/schema-exame.repository';
import { ToastService } from '../../../../core/services/toast.service';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-schema-exame-edit-modal',
  standalone: true,
  imports: [
    CommonModule,
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
          <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden" (click)="$event.stopPropagation()">
            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-primary to-primary/80">
              <div class="text-white">
                <h2 class="text-xl font-semibold">Editar Valores de Referência</h2>
                @if (schema()) {
                  <p class="text-sm text-white/90 mt-1">{{ schema()!.nome }}</p>
                }
              </div>
              <button
                (click)="close()"
                class="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
              >
                <lucide-icon [img]="X" class="w-5 h-5" />
              </button>
            </div>

            <!-- Body -->
            <div class="px-6 py-4 overflow-y-auto" style="max-height: calc(90vh - 140px);">
              <!-- Parâmetros por Grupo -->
              @for (grupo of grupos(); track grupo) {
                <div class="mb-6">
                  <div class="flex items-center justify-between mb-3 pb-2 border-b-2 border-primary/20">
                    <h3 class="text-lg font-semibold text-slate-900">{{ grupo }}</h3>
                  </div>
                  
                  @for (param of getParametrosPorGrupo(grupo); track param.id) {
                    <div class="bg-white border border-slate-200 rounded-lg p-4 mb-4">
                      <div class="flex items-start justify-between mb-3">
                        <div class="flex-1">
                          <h4 class="text-sm font-semibold text-slate-900">{{ param.label }}</h4>
                          <p class="text-xs text-slate-500 mt-1">
                            Unidade: {{ param.unidade }}
                            @if (param.isCalculado) {
                              <span class="ml-2 text-blue-600">(Calculado: {{ param.formula }})</span>
                            }
                          </p>
                        </div>
                      </div>
                      
                      <!-- Faixas de Referência -->
                      <div class="mt-3">
                          <div class="flex items-center justify-between mb-2">
                            <span class="text-xs font-semibold text-slate-700 uppercase">Faixas de Referência</span>
                            <button
                              (click)="adicionarFaixa(param.id)"
                              class="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium"
                            >
                              <lucide-icon [img]="Plus" class="w-3 h-3" />
                              Nova Faixa
                            </button>
                          </div>

                          @if (getFaixas(param.id).length === 0) {
                            <div class="text-center py-4 text-sm text-slate-500 bg-slate-50 rounded border border-dashed border-slate-300">
                              Nenhuma faixa definida. Clique em "Nova Faixa" para adicionar.
                            </div>
                          } @else {
                            <div class="space-y-2">
                              @for (faixa of getFaixas(param.id); track faixa.id; let idx = $index) {
                                <div class="border border-slate-200 rounded-lg p-3 bg-slate-50">
                                  <div class="grid grid-cols-12 gap-2 items-start">
                                    <!-- Descrição -->
                                    <div class="col-span-3">
                                      <label class="block text-xs font-medium text-slate-600 mb-1">Descrição</label>
                                      <input
                                        type="text"
                                        [value]="faixa.descricao"
                                        (input)="updateFaixa(param.id, faixa.id, 'descricao', $event)"
                                        class="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-primary/20"
                                        placeholder="Ex: Homens adultos"
                                      />
                                    </div>

                                    <!-- Min -->
                                    <div class="col-span-2">
                                      <label class="block text-xs font-medium text-slate-600 mb-1">Mín</label>
                                      <input
                                        type="number"
                                        step="0.01"
                                        [value]="faixa.min"
                                        (input)="updateFaixa(param.id, faixa.id, 'min', $event)"
                                        class="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-primary/20"
                                      />
                                    </div>

                                    <!-- Max -->
                                    <div class="col-span-2">
                                      <label class="block text-xs font-medium text-slate-600 mb-1">Máx</label>
                                      <input
                                        type="number"
                                        step="0.01"
                                        [value]="faixa.max"
                                        (input)="updateFaixa(param.id, faixa.id, 'max', $event)"
                                        class="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-primary/20"
                                      />
                                    </div>

                                    <!-- Condições -->
                                    <div class="col-span-4">
                                      <label class="block text-xs font-medium text-slate-600 mb-1">Condições</label>
                                      <button
                                        (click)="editarCondicao(param.id, faixa.id)"
                                        class="w-full px-2 py-1 text-xs border border-slate-300 rounded hover:bg-white text-left flex items-center justify-between"
                                      >
                                        <span class="truncate">{{ formatarCondicao(faixa.condicao) }}</span>
                                        <lucide-icon [img]="Edit2" class="w-3 h-3 flex-shrink-0" />
                                      </button>
                                    </div>

                                    <!-- Ações -->
                                    <div class="col-span-1 flex items-end">
                                      <button
                                        (click)="removerFaixa(param.id, faixa.id)"
                                        class="p-1 text-red-600 hover:bg-red-50 rounded"
                                        title="Remover"
                                      >
                                        <lucide-icon [img]="Trash2" class="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              }
                            </div>
                          }
                        </div>
                    </div>
                  }
                </div>
              }
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
              <app-button
                variant="secondary"
                (onClick)="close()"
                type="button"
              >
                Cancelar
              </app-button>
              <app-button
                variant="primary"
                (onClick)="save()"
                type="button"
                [disabled]="saving()"
              >
                <lucide-icon [img]="Save" class="w-4 h-4 mr-2" />
                {{ saving() ? 'Salvando...' : 'Salvar Alterações' }}
              </app-button>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Modal de Condições -->
    @if (showCondicaoModal()) {
      <div class="fixed inset-0 z-[60] overflow-y-auto" (click)="$event.stopPropagation()">
        <div class="flex min-h-screen items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/50"></div>
          
          <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-md" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between px-6 py-4 border-b">
              <h3 class="text-lg font-semibold">Editar Condições</h3>
              <button (click)="fecharCondicaoModal()" class="text-slate-400 hover:text-slate-600">
                <lucide-icon [img]="X" class="w-5 h-5" />
              </button>
            </div>

            <div class="px-6 py-4 space-y-4">
              <!-- Tipo de Condição -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Tipo de Condição</label>
                <select
                  [(ngModel)]="condicaoEditando.tipo"
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Sem condição (padrão)</option>
                  <option value="sexo">Sexo</option>
                  <option value="idade">Idade</option>
                  <option value="idade_e_sexo">Idade e Sexo</option>
                </select>
              </div>

              @if (condicaoEditando.tipo === 'sexo' || condicaoEditando.tipo === 'idade_e_sexo') {
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Sexo</label>
                  <select
                    [(ngModel)]="condicaoEditando.sexo"
                    class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Selecione...</option>
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                  </select>
                </div>
              }

              @if (condicaoEditando.tipo === 'idade' || condicaoEditando.tipo === 'idade_e_sexo') {
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Unidade de Idade</label>
                  <select
                    [(ngModel)]="condicaoEditando.unidadeIdade"
                    class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="anos">Anos</option>
                    <option value="meses">Meses</option>
                    <option value="dias">Dias</option>
                  </select>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">Idade Mínima</label>
                    <input
                      type="number"
                      [(ngModel)]="condicaoEditando.idadeMin"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">Idade Máxima</label>
                    <input
                      type="number"
                      [(ngModel)]="condicaoEditando.idadeMax"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20"
                      placeholder="999"
                    />
                  </div>
                </div>
              }
            </div>

            <div class="flex items-center justify-end gap-3 px-6 py-4 border-t bg-slate-50">
              <app-button variant="secondary" (onClick)="fecharCondicaoModal()">
                Cancelar
              </app-button>
              <app-button variant="primary" (onClick)="salvarCondicao()">
                Aplicar
              </app-button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class SchemaExameEditModalComponent {
  private schemaRepository = inject(SchemaExameRepository);
  private toastService = inject(ToastService);

  // Inputs/Outputs
  isOpen = input(false);
  schema = input<SchemaExame | null>(null);
  onClose = output<void>();
  onSave = output<void>();

  // State
  saving = signal(false);
  parametrosModificados = new Map<string, Partial<ParametroExame>>();
  
  // Modal de condições
  showCondicaoModal = signal(false);
  parametroCondicaoId = '';
  faixaCondicaoId = '';
  condicaoEditando: Partial<CondicaoReferencia> = {};

  // Icons
  X = X;
  Plus = Plus;
  Trash2 = Trash2;
  Save = Save;
  Edit2 = Edit2;

  constructor() {
    effect(() => {
      const schema = this.schema();
      if (schema && this.isOpen()) {
        this.parametrosModificados.clear();
      }
    });
  }

  grupos(): string[] {
    const schema = this.schema();
    if (!schema) return [];
    
    const grupos = new Set<string>();
    schema.parametros.forEach(p => {
      if (p.grupo) grupos.add(p.grupo);
    });
    
    return Array.from(grupos);
  }

  getParametrosPorGrupo(grupo: string): ParametroExame[] {
    const schema = this.schema();
    if (!schema) return [];
    
    return schema.parametros.filter(p => p.grupo === grupo);
  }

  getFaixas(parametroId: string): FaixaReferencia[] {
    const schema = this.schema();
    if (!schema) return [];
    
    const param = schema.parametros.find(p => p.id === parametroId);
    if (!param) return [];
    
    // Buscar modificações primeiro
    const mod = this.parametrosModificados.get(parametroId);
    if (mod?.faixasReferencia) {
      return mod.faixasReferencia;
    }
    
    return param.faixasReferencia || [];
  }

  adicionarFaixa(parametroId: string) {
    const faixasAtuais = this.getFaixas(parametroId);
    const novaFaixa: FaixaReferencia = {
      id: `faixa_${Date.now()}`,
      descricao: 'Nova faixa',
      min: 0,
      max: 0,
      ordem: faixasAtuais.length
    };
    
    const mod = this.parametrosModificados.get(parametroId) || {};
    this.parametrosModificados.set(parametroId, {
      ...mod,
      faixasReferencia: [...faixasAtuais, novaFaixa]
    });
  }

  removerFaixa(parametroId: string, faixaId: string) {
    const faixasAtuais = this.getFaixas(parametroId);
    const novasFaixas = faixasAtuais.filter(f => f.id !== faixaId);
    
    const mod = this.parametrosModificados.get(parametroId) || {};
    this.parametrosModificados.set(parametroId, {
      ...mod,
      faixasReferencia: novasFaixas
    });
  }

  updateFaixa(parametroId: string, faixaId: string, campo: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const faixasAtuais = this.getFaixas(parametroId);
    
    const novasFaixas = faixasAtuais.map(f => {
      if (f.id !== faixaId) return f;
      
      let valor: any = input.value;
      if (campo === 'min' || campo === 'max') {
        valor = parseFloat(input.value);
      }
      
      return { ...f, [campo]: valor };
    });
    
    const mod = this.parametrosModificados.get(parametroId) || {};
    this.parametrosModificados.set(parametroId, {
      ...mod,
      faixasReferencia: novasFaixas
    });
  }

  editarCondicao(parametroId: string, faixaId: string) {
    const faixas = this.getFaixas(parametroId);
    const faixa = faixas.find(f => f.id === faixaId);
    
    if (!faixa) return;
    
    this.parametroCondicaoId = parametroId;
    this.faixaCondicaoId = faixaId;
    this.condicaoEditando = faixa.condicao ? { ...faixa.condicao } : { tipo: '' as any };
    this.showCondicaoModal.set(true);
  }

  salvarCondicao() {
    const faixasAtuais = this.getFaixas(this.parametroCondicaoId);
    
    const novasFaixas = faixasAtuais.map(f => {
      if (f.id !== this.faixaCondicaoId) return f;
      
      // Se não tem tipo, remover condição
      if (!this.condicaoEditando.tipo) {
        const { condicao, ...rest } = f;
        return rest;
      }
      
      return {
        ...f,
        condicao: this.condicaoEditando as CondicaoReferencia
      };
    });
    
    const mod = this.parametrosModificados.get(this.parametroCondicaoId) || {};
    this.parametrosModificados.set(this.parametroCondicaoId, {
      ...mod,
      faixasReferencia: novasFaixas
    });
    
    this.fecharCondicaoModal();
  }

  fecharCondicaoModal() {
    this.showCondicaoModal.set(false);
    this.parametroCondicaoId = '';
    this.faixaCondicaoId = '';
    this.condicaoEditando = {};
  }

  formatarCondicao(condicao?: CondicaoReferencia): string {
    if (!condicao || !condicao.tipo) {
      return 'Sem condição (padrão)';
    }
    
    const partes: string[] = [];
    
    if (condicao.sexo) {
      partes.push(condicao.sexo === 'M' ? 'Masculino' : 'Feminino');
    }
    
    if (condicao.idadeMin !== undefined || condicao.idadeMax !== undefined) {
      const unidade = condicao.unidadeIdade || 'anos';
      const min = condicao.idadeMin ?? 0;
      const max = condicao.idadeMax ?? '∞';
      partes.push(`${min}-${max} ${unidade}`);
    }
    
    return partes.length > 0 ? partes.join(', ') : 'Condição configurada';
  }

  async save() {
    const schema = this.schema();
    if (!schema) return;

    this.saving.set(true);

    try {
      // Atualizar parâmetros com as modificações
      const parametrosAtualizados = schema.parametros.map(param => {
        const mod = this.parametrosModificados.get(param.id);
        if (!mod) return param;
        
        // Se tem faixasReferencia, remover min/max antigos
        if (mod.faixasReferencia && mod.faixasReferencia.length > 0) {
          const { min, max, ...paramSemMinMax } = param;
          return { ...paramSemMinMax, ...mod };
        }
        
        return { ...param, ...mod };
      });

      const updateData = {
        parametros: parametrosAtualizados,
        atualizadoEm: Timestamp.now()
      };

      await this.schemaRepository.update(schema.id, updateData);
      
      this.toastService.show('Valores de referência atualizados com sucesso!', 'success');
      this.onSave.emit();
      this.close();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      this.toastService.show('Erro ao salvar alterações', 'error');
    } finally {
      this.saving.set(false);
    }
  }

  close() {
    this.parametrosModificados.clear();
    this.onClose.emit();
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }
}
