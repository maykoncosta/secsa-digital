import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ExameRealizadoService } from '../../../bioquimico/services/exame-realizado.service';
import { ExameRealizado } from '../../../../core/models';

@Component({
  selector: 'app-meus-exames',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './meus-exames.component.html',
  styleUrl: './meus-exames.component.scss'
})
export class MeusExamesComponent implements OnInit {
  private router = inject(Router);
  private exameRealizadoService = inject(ExameRealizadoService);

  exames: ExameRealizado[] = [];
  examesFiltrados: ExameRealizado[] = [];
  isLoading = false;
  errorMessage = '';

  // Filtros
  filtroStatus: 'todos' | 'liberado' | 'pendente' = 'todos';

  // TODO: Pegar do Auth depois
  pacienteId = 'PACIENTE_ID_TEMPORARIO';

  ngOnInit(): void {
    this.carregarExames();
  }

  carregarExames(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Por enquanto, lista todos (depois filtrar por pacienteId do Auth)
    this.exameRealizadoService.listarTodos().subscribe({
      next: (exames: ExameRealizado[]) => {
        // TODO: Filtrar apenas exames liberados do paciente logado
        // this.exames = exames.filter(e => e.pacienteId === this.pacienteId && e.status === 'liberado');
        
        // TEMPORÁRIO: Mostra todos os exames para teste
        this.exames = exames;
        console.log('Exames carregados:', exames);
        this.aplicarFiltros();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Erro ao carregar exames:', error);
        this.errorMessage = 'Erro ao carregar seus exames. Por favor, tente novamente.';
        this.isLoading = false;
      }
    });
  }

  aplicarFiltros(): void {
    let resultado = [...this.exames];

    if (this.filtroStatus !== 'todos') {
      resultado = resultado.filter(e => e.status === this.filtroStatus);
    }

    this.examesFiltrados = resultado;
  }

  visualizarExame(exame: ExameRealizado): void {
    this.router.navigate(['/paciente/exames', exame.uid]);
  }

  formatarData(data: any): string {
    if (!data) return '-';
    
    if (data.toDate && typeof data.toDate === 'function') {
      return data.toDate().toLocaleDateString('pt-BR');
    }
    
    const d = typeof data === 'string' ? new Date(data) : data;
    return d.toLocaleDateString('pt-BR');
  }

  getStatusClass(status: string): string {
    return `badge-${status}`;
  }

  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'liberado': '✓',
      'pendente': '⏱️',
      'cancelado': '✕'
    };
    return icons[status] || '•';
  }
}
