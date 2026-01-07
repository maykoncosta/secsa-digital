import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../../../shared/components/layout.component';
import { ButtonComponent } from '../../../shared/components/button.component';
import { PaginationComponent, PaginationConfig } from '../../../shared/components/pagination.component';
import { TableSkeletonComponent } from '../../../shared/components/table-skeleton.component';
import { LucideAngularModule, Search, UserPlus, Edit, Trash2, Power } from 'lucide-angular';
import { PacienteRepository } from '../../../data/repositories/paciente.repository';
import { Paciente } from '../../../data/interfaces/paciente.interface';
import { CpfPipe } from '../../../shared/pipes/cpf.pipe';
import { CnsPipe } from '../../../shared/pipes/cns.pipe';
import { TelefonePipe } from '../../../shared/pipes/telefone.pipe';
import { ToastService } from '../../../core/services/toast.service';
import { PacienteFormModalComponent } from '../components/modals/paciente-form-modal.component';

@Component({
  selector: 'app-pacientes-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LayoutComponent,
    ButtonComponent,
    PaginationComponent,
    TableSkeletonComponent,
    LucideAngularModule,
    CpfPipe,
    CnsPipe,
    TelefonePipe,
    PacienteFormModalComponent
  ],
  template: `
    <app-layout>
      <div header>Pacientes</div>
      
      <div class="space-y-6">
        <!-- Filtros e Ações -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between gap-4">
            <div class="flex-1 max-w-md relative">
              <lucide-icon [img]="Search" class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nome, CPF ou CNS..."
                [(ngModel)]="searchTerm"
                (ngModelChange)="onSearch()"
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            
            <app-button
              variant="primary"
              (onClick)="openNewPacienteModal()"
            >
              <lucide-icon [img]="UserPlus" class="w-4 h-4 mr-2" />
              Novo Paciente
            </app-button>
          </div>
        </div>
        
        <!-- Tabela de Pacientes -->
        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
          @if (loading()) {
            <div class="p-6">
              <app-table-skeleton [rows]="pageSize()" [columns]="7" />
            </div>
          } @else if (pacientes().length === 0) {
            <div class="p-12 text-center">
              <p class="text-slate-600">Nenhum paciente encontrado.</p>
              <p class="text-sm text-slate-500 mt-2">Clique em "Novo Paciente" para adicionar.</p>
            </div>
          } @else {
            <table class="w-full">
              <thead class="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Prontuário</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Nome</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">CPF</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">CNS</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Telefone</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                @for (paciente of pacientes(); track paciente.id) {
                  <tr class="hover:bg-slate-50 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {{ paciente.numeroProntuario }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {{ paciente.nomeCompleto }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {{ paciente.cpf | cpf }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {{ paciente.cns | cns }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {{ paciente.telefone | telefone }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span [class]="getStatusClass(paciente.status)">
                        {{ paciente.status === 'ativo' ? 'Ativo' : 'Inativo' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div class="flex items-center justify-end gap-2">
                        <button
                          (click)="editPaciente(paciente)"
                          class="text-primary hover:text-blue-700 transition-colors"
                          title="Editar"
                        >
                          <lucide-icon [img]="Edit" class="w-4 h-4" />
                        </button>
                        
                        <button
                          (click)="toggleStatus(paciente)"
                          [class]="paciente.status === 'ativo' ? 'text-warning hover:text-yellow-700' : 'text-success hover:text-green-700'"
                          class="transition-colors"
                          [title]="paciente.status === 'ativo' ? 'Inativar' : 'Ativar'"
                        >
                          <lucide-icon [img]="Power" class="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>

            <!-- Paginação -->
            <app-pagination
              [config]="paginationConfig()"
              (pageChange)="onPageChange($event)"
              (pageSizeChange)="onPageSizeChange($event)"
            />
          }
        </div>
      </div>
    </app-layout>
    
    <!-- Modal de Cadastro/Edição -->
    @if (showModal()) {
      <app-paciente-form-modal
        [paciente]="selectedPaciente()"
        (close)="closeModal()"
        (save)="onSavePaciente($event)"
      />
    }
  `,
  styles: []
})
export class PacientesListComponent implements OnInit {
  private pacienteRepo = inject(PacienteRepository);
  private toastService = inject(ToastService);
  
  Search = Search;
  UserPlus = UserPlus;
  Edit = Edit;
  Trash2 = Trash2;
  Power = Power;
  
  pacientes = signal<Paciente[]>([]);
  loading = signal(true);
  searchTerm = '';
  
  // Paginação
  currentPage = signal(1);
  pageSize = signal(10);
  totalItems = signal(0);
  
  paginationConfig = signal<PaginationConfig>({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0
  });
  
  showModal = signal(false);
  selectedPaciente = signal<Paciente | null>(null);

  ngOnInit(): void {
    this.loadPacientes();
  }

  async loadPacientes(): Promise<void> {
    this.loading.set(true);
    try {
      const result = await this.pacienteRepo.getPaginated(
        this.currentPage(),
        this.pageSize(),
        this.searchTerm
      );
      
      this.pacientes.set(result.items);
      this.totalItems.set(result.total);
      this.paginationConfig.set({
        currentPage: result.page,
        pageSize: result.pageSize,
        totalItems: result.total
      });
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
      this.toastService.error('Erro ao carregar pacientes');
    } finally {
      this.loading.set(false);
    }
  }

  onSearch(): void {
    this.currentPage.set(1); // Reset para primeira página ao buscar
    this.loadPacientes();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadPacientes();
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize.set(pageSize);
    this.currentPage.set(1); // Reset para primeira página ao mudar tamanho
    this.loadPacientes();
  }

  openNewPacienteModal(): void {
    this.selectedPaciente.set(null);
    this.showModal.set(true);
  }

  editPaciente(paciente: Paciente): void {
    this.selectedPaciente.set(paciente);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.selectedPaciente.set(null);
  }

  onSavePaciente(paciente: any): void {
    // A lógica de salvamento será implementada no modal
    this.closeModal();
    this.loadPacientes();
  }

  async toggleStatus(paciente: Paciente): Promise<void> {
    try {
      if (paciente.status === 'ativo') {
        await this.pacienteRepo.inactivate(paciente.id);
        this.toastService.success('Paciente inativado com sucesso');
      } else {
        await this.pacienteRepo.activate(paciente.id);
        this.toastService.success('Paciente ativado com sucesso');
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      this.toastService.error('Erro ao alterar status do paciente');
    }
  }

  getStatusClass(status: string): string {
    return status === 'ativo'
      ? 'px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700'
      : 'px-2 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700';
  }
}
