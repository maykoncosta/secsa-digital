import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable, Subject, debounceTime, distinctUntilChanged, switchMap, startWith, catchError, of } from 'rxjs';
import { PacienteService } from '../../services/paciente.service';
import { Usuario } from '../../../../core/models';
import { CpfPipe } from '../../../../shared/pipes/cpf.pipe';
import { CnsPipe } from '../../../../shared/pipes/cns.pipe';
import { TelefonePipe } from '../../../../shared/pipes/telefone.pipe';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

@Component({
  selector: 'app-lista-pacientes',
  standalone: true,
  imports: [CommonModule, FormsModule, CpfPipe, CnsPipe, TelefonePipe],
  templateUrl: './lista-pacientes.component.html',
  styleUrl: './lista-pacientes.component.scss'
})
export class ListaPacientesComponent implements OnInit {
  private router = inject(Router);
  private pacienteService = inject(PacienteService);

  pacientes: Usuario[] = [];
  pacientesFiltrados: Usuario[] = [];
  isLoading = false;
  errorMessage = '';

  // Filtros
  searchTerm = '';
  filtroTipo: 'todos' | 'nome' | 'cpf' | 'cns' = 'todos';
  
  // Paginação
  paginaAtual = 1;
  itensPorPagina = 10;
  totalPaginas = 0;
  
  // Search subject para debounce
  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.carregarPacientes();
    this.setupSearch();
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(termo => {
      this.aplicarFiltros();
    });
  }

  carregarPacientes(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.pacienteService.listarPacientes().subscribe({
      next: (pacientes) => {
        this.pacientes = pacientes;
        this.aplicarFiltros();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar pacientes:', error);
        this.errorMessage = 'Erro ao carregar pacientes. Por favor, tente novamente.';
        this.isLoading = false;
      }
    });
  }

  onSearchChange(termo: string): void {
    this.searchTerm = termo;
    this.searchSubject.next(termo);
  }

  aplicarFiltros(): void {
    let resultado = [...this.pacientes];

    if (this.searchTerm.trim()) {
      const termo = this.searchTerm.toLowerCase().trim();

      resultado = resultado.filter(paciente => {
        switch (this.filtroTipo) {
          case 'nome':
            return paciente.nome.toLowerCase().includes(termo);
          
          case 'cpf':
            const cpfLimpo = paciente.cpf.replace(/\D/g, '');
            const termoLimpo = termo.replace(/\D/g, '');
            return cpfLimpo.includes(termoLimpo);
          
          case 'cns':
            if (!paciente.cns) return false;
            const cnsLimpo = paciente.cns.replace(/\D/g, '');
            const termoLimpoCns = termo.replace(/\D/g, '');
            return cnsLimpo.includes(termoLimpoCns);
          
          default: // 'todos'
            const cpf = paciente.cpf.replace(/\D/g, '');
            const termoNum = termo.replace(/\D/g, '');
            
            return paciente.nome.toLowerCase().includes(termo) ||
                   cpf.includes(termoNum) ||
                   (paciente.cns && paciente.cns.replace(/\D/g, '').includes(termoNum));
        }
      });
    }

    this.pacientesFiltrados = resultado;
    this.calcularPaginacao();
  }

  calcularPaginacao(): void {
    this.totalPaginas = Math.ceil(this.pacientesFiltrados.length / this.itensPorPagina);
    
    // Ajusta página atual se necessário
    if (this.paginaAtual > this.totalPaginas && this.totalPaginas > 0) {
      this.paginaAtual = this.totalPaginas;
    }
  }

  get pacientesPaginados(): Usuario[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    return this.pacientesFiltrados.slice(inicio, fim);
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

  novoPaciente(): void {
    this.router.navigate(['/bioquimico/pacientes/novo']);
  }

  editarPaciente(paciente: Usuario): void {
    this.router.navigate(['/bioquimico/pacientes/editar', paciente.uid]);
  }

  visualizarPaciente(paciente: Usuario): void {
    this.router.navigate(['/bioquimico/pacientes/detalhes', paciente.uid]);
  }

  desativarPaciente(paciente: Usuario): void {
    if (!confirm(`Tem certeza que deseja desativar o paciente ${paciente.nome}?`)) {
      return;
    }

    this.isLoading = true;

    this.pacienteService.desativarPaciente(paciente.uid).subscribe({
      next: () => {
        this.carregarPacientes();
      },
      error: (error) => {
        console.error('Erro ao desativar paciente:', error);
        this.errorMessage = 'Erro ao desativar paciente. Por favor, tente novamente.';
        this.isLoading = false;
      }
    });
  }

  formatarData(data: Date): string {
    return format(new Date(data), 'dd/MM/yyyy', { locale: ptBR });
  }

  calcularIdade(dataNascimento: Date): number {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();

    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }

    return idade;
  }

  limparFiltros(): void {
    this.searchTerm = '';
    this.filtroTipo = 'todos';
    this.paginaAtual = 1;
    this.aplicarFiltros();
  }
}
