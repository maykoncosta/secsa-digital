import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { LayoutComponent } from '../../shared/components/layout.component';
import { ExameRealizadoRepository } from '../../data/repositories/exame-realizado.repository';
import { SchemaExameRepository } from '../../data/repositories/schema-exame.repository';
import { ExameRealizado } from '../../data/interfaces/exame.interface';
import { LucideAngularModule, FileText, Download, Calendar, FlaskConical } from 'lucide-angular';
import { DatePipe } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { PdfLaudoService } from '../../core/services/pdf-laudo.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-meus-exames',
  standalone: true,
  imports: [CommonModule, LayoutComponent, LucideAngularModule, DatePipe],
  template: `
    <app-layout>
      <span header>Meus Exames</span>
      
      <div class="space-y-6">
        <!-- Boas-vindas -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">
            Olá, {{ currentUser()?.displayName }}!
          </h2>
          <p class="text-gray-600">
            Aqui você pode visualizar e baixar seus exames liberados.
          </p>
        </div>

        <!-- Loading -->
        @if (loading()) {
          <div class="bg-white rounded-lg shadow-sm p-12">
            <div class="flex flex-col items-center justify-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p class="text-gray-500">Carregando seus exames...</p>
            </div>
          </div>
        }

        <!-- Lista de exames -->
        @if (!loading() && exames().length > 0) {
          <div class="bg-white rounded-lg shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <lucide-icon [img]="FlaskConical" class="w-5 h-5" />
                Exames Liberados ({{ exames().length }})
              </h3>
            </div>
            
            <div class="divide-y divide-gray-200">
              @for (exame of exames(); track exame.uid) {
                <div class="p-6 hover:bg-gray-50 transition-colors">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <div class="flex items-center gap-3 mb-2">
                        <lucide-icon [img]="FileText" class="w-5 h-5 text-primary" />
                        <h4 class="text-lg font-semibold text-gray-900">
                          {{ exame.schemaNome }}
                        </h4>
                      </div>
                      
                      <div class="space-y-1 text-sm text-gray-600 ml-8">
                        <div class="flex items-center gap-2">
                          <lucide-icon [img]="Calendar" class="w-4 h-4" />
                          <span>Data de coleta: {{ exame.dataColeta.toDate() | date:'dd/MM/yyyy' }}</span>
                        </div>
                        
                        @if (exame.dataLiberacao) {
                          <div class="flex items-center gap-2">
                            <lucide-icon [img]="Calendar" class="w-4 h-4" />
                            <span>Liberado em: {{ exame.dataLiberacao.toDate() | date:'dd/MM/yyyy HH:mm' }}</span>
                          </div>
                        }
                        
                        @if (exame.observacoesTecnicas) {
                          <div class="mt-2 p-3 bg-blue-50 rounded-lg">
                            <p class="text-sm text-blue-900">
                              <strong>Observações:</strong> {{ exame.observacoesTecnicas }}
                            </p>
                          </div>
                        }
                      </div>
                    </div>
                    
                    <button
                      (click)="baixarLaudo(exame)"
                      class="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      <lucide-icon [img]="Download" class="w-4 h-4" />
                      Baixar Laudo
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- Empty state -->
        @if (!loading() && exames().length === 0) {
          <div class="bg-white rounded-lg shadow-sm p-12">
            <div class="text-center">
              <div class="text-6xl mb-4">🧪</div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">
                Nenhum exame liberado
              </h3>
              <p class="text-gray-500">
                Seus exames aparecerão aqui assim que forem liberados pelo laboratório.
              </p>
            </div>
          </div>
        }
      </div>
    </app-layout>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class MeusExamesComponent implements OnInit {
  private authService = inject(AuthService);
  private exameRepository = inject(ExameRealizadoRepository);
  private schemaRepository = inject(SchemaExameRepository);
  private pdfService = inject(PdfLaudoService);
  private toastService = inject(ToastService);
  
  // Icons
  FileText = FileText;
  Download = Download;
  Calendar = Calendar;
  FlaskConical = FlaskConical;
  
  currentUser = this.authService.currentUser;
  exames = signal<ExameRealizado[]>([]);
  loading = signal(true);

  async ngOnInit(): Promise<void> {
    await this.carregarExames();
  }

  async carregarExames(): Promise<void> {
    try {
      this.loading.set(true);
      const user = this.currentUser();
      
      if (!user?.pacienteId) {
        console.error('Usuário não possui pacienteId vinculado');
        return;
      }

      // Buscar apenas exames liberados do paciente
      const todosExames$ = this.exameRepository.getAll();
      const todosExames = await firstValueFrom(todosExames$);
      
      const examesLiberados = todosExames.filter((exame: ExameRealizado) => 
        exame.pacienteId === user.pacienteId && 
        exame.status === 'liberado'
      );

      // Ordenar por data de liberação (mais recente primeiro)
      examesLiberados.sort((a: ExameRealizado, b: ExameRealizado) => {
        const dataA = a.dataLiberacao?.toMillis() || 0;
        const dataB = b.dataLiberacao?.toMillis() || 0;
        return dataB - dataA;
      });

      this.exames.set(examesLiberados);
      
    } catch (error) {
      console.error('Erro ao carregar exames:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async baixarLaudo(exame: ExameRealizado): Promise<void> {
    try {
      // Buscar o schema antes de gerar o PDF
      const schema$ = this.schemaRepository.getById(exame.schemaId);
      const schema = await firstValueFrom(schema$);
      
      if (!schema) {
        this.toastService.error('Erro: dados do exame não encontrados');
        return;
      }

      await this.pdfService.gerarLaudo(exame, schema);
      this.toastService.success('Laudo baixado com sucesso!');
      
    } catch (error) {
      console.error('Erro ao baixar laudo:', error);
      this.toastService.error('Erro ao baixar laudo. Tente novamente.');
    }
  }
}
