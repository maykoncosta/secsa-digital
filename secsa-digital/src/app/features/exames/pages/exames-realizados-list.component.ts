import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../../../shared/components/layout.component';
import { ButtonComponent } from '../../../shared/components/button.component';
import { LucideAngularModule, Search, Plus, Eye, Edit, CheckCircle, XCircle, Printer, FileText } from 'lucide-angular';
import { ExameRealizadoRepository } from '../../../data/repositories/exame-realizado.repository';
import { ExameRealizado } from '../../../data/interfaces/exame.interface';
import { ToastService } from '../../../core/services/toast.service';
import { ExameRealizadoFormModalComponent } from '../components/modals/exame-realizado-form-modal.component';
import { LancarResultadosModalComponent } from '../components/modals/lancar-resultados-modal.component';
import { VisualizarResultadoModalComponent } from '../components/modals/visualizar-resultado-modal.component';
import { SchemaExameRepository } from '../../../data/repositories/schema-exame.repository';
import { PdfLaudoService } from '../../../core/services/pdf-laudo.service';

@Component({
  selector: 'app-exames-realizados-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LayoutComponent,
    ButtonComponent,
    LucideAngularModule,
    ExameRealizadoFormModalComponent,
    LancarResultadosModalComponent,
    VisualizarResultadoModalComponent
  ],
  template: `
    <app-layout>
      <div header>Exames Realizados</div>
      
      <div class="space-y-6">
        <!-- Filtros e Ações -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between gap-4 flex-wrap">
            <div class="flex-1 max-w-md relative">
              <lucide-icon [img]="Search" class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por paciente ou exame..."
                [(ngModel)]="searchTerm"
                (ngModelChange)="onSearch()"
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            
            <div class="flex items-center gap-3">
              <select
                [(ngModel)]="statusFilter"
                (ngModelChange)="onSearch()"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Todos os Status</option>
                <option value="pendente">Pendente</option>
                <option value="finalizado">Finalizado</option>
                <option value="liberado">Liberado</option>
              </select>
              
              <app-button
                variant="primary"
                (onClick)="openNewExameModal()"
              >
                <lucide-icon [img]="Plus" class="w-4 h-4 mr-2" />
                Novo Exame
              </app-button>
            </div>
          </div>
        </div>
        
        <!-- Tabela de Exames -->
        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
          @if (loading()) {
            <div class="p-12 text-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p class="mt-4 text-slate-600">Carregando exames...</p>
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
                        }
                        
                        @if (exame.status === 'finalizado') {
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
    </app-layout>
  `
})
export class ExamesRealizadosListComponent implements OnInit {
  // Icons
  Search = Search;
  Plus = Plus;
  Eye = Eye;
  Edit = Edit;
  CheckCircle = CheckCircle;
  XCircle = XCircle;
  Printer = Printer;
  FileText = FileText;

  // Services
  private exameRepository = inject(ExameRealizadoRepository);
  private schemaRepository = inject(SchemaExameRepository);
  private pdfService = inject(PdfLaudoService);
  showResultadosModal = signal(false);
  exameParaResultados = signal<ExameRealizado | null>(null);
  showVisualizarModal = signal(false);
  exameParaVisualizar = signal<ExameRealizado | null>(null);
  private toastService = inject(ToastService);

  // State
  exames = signal<ExameRealizado[]>([]);
  filteredExames = signal<ExameRealizado[]>([]);
  loading = signal(true);
  showModal = signal(false);
  selectedExame = signal<ExameRealizado | null>(null);
  
  // Filters
  searchTerm = '';
  statusFilter = '';

  ngOnInit() {
    this.loadExames();
  }

  loadExames() {
    this.loading.set(true);
    this.exameRepository.getAll().subscribe({
      next: (exames) => {
        this.exames.set(exames);
        this.filteredExames.set(exames);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar exames:', error);
        this.toastService.show('Erro ao carregar exames realizados', 'error');
        this.loading.set(false);
      }
    });
  }

  onSearch() {
    let filtered = this.exames();

    // Filtro por texto
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(exame =>
        exame.paciente.nome.toLowerCase().includes(term) ||
        exame.schemaNome.toLowerCase().includes(term) ||
        exame.paciente.cpf.includes(term)
      );
    }

    // Filtro por status
    if (this.statusFilter) {
      filtered = filtered.filter(exame => exame.status === this.statusFilter);
    }

    this.filteredExames.set(filtered);
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
    if (!confirm(`Deseja liberar o exame "${exame.schemaNome}" do paciente ${exame.paciente.nome}?`)) {
      return;
    }

    try {
      await this.exameRepository.updateStatus(exame.uid, 'liberado', 'current-user-id');
      this.toastService.show('Exame liberado com sucesso', 'success');
    } catch (error) {
      console.error('Erro ao liberar exame:', error);
      this.toastService.show('Erro ao liberar exame', 'error');
    }
  }

  imprimirLaudo(exame: ExameRealizado) {
    // Buscar o schema antes de gerar o PDF
    this.schemaRepository.getById(exame.schemaId).subscribe({
      next: (schema) => {
        if (!schema) {
          this.toastService.show('Erro: schema do exame não encontrado', 'error');
          return;
        }

        try {
          this.pdfService.gerarLaudo(exame, schema);
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
}
