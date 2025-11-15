import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ExameRealizadoService } from '../../../bioquimico/services/exame-realizado.service';
import { ExameRealizado, ParametroExameRealizado } from '../../../../core/models';

@Component({
  selector: 'app-visualizar-exame',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visualizar-exame.component.html',
  styleUrl: './visualizar-exame.component.scss'
})
export class VisualizarExameComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private exameRealizadoService = inject(ExameRealizadoService);

  exame: ExameRealizado | null = null;
  parametros: ParametroExameRealizado[] = [];
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    const exameId = this.route.snapshot.paramMap.get('id');
    if (exameId) {
      this.carregarExame(exameId);
    }
  }

  carregarExame(exameId: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.exameRealizadoService.buscarExameCompleto(exameId).subscribe({
      next: (resultado: any) => {
        if (resultado) {
          this.exame = resultado.exame;
          this.parametros = resultado.parametros || [];
        } else {
          this.errorMessage = 'Exame não encontrado.';
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Erro ao carregar exame:', error);
        this.errorMessage = 'Erro ao carregar o exame. Por favor, tente novamente.';
        this.isLoading = false;
      }
    });
  }

  voltar(): void {
    this.router.navigate(['/paciente/exames']);
  }

  baixarPDF(): void {
    if (!this.exame) return;

    // TODO: Implementar geração de PDF real
    alert('Funcionalidade de download de PDF será implementada em breve!');
  }

  imprimirExame(): void {
    window.print();
  }

  formatarData(data: any): string {
    if (!data) return '-';
    
    if (data.toDate && typeof data.toDate === 'function') {
      const d = data.toDate();
      return d.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    const d = typeof data === 'string' ? new Date(data) : data;
    return d.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getInterpretacaoClass(interpretacao: string): string {
    return `interpretacao-${interpretacao}`;
  }

  getInterpretacaoIcon(interpretacao: string): string {
    const icons: { [key: string]: string } = {
      'normal': '✓',
      'alterado': '⚠',
      'critico': '⚠'
    };
    return icons[interpretacao] || '•';
  }

  // Agrupa parâmetros por grupo
  get parametrosAgrupados(): { grupo: string; parametros: ParametroExameRealizado[] }[] {
    const grupos: { [key: string]: ParametroExameRealizado[] } = {};

    this.parametros.forEach(p => {
      const nomeGrupo = p.grupo || 'Outros';
      if (!grupos[nomeGrupo]) {
        grupos[nomeGrupo] = [];
      }
      grupos[nomeGrupo].push(p);
    });

    return Object.keys(grupos).map(grupo => ({
      grupo,
      parametros: grupos[grupo]
    }));
  }

  getDataAtual(): Date {
    return new Date();
  }
}
