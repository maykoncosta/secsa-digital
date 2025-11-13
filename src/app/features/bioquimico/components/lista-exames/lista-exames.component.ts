import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable, combineLatest } from 'rxjs';
import { ExameService } from '../../services/exame.service';
import { PacienteService } from '../../services/paciente.service';
import { Exame, StatusExame } from '../../../../core/models';
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
  private exameService = inject(ExameService);
  private pacienteService = inject(PacienteService);

  exames: Exame[] = [];
  examesFiltrados: Exame[] = [];
  isLoading = false;
  errorMessage = '';

  // Filtros
  searchTerm = '';
  filtroStatus: StatusExame | 'todos' = 'todos';
  filtroTipo: 'hemograma' | 'urina' | 'fezes' | 'todos' = 'todos';
  
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

    this.exameService.listarExames().subscribe({
      next: (exames) => {
        this.exames = exames;
        this.aplicarFiltros();
        this.isLoading = false;
      },
      error: (error) => {
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

    // Filtro por tipo
    if (this.filtroTipo !== 'todos') {
      resultado = resultado.filter(e => e.tipoExame === this.filtroTipo);
    }

    // Filtro por busca
    if (this.searchTerm.trim()) {
      const termo = this.searchTerm.toLowerCase();
      resultado = resultado.filter(e => 
        e.codigo.toLowerCase().includes(termo) ||
        e.pacienteNome.toLowerCase().includes(termo) ||
        e.pacienteCpf.replace(/\D/g, '').includes(termo.replace(/\D/g, ''))
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

  get examesPaginados(): Exame[] {
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

  visualizarExame(exame: Exame): void {
    this.router.navigate(['/bioquimico/exames/detalhes', exame.id]);
  }

  editarExame(exame: Exame): void {
    if (exame.status === 'pendente') {
      this.router.navigate(['/bioquimico/exames/editar', exame.id]);
    }
  }

  liberarExame(exame: Exame): void {
    if (exame.status !== 'pendente') return;
    
    this.router.navigate(['/bioquimico/exames/liberar', exame.id]);
  }

  cancelarExame(exame: Exame): void {
    if (exame.status === 'cancelado') return;

    const motivo = prompt(`Tem certeza que deseja cancelar o exame ${exame.codigo}?\n\nDigite o motivo do cancelamento:`);
    
    if (!motivo) return;

    this.isLoading = true;

    // Usuário temporário - depois vem da autenticação
    const usuarioId = 'bioquimico-temp-id';

    this.exameService.cancelarExame(exame.id!, usuarioId, motivo).subscribe({
      next: () => {
        this.carregarExames();
      },
      error: (error) => {
        console.error('Erro ao cancelar exame:', error);
        this.errorMessage = 'Erro ao cancelar exame. Por favor, tente novamente.';
        this.isLoading = false;
      }
    });
  }

  limparFiltros(): void {
    this.searchTerm = '';
    this.filtroStatus = 'todos';
    this.filtroTipo = 'todos';
    this.paginaAtual = 1;
    this.aplicarFiltros();
  }

  getStatusClass(status: StatusExame): string {
    return `badge-${status}`;
  }

  getTipoExameLabel(tipo: string): string {
    const labels: { [key: string]: string } = {
      'hemograma': 'Hemograma',
      'urina': 'Urina (EAS)',
      'fezes': 'Fezes'
    };
    return labels[tipo] || tipo;
  }

  contarValoresAlterados(exame: Exame): number {
    return exame.parametros.filter(p => p.alterado).length;
  }

  formatarData(data: Date | string): string {
    return this.exameService.formatarData(data);
  }

  diasDesdeColeta(data: Date | string): number {
    return this.exameService.diasDesdeColeta(data);
  }
}
