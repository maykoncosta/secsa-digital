import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExameRealizadoService } from '../../services/exame-realizado.service';
import { TipoExameService } from '../../services/tipo-exame.service';
import { ExameRealizado, TipoExame } from '../../../../core/models';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from 'date-fns';

interface RelatorioExames {
  total: number;
  pendentes: number;
  liberados: number;
  cancelados: number;
  porTipo: { [key: string]: number };
  porPeriodo: { data: string; quantidade: number }[];
}

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './relatorios.component.html',
  styleUrl: './relatorios.component.scss'
})
export class RelatoriosComponent implements OnInit {
  private exameRealizadoService = inject(ExameRealizadoService);
  private tipoExameService = inject(TipoExameService);

  isLoading = false;
  errorMessage = '';

  // Filtros
  dataInicio: string = '';
  dataFim: string = '';
  tipoExameSelecionado: string = 'todos';
  statusSelecionado: string = 'todos';

  // Dados
  exames: ExameRealizado[] = [];
  tiposExames: TipoExame[] = [];
  relatorio: RelatorioExames = {
    total: 0,
    pendentes: 0,
    liberados: 0,
    cancelados: 0,
    porTipo: {},
    porPeriodo: []
  };

  ngOnInit(): void {
    this.definirPeriodoPadrao();
    this.carregarTiposExames();
    this.gerarRelatorio();
  }

  private definirPeriodoPadrao(): void {
    const hoje = new Date();
    const inicioMes = startOfMonth(hoje);
    
    this.dataInicio = format(inicioMes, 'yyyy-MM-dd');
    this.dataFim = format(hoje, 'yyyy-MM-dd');
  }

  private carregarTiposExames(): void {
    this.tipoExameService.listarTiposExames().subscribe({
      next: (tipos) => {
        this.tiposExames = tipos;
      },
      error: (error) => {
        console.error('Erro ao carregar tipos de exames:', error);
      }
    });
  }

  gerarRelatorio(): void {
    if (!this.dataInicio || !this.dataFim) {
      this.errorMessage = 'Selecione o período para gerar o relatório';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.exameRealizadoService.listarTodos().subscribe({
      next: (exames: ExameRealizado[]) => {
        this.exames = this.filtrarExames(exames);
        this.calcularEstatisticas();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Erro ao carregar exames:', error);
        this.errorMessage = 'Erro ao gerar relatório';
        this.isLoading = false;
      }
    });
  }

  private filtrarExames(exames: ExameRealizado[]): ExameRealizado[] {
    const dataInicioObj = new Date(this.dataInicio);
    const dataFimObj = new Date(this.dataFim);
    dataFimObj.setHours(23, 59, 59, 999);

    return exames.filter(exame => {
      const dataExame = exame.criadoEm instanceof Date 
        ? exame.criadoEm 
        : (exame.criadoEm as any).toDate();
      
      // Filtro por período
      if (dataExame < dataInicioObj || dataExame > dataFimObj) {
        return false;
      }

      // Filtro por tipo
      if (this.tipoExameSelecionado !== 'todos' && exame.exameId !== this.tipoExameSelecionado) {
        return false;
      }

      // Filtro por status
      if (this.statusSelecionado !== 'todos' && exame.status !== this.statusSelecionado) {
        return false;
      }

      return true;
    });
  }

  private calcularEstatisticas(): void {
    this.relatorio = {
      total: this.exames.length,
      pendentes: this.exames.filter(e => e.status === 'pendente').length,
      liberados: this.exames.filter(e => e.status === 'liberado').length,
      cancelados: this.exames.filter(e => e.status === 'cancelado').length,
      porTipo: {},
      porPeriodo: []
    };

    // Agrupar por tipo
    this.exames.forEach(exame => {
      const tipo = exame.exameNome || 'Sem tipo';
      this.relatorio.porTipo[tipo] = (this.relatorio.porTipo[tipo] || 0) + 1;
    });

    // Agrupar por período (últimos 12 meses)
    const mesesMap = new Map<string, number>();
    this.exames.forEach(exame => {
      const data = exame.criadoEm instanceof Date 
        ? exame.criadoEm 
        : (exame.criadoEm as any).toDate();
      const mesAno = format(data, 'MM/yyyy');
      mesesMap.set(mesAno, (mesesMap.get(mesAno) || 0) + 1);
    });

    this.relatorio.porPeriodo = Array.from(mesesMap.entries())
      .map(([data, quantidade]) => ({ data, quantidade }))
      .sort((a, b) => {
        const [mesA, anoA] = a.data.split('/');
        const [mesB, anoB] = b.data.split('/');
        return new Date(+anoA, +mesA - 1).getTime() - new Date(+anoB, +mesB - 1).getTime();
      });
  }

  definirPeriodo(tipo: string): void {
    const hoje = new Date();
    
    switch (tipo) {
      case 'mes-atual':
        this.dataInicio = format(startOfMonth(hoje), 'yyyy-MM-dd');
        this.dataFim = format(hoje, 'yyyy-MM-dd');
        break;
      case 'mes-anterior':
        const mesAnterior = subMonths(hoje, 1);
        this.dataInicio = format(startOfMonth(mesAnterior), 'yyyy-MM-dd');
        this.dataFim = format(endOfMonth(mesAnterior), 'yyyy-MM-dd');
        break;
      case 'ano-atual':
        this.dataInicio = format(startOfYear(hoje), 'yyyy-MM-dd');
        this.dataFim = format(hoje, 'yyyy-MM-dd');
        break;
    }

    this.gerarRelatorio();
  }

  get tiposMaisRealizados(): Array<{ tipo: string; quantidade: number }> {
    return Object.entries(this.relatorio.porTipo)
      .map(([tipo, quantidade]) => ({ tipo, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5);
  }

  get percentualLiberados(): number {
    return this.relatorio.total > 0 
      ? Math.round((this.relatorio.liberados / this.relatorio.total) * 100) 
      : 0;
  }

  get percentualPendentes(): number {
    return this.relatorio.total > 0 
      ? Math.round((this.relatorio.pendentes / this.relatorio.total) * 100) 
      : 0;
  }

  get percentualCancelados(): number {
    return this.relatorio.total > 0 
      ? Math.round((this.relatorio.cancelados / this.relatorio.total) * 100) 
      : 0;
  }

  exportarCSV(): void {
    const headers = ['Código', 'Paciente', 'CPF', 'Tipo Exame', 'Data', 'Status'];
    const rows = this.exames.map(exame => [
      exame.codigo || '',
      exame.pacienteNome || '',
      exame.pacienteCpf || '',
      exame.exameNome || '',
      this.formatarData(exame.criadoEm),
      exame.status || ''
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio-exames-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  imprimir(): void {
    window.print();
  }

  formatarData(data: any): string {
    if (!data) return '-';
    const dataObj = data instanceof Date ? data : (data.toDate ? data.toDate() : new Date(data));
    return format(dataObj, 'dd/MM/yyyy');
  }
}
