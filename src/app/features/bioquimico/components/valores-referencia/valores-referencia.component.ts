import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TipoExameService } from '../../services/tipo-exame.service';
import { TipoExame, ParametroTipoExame, ValorReferenciaParametro } from '../../../../core/models';

interface ParametroComReferencias {
  parametro: ParametroTipoExame;
  referencias: ValorReferenciaParametro[];
}

@Component({
  selector: 'app-valores-referencia',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './valores-referencia.component.html',
  styleUrl: './valores-referencia.component.scss'
})
export class ValoresReferenciaComponent implements OnInit {
  private tipoExameService = inject(TipoExameService);
  private fb = inject(FormBuilder);

  tiposExames: TipoExame[] = [];
  tipoExameSelecionado: TipoExame | null = null;
  parametrosComReferencias: ParametroComReferencias[] = [];
  
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Edição de referência
  referenciaEmEdicao: ValorReferenciaParametro | null = null;
  parametroEmEdicao: ParametroTipoExame | null = null;
  formReferencia!: FormGroup;
  modoEdicao: 'criar' | 'editar' = 'criar';
  parametroExpandido: string | null = null;

  ngOnInit(): void {
    this.initFormReferencia();
    this.carregarTiposExames();
  }

  private initFormReferencia(): void {
    this.formReferencia = this.fb.group({
      sexo: ['ambos', Validators.required],
      idadeMin: [null],
      idadeMax: [null],
      valorMin: [null],
      valorMax: [null],
      valorEsperado: [''],
      ativo: [true]
    });
  }

  private carregarTiposExames(): void {
    this.isLoading = true;
    this.tipoExameService.listarTiposExames().subscribe({
      next: (tipos) => {
        this.tiposExames = tipos;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar tipos de exames:', error);
        this.errorMessage = 'Erro ao carregar tipos de exames';
        this.isLoading = false;
      }
    });
  }

  async onTipoExameChange(): Promise<void> {
    if (!this.tipoExameSelecionado) {
      this.parametrosComReferencias = [];
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      await this.carregarParametrosEReferencias(this.tipoExameSelecionado.uid);
    } catch (error) {
      console.error('Erro ao carregar parâmetros:', error);
      this.errorMessage = 'Erro ao carregar parâmetros e valores de referência';
    } finally {
      this.isLoading = false;
    }
  }

  private async carregarParametrosEReferencias(tipoExameId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.tipoExameService.listarParametros(tipoExameId).subscribe({
        next: async (parametros) => {
          this.parametrosComReferencias = [];

          for (const parametro of parametros) {
            const referencias = await this.carregarReferencias(tipoExameId, parametro.uid);
            this.parametrosComReferencias.push({
              parametro,
              referencias
            });
          }

          resolve();
        },
        error: reject
      });
    });
  }

  private async carregarReferencias(tipoExameId: string, parametroId: string): Promise<ValorReferenciaParametro[]> {
    return new Promise((resolve) => {
      this.tipoExameService.listarValoresReferencia(tipoExameId, parametroId).subscribe({
        next: (referencias) => resolve(referencias),
        error: () => resolve([])
      });
    });
  }

  abrirFormCriar(parametro: ParametroTipoExame): void {
    this.modoEdicao = 'criar';
    this.parametroEmEdicao = parametro;
    this.referenciaEmEdicao = null;
    this.formReferencia.reset({
      sexo: 'ambos',
      ativo: true
    });
  }

  abrirFormEditar(parametro: ParametroTipoExame, referencia: ValorReferenciaParametro): void {
    this.modoEdicao = 'editar';
    this.parametroEmEdicao = parametro;
    this.referenciaEmEdicao = referencia;
    
    this.formReferencia.patchValue({
      sexo: referencia.sexo,
      idadeMin: referencia.idadeMin ?? null,
      idadeMax: referencia.idadeMax ?? null,
      valorMin: referencia.valorMin ?? null,
      valorMax: referencia.valorMax ?? null,
      valorEsperado: referencia.valorEsperado ?? '',
      ativo: referencia.ativo
    });
  }

  cancelarEdicao(): void {
    this.parametroEmEdicao = null;
    this.referenciaEmEdicao = null;
    this.formReferencia.reset({
      sexo: 'ambos',
      ativo: true
    });
  }

  async salvarReferencia(): Promise<void> {
    if (!this.formReferencia.valid || !this.parametroEmEdicao || !this.tipoExameSelecionado) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const dados = this.formReferencia.value;
      
      // Remove campos vazios/null
      const dadosLimpos: any = {
        sexo: dados.sexo,
        ativo: dados.ativo
      };

      if (dados.idadeMin !== null && dados.idadeMin !== '') {
        dadosLimpos.idadeMin = Number(dados.idadeMin);
      }
      if (dados.idadeMax !== null && dados.idadeMax !== '') {
        dadosLimpos.idadeMax = Number(dados.idadeMax);
      }
      if (dados.valorMin !== null && dados.valorMin !== '') {
        dadosLimpos.valorMin = Number(dados.valorMin);
      }
      if (dados.valorMax !== null && dados.valorMax !== '') {
        dadosLimpos.valorMax = Number(dados.valorMax);
      }
      if (dados.valorEsperado && dados.valorEsperado.trim()) {
        dadosLimpos.valorEsperado = dados.valorEsperado.trim();
      }

      if (this.modoEdicao === 'criar') {
        await this.tipoExameService.adicionarValorReferencia(
          this.tipoExameSelecionado.uid,
          this.parametroEmEdicao.uid,
          dadosLimpos
        );
        this.successMessage = 'Valor de referência criado com sucesso!';
      } else if (this.referenciaEmEdicao) {
        await this.tipoExameService.atualizarValorReferencia(
          this.tipoExameSelecionado.uid,
          this.parametroEmEdicao.uid,
          this.referenciaEmEdicao.uid,
          dadosLimpos
        );
        this.successMessage = 'Valor de referência atualizado com sucesso!';
      }

      // Recarrega dados
      await this.carregarParametrosEReferencias(this.tipoExameSelecionado.uid);
      this.cancelarEdicao();

      // Limpa mensagem de sucesso após 3 segundos
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);

    } catch (error) {
      console.error('Erro ao salvar valor de referência:', error);
      this.errorMessage = 'Erro ao salvar valor de referência. Tente novamente.';
    } finally {
      this.isLoading = false;
    }
  }

  formatarReferencia(ref: ValorReferenciaParametro): string {
    if (ref.valorEsperado) {
      return ref.valorEsperado;
    }
    
    if (ref.valorMin !== undefined && ref.valorMax !== undefined) {
      return `${ref.valorMin} - ${ref.valorMax}`;
    }
    
    if (ref.valorMin !== undefined) {
      return `≥ ${ref.valorMin}`;
    }
    
    if (ref.valorMax !== undefined) {
      return `≤ ${ref.valorMax}`;
    }
    
    return '-';
  }

  formatarIdade(ref: ValorReferenciaParametro): string {
    if (ref.idadeMin !== undefined && ref.idadeMax !== undefined) {
      return `${ref.idadeMin} - ${ref.idadeMax} anos`;
    }
    
    if (ref.idadeMin !== undefined) {
      return `≥ ${ref.idadeMin} anos`;
    }
    
    if (ref.idadeMax !== undefined) {
      return `≤ ${ref.idadeMax} anos`;
    }
    
    return 'Todas as idades';
  }

  formatarSexo(sexo: string): string {
    switch (sexo) {
      case 'M': return 'Masculino';
      case 'F': return 'Feminino';
      case 'ambos': return 'Ambos';
      default: return sexo;
    }
  }

  toggleParametro(parametroUid: string): void {
    if (this.parametroExpandido === parametroUid) {
      this.parametroExpandido = null;
      this.cancelarEdicao();
    } else {
      this.parametroExpandido = parametroUid;
    }
  }

  get tipoParametro(): string {
    return this.parametroEmEdicao?.tipo === 'numerico' ? 'numérico' : 'texto';
  }
}
