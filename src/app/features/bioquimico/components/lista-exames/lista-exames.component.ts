import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ExameRealizadoService } from '../../services/exame-realizado.service';
import { ExameRealizado } from '../../../../core/models';
import { CpfPipe } from '../../../../shared/pipes/cpf.pipe';

@Component({
  selector: 'app-lista-exames',
  standalone: true,
  imports: [CommonModule, FormsModule, CpfPipe],
  templateUrl: './lista-exames.component.html',
  styleUrl: './lista-exames.component.scss'
})
export class ListaExamesComponent implements OnInit {
  private router = inject(Router);
  private exameRealizadoService = inject(ExameRealizadoService);

  exames: ExameRealizado[] = [];
  examesFiltrados: ExameRealizado[] = [];
  isLoading = false;
  errorMessage = '';

  // Filtros
  searchTerm = '';
  filtroStatus: 'pendente' | 'finalizado' | 'liberado' | 'cancelado' | 'todos' = 'todos';
  
  // Paginação
  paginaAtual = 1;
  itensPorPagina = 10;
  totalPaginas = 0;

  ngOnInit(): void {
    this.carregarExames();
  }

  carregarExames(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.exameRealizadoService.listarTodos().subscribe({
      next: (exames: ExameRealizado[]) => {
        this.exames = exames;
        this.aplicarFiltros();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Erro ao carregar exames:', error);
        this.errorMessage = 'Erro ao carregar exames. Por favor, tente novamente.';
        this.isLoading = false;
      }
    });
  }

  aplicarFiltros(): void {
    let resultado = [...this.exames];

    // Filtro por status
    if (this.filtroStatus !== 'todos') {
      resultado = resultado.filter(e => e.status === this.filtroStatus);
    }

    // Filtro por busca
    if (this.searchTerm.trim()) {
      const termo = this.searchTerm.toLowerCase();
      resultado = resultado.filter(e => 
        e.codigo.toLowerCase().includes(termo) ||
        e.pacienteNome.toLowerCase().includes(termo) ||
        (e.pacienteCpf && e.pacienteCpf.replace(/\D/g, '').includes(termo.replace(/\D/g, ''))) ||
        e.exameNome.toLowerCase().includes(termo)
      );
    }

    this.examesFiltrados = resultado;
    this.calcularPaginacao();
  }

  calcularPaginacao(): void {
    this.totalPaginas = Math.ceil(this.examesFiltrados.length / this.itensPorPagina);
    
    if (this.paginaAtual > this.totalPaginas && this.totalPaginas > 0) {
      this.paginaAtual = this.totalPaginas;
    }
  }

  get examesPaginados(): ExameRealizado[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    return this.examesFiltrados.slice(inicio, fim);
  }

  get paginasVisiveis(): number[] {
    const paginas: number[] = [];
    const maxPaginas = 5;
    let inicio = Math.max(1, this.paginaAtual - Math.floor(maxPaginas / 2));
    let fim = Math.min(this.totalPaginas, inicio + maxPaginas - 1);

    if (fim - inicio < maxPaginas - 1) {
      inicio = Math.max(1, fim - maxPaginas + 1);
    }

    for (let i = inicio; i <= fim; i++) {
      paginas.push(i);
    }

    return paginas;
  }

  irParaPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaAtual = pagina;
    }
  }

  novoExame(): void {
    this.router.navigate(['/bioquimico/exames/novo']);
  }

  visualizarExame(exame: ExameRealizado): void {
    this.router.navigate(['/bioquimico/exames/detalhes', exame.uid]);
  }

  editarExame(exame: ExameRealizado): void {
    if (exame.status === 'pendente') {
      this.router.navigate(['/bioquimico/exames/editar', exame.uid]);
    }
  }

  liberarExame(exame: ExameRealizado): void {
    if (exame.status !== 'pendente' && exame.status !== 'finalizado') return;
    
    if (confirm(`Tem certeza que deseja liberar o exame ${exame.codigo}?`)) {
      this.isLoading = true;
      
      this.exameRealizadoService.atualizarStatus(exame.uid, 'liberado').then(() => {
        this.carregarExames();
      }).catch((error: any) => {
        console.error('Erro ao liberar exame:', error);
        this.errorMessage = 'Erro ao liberar exame. Por favor, tente novamente.';
        this.isLoading = false;
      });
    }
  }

  cancelarExame(exame: ExameRealizado): void {
    if (exame.status === 'cancelado') return;

    const motivo = prompt(`Tem certeza que deseja cancelar o exame ${exame.codigo}?\n\nDigite o motivo do cancelamento:`);
    
    if (!motivo) return;

    this.isLoading = true;

    this.exameRealizadoService.atualizarStatus(exame.uid, 'cancelado').then(() => {
      this.carregarExames();
    }).catch((error: any) => {
      console.error('Erro ao cancelar exame:', error);
      this.errorMessage = 'Erro ao cancelar exame. Por favor, tente novamente.';
      this.isLoading = false;
    });
  }

  limparFiltros(): void {
    this.searchTerm = '';
    this.filtroStatus = 'todos';
    this.paginaAtual = 1;
    this.aplicarFiltros();
  }

  getStatusClass(status: string): string {
    return `badge-${status}`;
  }

  formatarData(data: any): string {
    if (!data) return '-';
    
    // Se for um Timestamp do Firestore
    if (data.toDate && typeof data.toDate === 'function') {
      return data.toDate().toLocaleDateString('pt-BR');
    }
    
    // Se for uma string ou Date
    const d = typeof data === 'string' ? new Date(data) : data;
    return d.toLocaleDateString('pt-BR');
  }

  diasDesdeColeta(data: any): number {
    if (!data) return 0;
    
    let d: Date;
    
    // Se for um Timestamp do Firestore
    if (data.toDate && typeof data.toDate === 'function') {
      d = data.toDate();
    } else {
      // Se for uma string ou Date
      d = typeof data === 'string' ? new Date(data) : data;
    }
    
    const hoje = new Date();
    const diffTime = Math.abs(hoje.getTime() - d.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
