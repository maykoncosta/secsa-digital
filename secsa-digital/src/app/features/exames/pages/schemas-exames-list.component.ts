import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../../../shared/components/layout.component';
import { ButtonComponent } from '../../../shared/components/button.component';
import { PaginationComponent, PaginationConfig } from '../../../shared/components/pagination.component';
import { LucideAngularModule, Search, Plus, Edit, Power, PowerOff, Trash2 } from 'lucide-angular';
import { SchemaExameRepository } from '../../../data/repositories/schema-exame.repository';
import { SchemaExame } from '../../../data/interfaces/exame.interface';
import { ToastService } from '../../../core/services/toast.service';
import { SchemaExameFormModalComponent } from '../components/modals/schema-exame-form-modal.component';
import { SchemaExameEditModalComponent } from '../components/modals/schema-exame-edit-modal.component';

@Component({
  selector: 'app-schemas-exames-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LayoutComponent,
    ButtonComponent,
    PaginationComponent,
    LucideAngularModule,
    SchemaExameFormModalComponent,
    SchemaExameEditModalComponent
  ],
  template: `
    <app-layout>
      <div header>Schemas de Exames</div>
      
      <div class="space-y-6">
        <!-- Filtros e Ações -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between gap-4 flex-wrap">
            <div class="flex-1 max-w-md relative">
              <lucide-icon [img]="Search" class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nome do exame..."
                [(ngModel)]="searchTerm"
                (ngModelChange)="onSearch()"
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            
            <div class="flex items-center gap-3">
              <select
                [(ngModel)]="categoriaFilter"
                (ngModelChange)="onSearch()"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Todas as Categorias</option>
                <option value="Hematologia">Hematologia</option>
                <option value="Bioquímica">Bioquímica</option>
                <option value="Lipidograma">Lipidograma</option>
                <option value="Hormônios">Hormônios</option>
                <option value="Sorologias">Sorologias</option>
                <option value="Microbiologia">Microbiologia</option>
                <option value="Parasitologia">Parasitologia</option>
                <option value="Urinálise">Urinálise</option>
              </select>

              <select
                [(ngModel)]="statusFilter"
                (ngModelChange)="onSearch()"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Todos os Status</option>
                <option value="ativo">Ativos</option>
                <option value="inativo">Inativos</option>
              </select>
              
              <app-button
                variant="primary"
                (onClick)="openNewSchemaModal()"
              >
                <lucide-icon [img]="Plus" class="w-4 h-4 mr-2" />
                Novo Schema
              </app-button>
            </div>
          </div>
        </div>
        
        <!-- Lista de Schemas -->
        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
          @if (loading()) {
            <div class="p-12 text-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p class="mt-4 text-slate-600">Carregando schemas...</p>
            </div>
          } @else if (filteredSchemas().length === 0) {
            <div class="p-12 text-center">
              <p class="text-slate-600">Nenhum schema encontrado.</p>
              <p class="text-sm text-slate-500 mt-2">Clique em "Novo Schema" para adicionar.</p>
            </div>
          } @else {
            <div class="divide-y divide-slate-200">
              @for (schema of filteredSchemas(); track schema.id) {
                <div class="p-6 hover:bg-slate-50 transition-colors">
                  <div class="flex items-start justify-between gap-4">
                    <div class="flex-1">
                      <div class="flex items-center gap-3">
                        <h3 class="text-lg font-semibold text-slate-900">{{ schema.nome }}</h3>
                        @if (schema.ativo) {
                          <span class="px-2 py-1 text-xs font-semibold text-green-700 bg-green-50 rounded-full">
                            Ativo
                          </span>
                        } @else {
                          <span class="px-2 py-1 text-xs font-semibold text-red-700 bg-red-50 rounded-full">
                            Inativo
                          </span>
                        }
                      </div>
                      
                      <div class="flex items-center gap-4 mt-2 text-sm text-slate-600">
                        <span class="flex items-center gap-1">
                          <span class="font-medium">Categoria:</span>
                          <span class="px-2 py-0.5 bg-blue-50 text-blue-700 rounded">{{ schema.categoria }}</span>
                        </span>
                        <span>•</span>
                        <span>{{ schema.parametros.length }} parâmetro(s)</span>
                      </div>
                      
                      @if (schema.observacoes) {
                        <p class="mt-2 text-sm text-slate-500">{{ schema.observacoes }}</p>
                      }
                      
                      <!-- Lista de Parâmetros -->
                      <div class="mt-4">
                        <div class="flex flex-wrap gap-2">
                          @for (parametro of schema.parametros.slice(0, 5); track parametro.id) {
                            <span class="px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded">
                              {{ parametro.label }}
                              @if (parametro.isCalculado) {
                                <span class="text-slate-500">(calc)</span>
                              }
                            </span>
                          }
                          @if (schema.parametros.length > 5) {
                            <span class="px-2 py-1 text-xs text-slate-500">
                              +{{ schema.parametros.length - 5 }} mais
                            </span>
                          }
                        </div>
                      </div>
                    </div>
                    
                    <!-- Ações -->
                    <div class="flex items-center gap-2">
                      <button
                        (click)="editSchema(schema)"
                        class="p-2 text-slate-600 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <lucide-icon [img]="Edit" class="w-4 h-4" />
                      </button>
                      
                      @if (schema.ativo) {
                        <button
                          (click)="inactivateSchema(schema)"
                          class="p-2 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Inativar"
                        >
                          <lucide-icon [img]="PowerOff" class="w-4 h-4" />
                        </button>
                      } @else {
                        <button
                          (click)="activateSchema(schema)"
                          class="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Ativar"
                        >
                          <lucide-icon [img]="Power" class="w-4 h-4" />
                        </button>
                      }
                      
                      <button
                        (click)="deleteSchema(schema)"
                        class="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir"
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
        
        <!-- Pagination -->
        @if (!loading() && filteredSchemas().length > 0) {
          <div class="mt-6">
            <app-pagination
              [config]="paginationConfig()"
              (pageChange)="onPageChange($event)"
              (pageSizeChange)="onPageSizeChange($event)"
            />
          </div>
        }
      </div>
    </app-layout>

    <!-- Modal de Formulário -->
    @if (showModal()) {
      <app-schema-exame-form-modal
        [schema]="selectedSchema()"
        (close)="closeModal()"
        (saved)="onSchemaSaved()"
      />
    }
    
    <!-- Modal de Edição -->
    <app-schema-exame-edit-modal
      [isOpen]="showEditModal()"
      [schema]="schemaToEdit()"
      (onClose)="closeEditModal()"
      (onSave)="onSchemaEdited()"
    />
  `
})
export class SchemasExamesListComponent implements OnInit {
  // Icons
  Search = Search;
  Plus = Plus;
  Edit = Edit;
  Power = Power;
  PowerOff = PowerOff;
  Trash2 = Trash2;

  showModal = signal(false);
  selectedSchema = signal<SchemaExame | null>(null);
  showEditModal = signal(false);
  schemaToEdit = signal<SchemaExame | null>(null);
  
  // Services
  private schemaRepository = inject(SchemaExameRepository);
  private toastService = inject(ToastService);

  // State
  schemas = signal<SchemaExame[]>([]);
  filteredSchemas = signal<SchemaExame[]>([]);
  loading = signal(true);
  
  // Filters
  searchTerm = '';
  categoriaFilter = '';
  statusFilter = '';
  
  // Pagination
  currentPage = signal(1);
  pageSize = signal(10);
  totalItems = signal(0);
  
  paginationConfig = computed<PaginationConfig>(() => ({
    currentPage: this.currentPage(),
    pageSize: this.pageSize(),
    totalItems: this.totalItems()
  }));

  ngOnInit() {
    this.loadSchemas();
  }

  async loadSchemas() {
    this.loading.set(true);
    try {
      const result = await this.schemaRepository.getPaginated(
        this.currentPage(),
        this.pageSize(),
        this.searchTerm,
        this.categoriaFilter || undefined
      );
      
      // Aplicar filtro de status após paginação
      let filtered = result.items;
      if (this.statusFilter === 'ativo') {
        filtered = filtered.filter(schema => schema.ativo === true);
      } else if (this.statusFilter === 'inativo') {
        filtered = filtered.filter(schema => schema.ativo === false);
      }
      
      this.filteredSchemas.set(filtered);
      this.totalItems.set(result.total);
      this.loading.set(false);
    } catch (error) {
      console.error('Erro ao carregar schemas:', error);
      this.toastService.showError('Erro ao carregar schemas de exames');
      this.loading.set(false);
    }
  }

  onSearch() {
    // Reset para primeira página ao fazer busca
    this.currentPage.set(1);
    this.loadSchemas();
  }
  
  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadSchemas();
  }
  
  onPageSizeChange(pageSize: number) {
    this.pageSize.set(pageSize);
    this.currentPage.set(1); // Volta pra primeira página ao mudar tamanho
    this.loadSchemas();
  }

  openNewSchemaModal() {
    this.selectedSchema.set(null);
    this.showModal.set(true);
  }

  editSchema(schema: SchemaExame) {
    this.schemaToEdit.set(schema);
    this.showEditModal.set(true);
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.schemaToEdit.set(null);
  }

  onSchemaEdited() {
    this.loadSchemas();
  }

  closeModal() {
    this.showModal.set(false);
    this.selectedSchema.set(null);
  }

  onSchemaSaved() {
    this.loadSchemas();
  }

  async inactivateSchema(schema: SchemaExame) {
    if (!confirm(`Deseja realmente inativar o schema "${schema.nome}"?`)) {
      return;
    }

    try {
      await this.schemaRepository.inactivate(schema.id);
      this.toastService.showSuccess('Schema inativado com sucesso');
      this.loadSchemas();
    } catch (error) {
      console.error('Erro ao inativar schema:', error);
      this.toastService.showError('Erro ao inativar schema');
    }
  }

  async activateSchema(schema: SchemaExame) {
    try {
      await this.schemaRepository.activate(schema.id);
      this.toastService.showSuccess('Schema ativado com sucesso');
      this.loadSchemas();
    } catch (error) {
      console.error('Erro ao ativar schema:', error);
      this.toastService.showError('Erro ao ativar schema');
    }
  }

  async deleteSchema(schema: SchemaExame) {
    if (!confirm(`Deseja realmente EXCLUIR permanentemente o schema "${schema.nome}"?\n\nEsta ação não pode ser desfeita!`)) {
      return;
    }

    try {
      await this.schemaRepository.delete(schema.id);
      this.toastService.showSuccess('Schema excluído com sucesso');
      this.loadSchemas();
    } catch (error) {
      console.error('Erro ao excluir schema:', error);
      this.toastService.showError('Erro ao excluir schema. Pode haver exames vinculados a ele.');
    }
  }
}
