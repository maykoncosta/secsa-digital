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
  filtroTipo: 'nome' | 'cpf' | 'cns' = 'nome';
  buscandoPacientes = false;
  
  // Paginação
  paginaAtual = 1;
  itensPorPagina = 10;
  totalPaginas = 0;

  ngOnInit(): void {
    this.carregarPacientes();
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

  buscarPacientes(): void {
    const termo = this.searchTerm.trim();
    
    if (!termo || termo.length < 3) {
      this.errorMessage = 'Digite pelo menos 3 caracteres para buscar.';
      return;
    }

    this.buscandoPacientes = true;
    this.errorMessage = '';

    let observable$: Observable<Usuario[]>;
    
    switch (this.filtroTipo) {
      case 'cpf':
        observable$ = this.pacienteService.buscarPorCpf(termo).pipe(
          switchMap(paciente => of(paciente ? [paciente] : []))
        );
        break;
      case 'cns':
        observable$ = this.pacienteService.buscarPorCns(termo).pipe(
          switchMap(paciente => of(paciente ? [paciente] : []))
        );
        break;
      case 'nome':
      default:
        observable$ = this.pacienteService.buscarPorNome(termo);
        break;
    }

    observable$.subscribe({
      next: (pacientes: Usuario[]) => {
        this.pacientes = pacientes;
        this.aplicarFiltros();
        this.buscandoPacientes = false;
        
        if (pacientes.length === 0) {
          this.errorMessage = 'Nenhum paciente encontrado.';
        }
      },
      error: (error: any) => {
        console.error('Erro ao buscar pacientes:', error);
        this.errorMessage = 'Erro ao buscar pacientes. Tente novamente.';
        this.buscandoPacientes = false;
      }
    });
  }

  aplicarFiltros(): void {
    let resultado = [...this.pacientes];

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
    this.filtroTipo = 'nome';
    this.paginaAtual = 1;
    this.errorMessage = '';
    this.carregarPacientes();
  }
}
