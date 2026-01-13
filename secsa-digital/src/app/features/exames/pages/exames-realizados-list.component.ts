import { Component, OnInit, OnDestroy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { LayoutComponent } from '../../../shared/components/layout.component';
import { ButtonComponent } from '../../../shared/components/button.component';
import { PaginationComponent, PaginationConfig } from '../../../shared/components/pagination.component';
import { TableSkeletonComponent } from '../../../shared/components/table-skeleton.component';
import { LucideAngularModule, Search, Plus, Eye, Edit, CheckCircle, XCircle, Printer, FileText, Calendar, User, X, Trash2 } from 'lucide-angular';
import { ExameRealizadoRepository } from '../../../data/repositories/exame-realizado.repository';
import { ExameRealizado, SchemaExame } from '../../../data/interfaces/exame.interface';
import { ToastService } from '../../../core/services/toast.service';
import { ExameRealizadoFormModalComponent } from '../components/modals/exame-realizado-form-modal.component';
import { LancarResultadosModalComponent } from '../components/modals/lancar-resultados-modal.component';
import { VisualizarResultadoModalComponent } from '../components/modals/visualizar-resultado-modal.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog.component';
import { SchemaExameRepository } from '../../../data/repositories/schema-exame.repository';
import { PacienteRepository } from '../../../data/repositories/paciente.repository';
import { Paciente } from '../../../data/interfaces/paciente.interface';
import { PdfLaudoService } from '../../../core/services/pdf-laudo.service';
import { EtiquetaService } from '../../../core/services/etiqueta.service';

@Component({
  selector: 'app-exames-realizados-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LayoutComponent,
    ButtonComponent,
    PaginationComponent,
    TableSkeletonComponent,
    LucideAngularModule,
    ExameRealizadoFormModalComponent,
    LancarResultadosModalComponent,
    VisualizarResultadoModalComponent,
    ConfirmDialogComponent
  ],
  template: `
    <app-layout>
      <div header>Exames Realizados</div>
      
      <div class="space-y-6">
        <!-- Filtros e Ações -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="space-y-4">
            <!-- Primeira linha: Busca e Ações -->
            <div class="flex items-center justify-between gap-4 flex-wrap">
              <div class="flex-1 flex items-center gap-3">
                <!-- Autocomplete de Paciente -->
                <div class="flex-1 max-w-md relative">
                  <lucide-icon [img]="User" class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar paciente..."
                    [(ngModel)]="pacienteSearchTerm"
                    (input)="onPacienteSearch()"
                    (focus)="showPacienteSuggestions = true"
                    class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  @if (selectedPaciente()) {
                    <button
                      (click)="clearPacienteFilter()"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      title="Limpar filtro"
                    >
                      <lucide-icon [img]="X" class="w-4 h-4" />
                    </button>
                  }
                  
                  <!-- Suggestions dropdown -->
                  @if (showPacienteSuggestions && pacienteSuggestions().length > 0 && !selectedPaciente()) {
                    <div class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                      @for (paciente of pacienteSuggestions().slice(0, 10); track paciente.id) {
                        <button
                          (click)="selectPaciente(paciente)"
                          class="w-full px-4 py-2 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
                        >
                          <div class="font-medium text-slate-900">{{ paciente.nomeCompleto }}</div>
                          <div class="text-xs text-slate-500">CPF: {{ paciente.cpf }} | CNS: {{ paciente.cns }}</div>
                        </button>
                      }
                    </div>
                  }
                </div>
              </div>
              
              <div class="flex items-center gap-3">
                @if (examesPendentes().length > 0) {
                  <app-button
                    variant="secondary"
                    (onClick)="imprimirEtiquetasPendentes()"
                  >
                    <lucide-icon [img]="Printer" class="w-4 h-4 mr-2" />
                    Etiquetas ({{ examesPendentes().length }})
                  </app-button>
                }
                
                <app-button
                  variant="primary"
                  (onClick)="openNewExameModal()"
                >
                  <lucide-icon [img]="Plus" class="w-4 h-4 mr-2" />
                  Novo Exame
                </app-button>
              </div>
            </div>
            
            <!-- Segunda linha: Filtros detalhados -->
            <div class="flex items-center gap-3 flex-wrap">
              <!-- Select de Tipo de Exame -->
              <div class="flex flex-col gap-1">
                <label class="text-xs font-medium text-slate-600">Tipo de Exame</label>
                <select
                  [(ngModel)]="schemaFilter"
                  (ngModelChange)="onFilterChange()"
                  class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">Todos os Exames</option>
                  @for (schema of schemasAtivos(); track schema.id) {
                    <option [value]="schema.id">{{ schema.nome }}</option>
                  }
                </select>
              </div>
              
              <!-- Select de Status -->
              <div class="flex flex-col gap-1">
                <label class="text-xs font-medium text-slate-600">Status</label>
                <select
                  [(ngModel)]="statusFilter"
                  (ngModelChange)="onFilterChange()"
                  class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">Todos os Status</option>
                  <option value="pendente">Pendente</option>
                  <option value="finalizado">Finalizado</option>
                  <option value="liberado">Liberado</option>
                </select>
              </div>
              
              <!-- Data Coleta Início -->
              <div class="flex flex-col gap-1">
                <label class="text-xs font-medium text-slate-600">Data Coleta - Início</label>
                <div class="relative">
                  <lucide-icon [img]="Calendar" class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="date"
                    [(ngModel)]="dataColetaInicio"
                    (ngModelChange)="onFilterChange()"
                    class="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
              
              <!-- Data Coleta Fim -->
              <div class="flex flex-col gap-1">
                <label class="text-xs font-medium text-slate-600">Data Coleta - Fim</label>
                <div class="relative">
                  <lucide-icon [img]="Calendar" class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="date"
                    [(ngModel)]="dataColetaFim"
                    (ngModelChange)="onFilterChange()"
                    class="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
              
              @if (hasActiveFilters()) {
                <button
                  (click)="clearAllFilters()"
                  class="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Limpar filtros
                </button>
              }
            </div>
          </div>
        </div>
        
        <!-- Tabela de Exames -->
        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
          @if (loading()) {
            <div class="p-6">
              <app-table-skeleton [rows]="pageSize()" [columns]="6" />
            </div>
          } @else if (filteredExames().length === 0) {
            <div class="p-12 text-center">
              <lucide-icon [img]="FileText" class="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p class="text-slate-600">Nenhum exame encontrado.</p>
              <p class="text-sm text-slate-500 mt-2">Clique em "Novo Exame" para cadastrar.</p>
            </div>
          } @else {
            <table class="w-full">
              <thead class="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Paciente</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Exame</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Data Coleta</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Data Cadastro</th>
                  <th class="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                @for (exame of filteredExames(); track exame.uid) {
                  <tr class="hover:bg-slate-50 transition-colors">
                    <td class="px-6 py-4">
                      <div class="text-sm font-medium text-slate-900">{{ exame.paciente.nome }}</div>
                      <div class="text-xs text-slate-500">CPF: {{ exame.paciente.cpf }}</div>
                    </td>
                    <td class="px-6 py-4">
                      <div class="text-sm text-slate-900">{{ exame.schemaNome }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {{ formatDate(exame.dataColeta) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span 
                        class="px-2 py-1 text-xs font-medium rounded-full"
                        [class.bg-yellow-100]="exame.status === 'pendente'"
                        [class.text-yellow-800]="exame.status === 'pendente'"
                        [class.bg-blue-100]="exame.status === 'finalizado'"
                        [class.text-blue-800]="exame.status === 'finalizado'"
                        [class.bg-green-100]="exame.status === 'liberado'"
                        [class.text-green-800]="exame.status === 'liberado'"
                      >
                        {{ getStatusLabel(exame.status) }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {{ formatDate(exame.dataCadastro) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div class="flex items-center justify-end gap-2">
                        @if (exame.status === 'pendente') {
                          <button
                            (click)="lancarResultados(exame)"
                            class="text-primary hover:text-primary-dark p-2 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Lançar Resultados"
                          >
                            <lucide-icon [img]="Edit" class="w-4 h-4" />
                          </button>
                          <button
                            (click)="excluirExame(exame)"
                            class="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            title="Excluir Exame"
                          >
                            <lucide-icon [img]="Trash2" class="w-4 h-4" />
                          </button>
                        }
                        
                        @if (exame.status === 'finalizado') {
                          <button
                            (click)="lancarResultados(exame)"
                            class="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                            title="Editar Resultados"
                          >
                            <lucide-icon [img]="Edit" class="w-4 h-4" />
                          </button>
                          <button
                            (click)="liberarExame(exame)"
                            class="text-green-600 hover:text-green-700 p-2 rounded-lg hover:bg-green-50 transition-colors"
                            title="Liberar Exame"
                          >
                            <lucide-icon [img]="CheckCircle" class="w-4 h-4" />
                          </button>
                        }
                        
                        @if (exame.status === 'liberado') {
                          <button
                            (click)="imprimirLaudo(exame)"
                            class="text-primary hover:text-primary-dark p-2 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Imprimir Laudo"
                          >
                            <lucide-icon [img]="Printer" class="w-4 h-4" />
                          </button>
                        }
                        
                        <button
                          (click)="visualizarExame(exame)"
                          class="text-slate-600 hover:text-slate-900 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Visualizar"
                        >
                          <lucide-icon [img]="Eye" class="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
        
        <!-- Pagination -->
        @if (!loading() && filteredExames().length > 0) {
          <div class="mt-6">
            <app-pagination
              [config]="paginationConfig()"
              (pageChange)="onPageChange($event)"
              (pageSizeChange)="onPageSizeChange($event)"
            />
          </div>
        }
      </div>
      
      <!-- Modal de Cadastro -->
      <app-exame-realizado-form-modal
        [isOpen]="showModal()"
        [exameToEdit]="selectedExame()"
        (onClose)="closeModal()"
        (onSave)="onExameSaved()"
      />
      
      <!-- Modal de Lançar Resultados -->
      <app-lancar-resultados-modal
        [isOpen]="showResultadosModal()"
        [exame]="exameParaResultados()"
        (onClose)="closeResultadosModal()"
        (onSave)="onResultadosSalvos()"
      />
      
      <!-- Modal de Visualização -->
      <app-visualizar-resultado-modal
        [isOpen]="showVisualizarModal()"
        [exame]="exameParaVisualizar()"
        (onClose)="closeVisualizarModal()"
      />

      <!-- Confirm Dialog -->
      <app-confirm-dialog
        [isOpen]="showConfirmDialog()"
        [data]="confirmDialogData()"
        (confirmed)="onConfirmDialogConfirm()"
        (cancelled)="onConfirmDialogCancel()"
      />
    </app-layout>
  `
})
export class ExamesRealizadosListComponent implements OnInit, OnDestroy {
  // Icons
  Search = Search;
  Plus = Plus;
  Eye = Eye;
  Edit = Edit;
  CheckCircle = CheckCircle;
  XCircle = XCircle;
  Printer = Printer;
  FileText = FileText;
  Calendar = Calendar;
  User = User;
  X = X;
  Trash2 = Trash2;

  // Services
  private exameRepository = inject(ExameRealizadoRepository);
  private schemaRepository = inject(SchemaExameRepository);
  private pacienteRepository = inject(PacienteRepository);
  private pdfService = inject(PdfLaudoService);
  private etiquetaService = inject(EtiquetaService);
  private toastService = inject(ToastService);

  // Modals
  showResultadosModal = signal(false);
  exameParaResultados = signal<ExameRealizado | null>(null);
  showVisualizarModal = signal(false);
  exameParaVisualizar = signal<ExameRealizado | null>(null);

  // Confirm Dialog
  showConfirmDialog = signal(false);
  confirmDialogData = signal<ConfirmDialogData>({
    title: '',
    message: '',
    type: 'info'
  });
  confirmAction: (() => void) | null = null;
  
  showModal = signal(false);
  selectedExame = signal<ExameRealizado | null>(null);

  // State
  exames = signal<ExameRealizado[]>([]);
  filteredExames = signal<ExameRealizado[]>([]);
  loading = signal(true);
  
  // Computed para exames pendentes
  examesPendentes = computed(() => {
    return this.filteredExames().filter(e => e.status === 'pendente');
  });
  
  // Autocomplete de Paciente com debounce
  pacienteSearchTerm = '';
  private pacienteSearchSubject = new Subject<string>();
  pacienteSuggestions = signal<Paciente[]>([]);
  selectedPaciente = signal<Paciente | null>(null);
  showPacienteSuggestions = false;
  
  // Schemas ativos para o select
  schemasAtivos = signal<SchemaExame[]>([]);
  
  // Filters
  schemaFilter = '';
  statusFilter = '';
  dataColetaInicio = '';
  dataColetaFim = '';
  
  // Pagination
  currentPage = signal(1);
  pageSize = signal(10);
  totalItems = signal(0);
  lastDoc: any = null;
  firstDoc: any = null;
  
  paginationConfig = computed<PaginationConfig>(() => ({
    currentPage: this.currentPage(),
    pageSize: this.pageSize(),
    totalItems: this.totalItems()
  }));

  ngOnInit() {
    // Setup debounce para busca de pacientes
    this.pacienteSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(async (term) => {
      if (!term.trim()) {
        this.pacienteSuggestions.set([]);
        return;
      }

      try {
        console.log('🔍 Buscando pacientes com debounce:', term);
        const result = await this.pacienteRepository.getPaginated(1, 10, term);
        this.pacienteSuggestions.set(result.items);
      } catch (error) {
        console.error('❌ Erro ao buscar pacientes:', error);
      }
    });

    this.loadSchemasAtivos();
    this.loadExames();
  }

  ngOnDestroy() {
    this.pacienteSearchSubject.complete();
  }
  
  async loadSchemasAtivos() {
    try {
      const result = await this.schemaRepository.getPaginated(1, 1000);
      this.schemasAtivos.set(result.items.filter(s => s.ativo));
    } catch (error) {
      console.error('Erro ao carregar schemas:', error);
    }
  }

  async loadExames() {
    this.loading.set(true);
    try {
      const filters: {
        pacienteId?: string;
        schemaId?: string;
        status?: 'pendente' | 'finalizado' | 'liberado';
        dataColetaInicio?: Date;
        dataColetaFim?: Date;
      } = {};
      
      if (this.selectedPaciente()) {
        filters.pacienteId = this.selectedPaciente()!.id;
      }
      if (this.schemaFilter) {
        filters.schemaId = this.schemaFilter;
      }
      if (this.statusFilter) {
        filters.status = this.statusFilter as 'pendente' | 'finalizado' | 'liberado';
      }
      if (this.dataColetaInicio) {
        filters.dataColetaInicio = new Date(this.dataColetaInicio);
      }
      if (this.dataColetaFim) {
        filters.dataColetaFim = new Date(this.dataColetaFim);
      }

      console.log('🔍 Filtros aplicados:', filters);

      const result = await this.exameRepository.getPaginated(
        this.currentPage(),
        this.pageSize(),
        filters,
        this.lastDoc,
        this.firstDoc
      );
      
      this.filteredExames.set(result.items);
      this.totalItems.set(result.total);
      this.lastDoc = result.lastDoc;
      this.firstDoc = result.firstDoc;
      this.loading.set(false);
    } catch (error) {
      console.error('Erro ao carregar exames:', error);
      this.toastService.show('Erro ao carregar exames realizados', 'error');
      this.loading.set(false);
    }
  }
  
  async onPacienteSearch() {
    // Delega para o Subject que já tem debounce configurado
    this.pacienteSearchSubject.next(this.pacienteSearchTerm);
  }
  
  selectPaciente(paciente: Paciente) {
    this.selectedPaciente.set(paciente);
    this.pacienteSearchTerm = paciente.nomeCompleto;
    this.showPacienteSuggestions = false;
    this.pacienteSuggestions.set([]);
    this.currentPage.set(1);
    this.loadExames();
  }
  
  clearPacienteFilter() {
    this.selectedPaciente.set(null);
    this.pacienteSearchTerm = '';
    this.pacienteSuggestions.set([]);
    this.currentPage.set(1);
    this.loadExames();
  }
  
  onFilterChange() {
    this.currentPage.set(1);
    this.loadExames();
  }
  
  hasActiveFilters(): boolean {
    return !!(this.selectedPaciente() || this.schemaFilter || this.statusFilter || 
              this.dataColetaInicio || this.dataColetaFim);
  }
  
  clearAllFilters() {
    this.selectedPaciente.set(null);
    this.pacienteSearchTerm = '';
    this.schemaFilter = '';
    this.statusFilter = '';
    this.dataColetaInicio = '';
    this.dataColetaFim = '';
    this.currentPage.set(1);
    this.loadExames();
  }
  
  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadExames();
  }
  
  onPageSizeChange(pageSize: number) {
    this.pageSize.set(pageSize);
    this.currentPage.set(1);
    this.loadExames();
  }

  formatDate(timestamp: any): string {
    if (!timestamp) return '-';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'pendente': 'Pendente',
      'finalizado': 'Finalizado',
      'liberado': 'Liberado'
    };
    return labels[status] || status;
  }

  openNewExameModal() {
    this.selectedExame.set(null);
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.selectedExame.set(null);
  }

  onExameSaved() {
    this.loadExames();
  }

  lancarResultados(exame: ExameRealizado) {
    this.exameParaResultados.set(exame);
    this.showResultadosModal.set(true);
  }

  closeResultadosModal() {
    this.showResultadosModal.set(false);
    this.exameParaResultados.set(null);
  }

  onResultadosSalvos() {
    this.loadExames();
  }

  visualizarExame(exame: ExameRealizado) {
    this.exameParaVisualizar.set(exame);
    this.showVisualizarModal.set(true);
  }

  closeVisualizarModal() {
    this.showVisualizarModal.set(false);
    this.exameParaVisualizar.set(null);
  }

  async liberarExame(exame: ExameRealizado) {
    this.confirmDialogData.set({
      title: 'Liberar Exame',
      message: `Deseja liberar o exame "${exame.schemaNome}" do paciente ${exame.paciente.nome}?`,
      confirmText: 'Liberar',
      cancelText: 'Cancelar',
      type: 'info'
    });
    this.confirmAction = async () => {
      try {
        await this.exameRepository.updateStatus(exame.uid, 'liberado', 'current-user-id');
        this.toastService.show('Exame liberado com sucesso', 'success');
        this.loadExames();
      } catch (error) {
        console.error('Erro ao liberar exame:', error);
        this.toastService.show('Erro ao liberar exame', 'error');
      }
    };
    this.showConfirmDialog.set(true);
  }

  async excluirExame(exame: ExameRealizado) {
    if (exame.status !== 'pendente') {
      this.toastService.show('Apenas exames pendentes podem ser excluídos', 'error');
      return;
    }

    this.confirmDialogData.set({
      title: 'Excluir Exame',
      message: `Deseja realmente excluir o exame "${exame.schemaNome}" do paciente ${exame.paciente.nome}?\n\nEsta ação não pode ser desfeita.`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      type: 'danger'
    });
    this.confirmAction = async () => {
      try {
        await this.exameRepository.delete(exame.uid);
        this.toastService.show('Exame excluído com sucesso', 'success');
        this.loadExames();
      } catch (error) {
        console.error('Erro ao excluir exame:', error);
        this.toastService.show('Erro ao excluir exame', 'error');
      }
    };
    this.showConfirmDialog.set(true);
  }

  onConfirmDialogConfirm() {
    this.showConfirmDialog.set(false);
    if (this.confirmAction) {
      this.confirmAction();
      this.confirmAction = null;
    }
  }

  onConfirmDialogCancel() {
    this.showConfirmDialog.set(false);
    this.confirmAction = null;
  }

  async imprimirLaudo(exame: ExameRealizado) {
    // Buscar o schema antes de gerar o PDF
    this.schemaRepository.getById(exame.schemaId).subscribe({
      next: async (schema) => {
        if (!schema) {
          this.toastService.show('Erro: schema do exame não encontrado', 'error');
          return;
        }

        try {
          await this.pdfService.gerarLaudo(exame, schema);
          this.toastService.show('Laudo gerado com sucesso!', 'success');
        } catch (error) {
          console.error('Erro ao gerar PDF:', error);
          this.toastService.show('Erro ao gerar laudo PDF', 'error');
        }
      },
      error: (error) => {
        console.error('Erro ao buscar schema:', error);
        this.toastService.show('Erro ao carregar dados do exame', 'error');
      }
    });
  }

  imprimirEtiquetasPendentes() {
    const pendentes = this.examesPendentes();
    
    if (pendentes.length === 0) {
      this.toastService.show('Nenhum exame pendente para imprimir', 'info');
      return;
    }

    try {
      this.etiquetaService.gerarEtiquetasPendentes(pendentes);
      this.toastService.show(`${pendentes.length} etiqueta(s) gerada(s) com sucesso`, 'success');
    } catch (error) {
      console.error('Erro ao gerar etiquetas:', error);
      this.toastService.show('Erro ao gerar etiquetas', 'error');
    }
  }
}
