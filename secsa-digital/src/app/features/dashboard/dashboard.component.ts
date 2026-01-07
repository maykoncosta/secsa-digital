import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from '../../shared/components/layout.component';
import { LucideAngularModule, Activity, Clock, CheckCircle, AlertCircle, Users, TrendingUp } from 'lucide-angular';
import { ExameRealizadoRepository } from '../../data/repositories/exame-realizado.repository';
import { PacienteRepository } from '../../data/repositories/paciente.repository';

interface DashboardStats {
  totalExames: number;
  examesPendentes: number;
  examesFinalizados: number;
  examesLiberados: number;
  totalPacientes: number;
  examesHoje: number;
}

interface TopExame {
  nome: string;
  quantidade: number;
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
export class DashboardComponent implements OnInit {
  private exameRepository = inject(ExameRealizadoRepository);
  private pacienteRepository = inject(PacienteRepository);

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

  ngOnInit() {
    this.loadDashboardData();
  }

  async loadDashboardData() {
    this.loading.set(true);

    try {
      // Buscar todos os exames
      const exames = await this.exameRepository.getAllExames();
      
      // Buscar todos os pacientes
      const pacientes = await this.pacienteRepository.getAllPacientes();

      // Calcular data de hoje (início do dia)
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      // Calcular estatísticas
      const totalExames = exames.length;
      const examesPendentes = exames.filter(e => e.status === 'pendente').length;
      const examesFinalizados = exames.filter(e => e.status === 'finalizado').length;
      const examesLiberados = exames.filter(e => e.status === 'liberado').length;
      const totalPacientes = pacientes.length;
      
      // Exames de hoje
      const examesHoje = exames.filter(e => {
        const dataColeta = e.dataColeta.toDate();
        dataColeta.setHours(0, 0, 0, 0);
        return dataColeta.getTime() === hoje.getTime();
      }).length;

      this.stats.set({
        totalExames,
        examesPendentes,
        examesFinalizados,
        examesLiberados,
        totalPacientes,
        examesHoje
      });

      // Calcular top exames
      const exameCount = new Map<string, number>();
      exames.forEach(exame => {
        const count = exameCount.get(exame.schemaNome) || 0;
        exameCount.set(exame.schemaNome, count + 1);
      });

      // Converter para array e ordenar
      const topExamesArray: TopExame[] = Array.from(exameCount.entries())
        .map(([nome, quantidade]) => ({ nome, quantidade }))
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 10);

      this.topExames.set(topExamesArray);

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      this.loading.set(false);
    }
  }
}
