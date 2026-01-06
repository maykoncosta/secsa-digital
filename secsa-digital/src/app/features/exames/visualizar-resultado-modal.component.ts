import { Component, signal, inject, output, input, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../shared/components/button.component';
import { LucideAngularModule, X, User, Calendar, FileText, Printer } from 'lucide-angular';
import { ExameRealizado, SchemaExame, FaixaReferencia } from '../../data/interfaces/exame.interface';
import { SchemaExameRepository } from '../../data/repositories/schema-exame.repository';
import { ToastService } from '../../core/services/toast.service';
import { PdfLaudoService } from '../../core/services/pdf-laudo.service';
import { FaixaReferenciaService } from '../../core/services/faixa-referencia.service';

@Component({
  selector: 'app-visualizar-resultado-modal',
  standalone: true,
  imports: [
    CommonModule,
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
          <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl" (click)="$event.stopPropagation()">
            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-primary to-primary/80">
              <div class="text-white">
                <h2 class="text-xl font-semibold">Resultado do Exame</h2>
                @if (schema() && exame()) {
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
            <div class="px-6 py-4 max-h-[75vh] overflow-y-auto">
              @if (loading()) {
                <div class="py-12 text-center">
                  <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p class="mt-4 text-slate-600">Carregando resultados...</p>
                </div>
              } @else if (schema() && exame()) {
                <!-- Informações do Paciente e Exame -->
                <div class="grid grid-cols-2 gap-4 mb-6">
                  <!-- Card Paciente -->
                  <div class="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div class="flex items-center gap-2 mb-3">
                      <lucide-icon [img]="User" class="w-5 h-5 text-primary" />
                      <h3 class="font-semibold text-slate-900">Dados do Paciente</h3>
                    </div>
                    <div class="space-y-2 text-sm">
                      <div class="flex justify-between">
                        <span class="text-slate-600">Nome:</span>
                        <span class="font-medium text-slate-900">{{ exame()!.paciente.nome }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-600">CPF:</span>
                        <span class="font-medium text-slate-900">{{ exame()!.paciente.cpf }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-600">Idade:</span>
                        <span class="font-medium text-slate-900">{{ exame()!.paciente.idadeNaData }} anos</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-600">Sexo:</span>
                        <span class="font-medium text-slate-900">{{ exame()!.paciente.sexo === 'M' ? 'Masculino' : 'Feminino' }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Card Exame -->
                  <div class="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div class="flex items-center gap-2 mb-3">
                      <lucide-icon [img]="Calendar" class="w-5 h-5 text-primary" />
                      <h3 class="font-semibold text-slate-900">Dados do Exame</h3>
                    </div>
                    <div class="space-y-2 text-sm">
                      <div class="flex justify-between">
                        <span class="text-slate-600">Data Coleta:</span>
                        <span class="font-medium text-slate-900">{{ formatDate(exame()!.dataColeta) }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-600">Data Cadastro:</span>
                        <span class="font-medium text-slate-900">{{ formatDate(exame()!.dataCadastro) }}</span>
                      </div>
                      @if (exame()!.dataFinalizacao) {
                        <div class="flex justify-between">
                          <span class="text-slate-600">Finalizado em:</span>
                          <span class="font-medium text-slate-900">{{ formatDate(exame()!.dataFinalizacao) }}</span>
                        </div>
                      }
                      <div class="flex justify-between items-center">
                        <span class="text-slate-600">Status:</span>
                        <span 
                          class="px-2 py-1 text-xs font-medium rounded-full"
                          [class.bg-green-100]="exame()!.status === 'liberado'"
                          [class.text-green-800]="exame()!.status === 'liberado'"
                          [class.bg-blue-100]="exame()!.status === 'finalizado'"
                          [class.text-blue-800]="exame()!.status === 'finalizado'"
                        >
                          {{ exame()!.status === 'liberado' ? 'Liberado' : 'Finalizado' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Resultados por Grupo -->
                @for (grupo of gruposParametros(); track grupo) {
                  <div class="mb-6">
                    <div class="flex items-center justify-between mb-3 pb-2 border-b-2 border-primary/20">
                      <h3 class="text-lg font-semibold text-slate-900">{{ grupo }}</h3>
                    </div>
                    
                    <div class="bg-white border border-slate-200 rounded-lg overflow-hidden">
                      <table class="w-full">
                        <thead class="bg-slate-50">
                          <tr>
                            <th class="px-4 py-2 text-left text-xs font-semibold text-slate-600 uppercase">Parâmetro</th>
                            <th class="px-4 py-2 text-center text-xs font-semibold text-slate-600 uppercase">Resultado</th>
                            <th class="px-4 py-2 text-center text-xs font-semibold text-slate-600 uppercase">Valores de Referência</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-200">
                          @for (parametro of getParametrosPorGrupo(grupo); track parametro.id) {
                            <tr class="hover:bg-slate-50">
                              <td class="px-4 py-3 text-sm text-slate-900">
                                {{ parametro.label }}
                                @if (parametro.isCalculado) {
                                  <span class="ml-1 text-xs text-blue-600">(calculado)</span>
                                }
                              </td>
                              <td class="px-4 py-3 text-center">
                                @if (getResultado(parametro.id)) {
                                  <span class="font-semibold text-slate-900">
                                    {{ getResultado(parametro.id)!.valor }} {{ parametro.unidade }}
                                  </span>
                                } @else {
                                  <span class="text-slate-400 text-sm">-</span>
                                }
                              </td>
                              <td class="px-4 py-3 text-center text-sm text-slate-600">
                                @if (getFaixaReferencia(parametro.id)) {
                                  {{ getFaixaReferencia(parametro.id)!.min }} - {{ getFaixaReferencia(parametro.id)!.max }} {{ parametro.unidade }}
                                  @if (getFaixaReferencia(parametro.id)!.descricao && getFaixaReferencia(parametro.id)!.descricao !== 'Padrão') {
                                    <div class="text-xs text-primary mt-0.5">({{ getFaixaReferencia(parametro.id)!.descricao }})</div>
                                  }
                                } @else {
                                  <span class="text-slate-400">-</span>
                                }
                              </td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    </div>

                    <!-- Observações do Grupo -->
                    @if (getObservacaoGrupo(grupo)) {
                      <div class="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div class="flex items-start gap-2">
                          <lucide-icon [img]="FileText" class="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div class="flex-1">
                            <p class="text-xs font-semibold text-blue-900 mb-1">Observações - {{ grupo }}</p>
                            <p class="text-sm text-blue-800">{{ getObservacaoGrupo(grupo) }}</p>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                }

                <!-- Observações Técnicas Gerais -->
                @if (exame()!.observacoesTecnicas) {
                  <div class="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div class="flex items-start gap-3">
                      <lucide-icon [img]="FileText" class="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div class="flex-1">
                        <h4 class="text-sm font-semibold text-amber-900 mb-2">Observações Técnicas</h4>
                        <p class="text-sm text-amber-800 whitespace-pre-line">{{ exame()!.observacoesTecnicas }}</p>
                      </div>
                    </div>
                  </div>
                }
              }
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
              <app-button
                variant="secondary"
                (onClick)="close()"
                type="button"
              >
                Fechar
              </app-button>
              <app-button
                variant="primary"
                (onClick)="imprimir()"
                type="button"
              >
                <lucide-icon [img]="Printer" class="w-4 h-4 mr-2" />
                Imprimir Laudo
              </app-button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class VisualizarResultadoModalComponent implements OnInit {
  private schemaRepository = inject(SchemaExameRepository);
  private toastService = inject(ToastService);
  private pdfService = inject(PdfLaudoService);
  private faixaReferenciaService = inject(FaixaReferenciaService);

  // Inputs/Outputs
  isOpen = input(false);
  exame = input<ExameRealizado | null>(null);
  onClose = output<void>();

  // State
  loading = signal(true);
  schema = signal<SchemaExame | null>(null);
  faixasPorParametro = new Map<string, FaixaReferencia | null>();

  // Icons
  X = X;
  User = User;
  Calendar = Calendar;
  FileText = FileText;
  Printer = Printer;

  constructor() {
    // Reagir quando o exame mudar
    effect(() => {
      const exame = this.exame();
      if (exame && this.isOpen()) {
        this.loadSchema();
      }
    });
  }

  ngOnInit() {
    // O effect cuida do carregamento
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
          this.calcularFaixasPaciente(schema, exame);
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

  gruposParametros(): string[] {
    const schema = this.schema();
    if (!schema) return [];
    
    const grupos = new Set<string>();
    schema.parametros.forEach(p => {
      if (p.grupo) grupos.add(p.grupo);
    });
    
    return Array.from(grupos);
  }

  getParametrosPorGrupo(grupo: string) {
    const schema = this.schema();
    if (!schema) return [];
    
    return schema.parametros.filter(p => p.grupo === grupo);
  }

  getResultado(parametroId: string) {
    const exame = this.exame();
    if (!exame || !exame.resultados) return null;
    
    return exame.resultados[parametroId] || null;
  }

  getObservacaoGrupo(grupo: string): string | null {
    const exame = this.exame();
    if (!exame || !exame.observacoesGrupos) return null;
    
    return exame.observacoesGrupos[grupo] || null;
  }

  getFaixaReferencia(parametroId: string): FaixaReferencia | null {
    return this.faixasPorParametro.get(parametroId) || null;
  }

  formatDate(timestamp: any): string {
    if (!timestamp) return '-';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  imprimir() {
    const exame = this.exame();
    const schema = this.schema();
    
    if (!exame || !schema) {
      this.toastService.show('Erro: dados do exame não disponíveis', 'error');
      return;
    }

    try {
      this.pdfService.gerarLaudo(exame, schema);
      this.toastService.show('Laudo gerado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      this.toastService.show('Erro ao gerar laudo PDF', 'error');
    }
  }

  close() {
    this.schema.set(null);
    this.onClose.emit();
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }
}
