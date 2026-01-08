import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from '../../shared/components/layout.component';
import { LucideAngularModule, Activity, Clock, CheckCircle, AlertCircle, Users, TrendingUp } from 'lucide-angular';
import { EstatisticasRepository } from '../../data/repositories/estatisticas.repository';
import { EstatisticasGeral, TopExame } from '../../data/interfaces/estatisticas.interface';
import { Subscription } from 'rxjs';

interface DashboardStats {
  totalExames: number;
  examesPendentes: number;
  examesFinalizados: number;
  examesLiberados: number;
  totalPacientes: number;
  examesHoje: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LayoutComponent, LucideAngularModule],
  template: `
    <app-layout>
      <div header>Dashboard</div>
      
      <div class="space-y-6">
        @if (loading()) {
          <div class="flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        } @else {
          <!-- Cards de Estatísticas -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Total de Exames -->
            <div class="bg-white rounded-lg shadow-sm p-6 border-l-4 border-primary">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-slate-600">Total de Exames</p>
                  <p class="text-3xl font-bold text-slate-900 mt-2">{{ stats().totalExames }}</p>
                </div>
                <div class="p-3 bg-primary/10 rounded-lg">
                  <lucide-icon [img]="Activity" class="w-8 h-8 text-primary" />
                </div>
              </div>
            </div>

            <!-- Exames Pendentes -->
            <div class="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-slate-600">Pendentes</p>
                  <p class="text-3xl font-bold text-slate-900 mt-2">{{ stats().examesPendentes }}</p>
                </div>
                <div class="p-3 bg-yellow-500/10 rounded-lg">
                  <lucide-icon [img]="Clock" class="w-8 h-8 text-yellow-600" />
                </div>
              </div>
            </div>

            <!-- Exames Finalizados -->
            <div class="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-slate-600">Finalizados</p>
                  <p class="text-3xl font-bold text-slate-900 mt-2">{{ stats().examesFinalizados }}</p>
                </div>
                <div class="p-3 bg-blue-500/10 rounded-lg">
                  <lucide-icon [img]="AlertCircle" class="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            <!-- Exames Liberados -->
            <div class="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-slate-600">Liberados</p>
                  <p class="text-3xl font-bold text-slate-900 mt-2">{{ stats().examesLiberados }}</p>
                </div>
                <div class="p-3 bg-green-500/10 rounded-lg">
                  <lucide-icon [img]="CheckCircle" class="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            <!-- Total de Pacientes -->
            <div class="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-slate-600">Total de Pacientes</p>
                  <p class="text-3xl font-bold text-slate-900 mt-2">{{ stats().totalPacientes }}</p>
                </div>
                <div class="p-3 bg-purple-500/10 rounded-lg">
                  <lucide-icon [img]="Users" class="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>

            <!-- Exames Hoje -->
            <div class="bg-white rounded-lg shadow-sm p-6 border-l-4 border-orange-500">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-slate-600">Exames Hoje</p>
                  <p class="text-3xl font-bold text-slate-900 mt-2">{{ stats().examesHoje }}</p>
                </div>
                <div class="p-3 bg-orange-500/10 rounded-lg">
                  <lucide-icon [img]="TrendingUp" class="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          <!-- Top Exames Mais Solicitados -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-slate-200">
              <h2 class="text-lg font-semibold text-slate-900">Top 10 Exames Mais Solicitados</h2>
              <p class="text-sm text-slate-600 mt-1">Exames mais realizados no sistema</p>
            </div>
            
            <div class="p-6">
              @if (topExames().length === 0) {
                <div class="text-center py-12 text-slate-500">
                  <p>Nenhum exame registrado ainda</p>
                </div>
              } @else {
                <div class="space-y-4">
                  @for (exame of topExames(); track exame.nome; let index = $index) {
                    <div class="flex items-center gap-4">
                      <!-- Posição -->
                      <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                           [class.bg-yellow-500]="index === 0"
                           [class.text-white]="index === 0"
                           [class.bg-gray-300]="index === 1"
                           [class.text-slate-700]="index === 1"
                           [class.bg-orange-400]="index === 2"
                           [class.text-white]="index === 2"
                           [class.bg-slate-100]="index > 2"
                           [class.text-slate-600]="index > 2">
                        {{ index + 1 }}
                      </div>
                      
                      <!-- Nome do Exame -->
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-slate-900 truncate">{{ exame.nome }}</p>
                      </div>
                      
                      <!-- Barra de Progresso -->
                      <div class="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div 
                          class="h-full bg-primary transition-all duration-300"
                          [style.width.%]="(exame.quantidade / topExames()[0].quantidade) * 100">
                        </div>
                      </div>
                      
                      <!-- Quantidade -->
                      <div class="flex-shrink-0 w-16 text-right">
                        <span class="text-sm font-semibold text-slate-900">{{ exame.quantidade }}</span>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        }
      </div>
    </app-layout>
  `
})
export class DashboardComponent implements OnInit, OnDestroy {
  private estatisticasRepository = inject(EstatisticasRepository);

  // Icons
  Activity = Activity;
  Clock = Clock;
  CheckCircle = CheckCircle;
  AlertCircle = AlertCircle;
  Users = Users;
  TrendingUp = TrendingUp;

  // State
  loading = signal(true);
  stats = signal<DashboardStats>({
    totalExames: 0,
    examesPendentes: 0,
    examesFinalizados: 0,
    examesLiberados: 0,
    totalPacientes: 0,
    examesHoje: 0
  });
  topExames = signal<TopExame[]>([]);

  // Subscriptions
  private subscriptions = new Subscription();

  ngOnInit() {
    this.loadDashboardData();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  loadDashboardData() {
    this.loading.set(true);

    // Subscribe para estatísticas gerais (em tempo real)
    const statsSub = this.estatisticasRepository.getEstatisticasGeral().subscribe({
      next: (data: EstatisticasGeral | undefined) => {
        if (data) {
          this.stats.set({
            totalExames: data.totalExames || 0,
            examesPendentes: data.exames_pendente || 0,
            examesFinalizados: data.exames_finalizado || 0,
            examesLiberados: data.exames_liberado || 0,
            totalPacientes: data.totalPacientes || 0,
            examesHoje: data.examesHoje || 0
          });
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar estatísticas:', error);
        this.loading.set(false);
      }
    });

    // Subscribe para top exames (em tempo real)
    const topExamesSub = this.estatisticasRepository.getTopExames().subscribe({
      next: (data: TopExame[]) => {
        this.topExames.set(data);
      },
      error: (error) => {
        console.error('Erro ao carregar top exames:', error);
      }
    });

    this.subscriptions.add(statsSub);
    this.subscriptions.add(topExamesSub);
  }
}
