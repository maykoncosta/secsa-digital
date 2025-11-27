import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ExameRealizadoService } from '../../../bioquimico/services/exame-realizado.service';
import { ExameRealizado, ParametroExameRealizado } from '../../../../core/models';
import { PdfGeneratorService } from '../../../../shared/services/pdf-generator.service';

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
  private pdfGeneratorService = inject(PdfGeneratorService);

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

  async baixarPDF(): Promise<void> {
    if (!this.exame) return;

    try {
      await this.pdfGeneratorService.gerarPdfExame(this.exame, this.parametros);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      this.errorMessage = 'Erro ao gerar o PDF. Por favor, tente novamente.';
    }
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
