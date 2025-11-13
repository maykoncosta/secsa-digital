import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs';
import { PacienteService } from '../../services/paciente.service';
import { ExameService } from '../../services/exame.service';
import { ValorReferenciaService } from '../../services/valor-referencia.service';
import { Usuario, Exame, ParametroExame, ValorReferencia } from '../../../../core/models';
import { CpfPipe } from '../../../../shared/pipes/cpf.pipe';
import { CnsPipe } from '../../../../shared/pipes/cns.pipe';

// Definições de parâmetros por tipo de exame
const PARAMETROS_HEMOGRAMA = [
  { nome: 'Hemácias', unidade: 'milhões/mm³' },
  { nome: 'Hemoglobina', unidade: 'g/dL' },
  { nome: 'Hematócrito', unidade: '%' },
  { nome: 'VCM', unidade: 'fL' },
  { nome: 'HCM', unidade: 'pg' },
  { nome: 'CHCM', unidade: '%' },
  { nome: 'RDW', unidade: '%' },
  { nome: 'Leucócitos', unidade: '/mm³' },
  { nome: 'Neutrófilos', unidade: '%' },
  { nome: 'Linfócitos', unidade: '%' },
  { nome: 'Monócitos', unidade: '%' },
  { nome: 'Eosinófilos', unidade: '%' },
  { nome: 'Basófilos', unidade: '%' },
  { nome: 'Plaquetas', unidade: '/mm³' }
];

const PARAMETROS_URINA = [
  { nome: 'Cor', unidade: '' },
  { nome: 'Aspecto', unidade: '' },
  { nome: 'pH', unidade: '' },
  { nome: 'Densidade', unidade: '' },
  { nome: 'Proteínas', unidade: 'mg/dL' },
  { nome: 'Glicose', unidade: 'mg/dL' },
  { nome: 'Corpos Cetônicos', unidade: '' },
  { nome: 'Bilirrubina', unidade: '' },
  { nome: 'Urobilinogênio', unidade: '' },
  { nome: 'Hemoglobina', unidade: '' },
  { nome: 'Leucócitos', unidade: '/campo' },
  { nome: 'Hemácias', unidade: '/campo' },
  { nome: 'Células Epiteliais', unidade: '/campo' },
  { nome: 'Cilindros', unidade: '/campo' },
  { nome: 'Cristais', unidade: '' },
  { nome: 'Bactérias', unidade: '' }
];

const PARAMETROS_FEZES = [
  { nome: 'Cor', unidade: '' },
  { nome: 'Consistência', unidade: '' },
  { nome: 'pH', unidade: '' },
  { nome: 'Muco', unidade: '' },
  { nome: 'Sangue Oculto', unidade: '' },
  { nome: 'Leucócitos', unidade: '/campo' },
  { nome: 'Hemácias', unidade: '/campo' },
  { nome: 'Parasitas', unidade: '' },
  { nome: 'Ovos', unidade: '' },
  { nome: 'Cistos', unidade: '' },
  { nome: 'Fibras Musculares', unidade: '' },
  { nome: 'Gordura Neutra', unidade: '' },
  { nome: 'Amido', unidade: '' }
];

@Component({
  selector: 'app-cadastro-exame',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, CpfPipe, CnsPipe],
  templateUrl: './cadastro-exame.component.html',
  styleUrl: './cadastro-exame.component.scss'
})
export class CadastroExameComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private pacienteService = inject(PacienteService);
  private exameService = inject(ExameService);
  private valorReferenciaService = inject(ValorReferenciaService);

  form!: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Busca de paciente
  searchPaciente = '';
  pacientesFiltrados: Usuario[] = [];
  pacienteSelecionado: Usuario | null = null;
  buscandoPaciente = false;

  // Valores de referência
  valoresReferencia: ValorReferencia[] = [];

  // Parâmetros disponíveis por tipo
  parametrosDisponiveis: { nome: string; unidade: string }[] = [];

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.form = this.fb.group({
      pacienteId: ['', Validators.required],
      tipoExame: ['', Validators.required],
      dataColeta: ['', Validators.required],
      observacoes: [''],
      parametros: this.fb.array([])
    });

    // Observar mudanças no tipo de exame
    this.form.get('tipoExame')?.valueChanges.subscribe(tipo => {
      if (tipo) {
        this.carregarParametrosPorTipo(tipo);
        this.carregarValoresReferencia(tipo);
      }
    });
  }

  get parametrosArray(): FormArray {
    return this.form.get('parametros') as FormArray;
  }

  private carregarParametrosPorTipo(tipo: 'hemograma' | 'urina' | 'fezes'): void {
    // Limpar parâmetros anteriores
    this.parametrosArray.clear();

    // Definir parâmetros disponíveis
    switch (tipo) {
      case 'hemograma':
        this.parametrosDisponiveis = PARAMETROS_HEMOGRAMA;
        break;
      case 'urina':
        this.parametrosDisponiveis = PARAMETROS_URINA;
        break;
      case 'fezes':
        this.parametrosDisponiveis = PARAMETROS_FEZES;
        break;
    }

    // Adicionar campos para cada parâmetro
    this.parametrosDisponiveis.forEach(param => {
      this.parametrosArray.push(this.fb.group({
        nome: [param.nome],
        valor: ['', Validators.required],
        unidade: [param.unidade],
        valorReferencia: [''],
        alterado: [false],
        observacao: ['']
      }));
    });
  }

  private carregarValoresReferencia(tipo: 'hemograma' | 'urina' | 'fezes'): void {
    this.valorReferenciaService.buscarPorTipoExame(tipo).subscribe({
      next: (valores) => {
        this.valoresReferencia = valores;
      },
      error: (error) => {
        console.error('Erro ao carregar valores de referência:', error);
      }
    });
  }

  buscarPacientes(): void {
    if (!this.searchPaciente || this.searchPaciente.trim().length < 3) {
      this.pacientesFiltrados = [];
      return;
    }

    this.buscandoPaciente = true;

    this.pacienteService.buscarPorNome(this.searchPaciente).subscribe({
      next: (pacientes) => {
        this.pacientesFiltrados = pacientes;
        this.buscandoPaciente = false;
      },
      error: (error) => {
        console.error('Erro ao buscar pacientes:', error);
        this.buscandoPaciente = false;
      }
    });
  }

  selecionarPaciente(paciente: Usuario): void {
    this.pacienteSelecionado = paciente;
    this.form.patchValue({ pacienteId: paciente.uid });
    this.pacientesFiltrados = [];
    this.searchPaciente = '';
  }

  limparPaciente(): void {
    this.pacienteSelecionado = null;
    this.form.patchValue({ pacienteId: '' });
  }

  onValorChange(index: number): void {
    const parametroGroup = this.parametrosArray.at(index);
    const valor = parametroGroup.get('valor')?.value;
    const nomeParametro = parametroGroup.get('nome')?.value;

    if (!valor || !nomeParametro || !this.pacienteSelecionado) return;

    // Buscar valor de referência
    const idade = this.valorReferenciaService.calcularIdade(this.pacienteSelecionado.dataNascimento);
    const sexo = this.determinarSexo(this.pacienteSelecionado);

    this.valorReferenciaService.buscarValor(
      this.form.get('tipoExame')?.value,
      nomeParametro,
      idade,
      sexo
    ).subscribe({
      next: (valorRef) => {
        if (valorRef) {
          const valorRefFormatado = this.valorReferenciaService.formatarValorReferencia(valorRef);
          parametroGroup.patchValue({
            valorReferencia: valorRefFormatado
          });

          // Verificar se está alterado (apenas para valores numéricos)
          const valorNumerico = parseFloat(valor);
          if (!isNaN(valorNumerico)) {
            const alterado = this.valorReferenciaService.valorAlterado(valorNumerico, valorRef);
            parametroGroup.patchValue({ alterado });
          }
        }
      },
      error: (error) => {
        console.error('Erro ao buscar valor de referência:', error);
      }
    });
  }

  private determinarSexo(paciente: Usuario): 'M' | 'F' | undefined {
    return paciente.sexo;
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid || !this.pacienteSelecionado) {
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const formValue = this.form.value;

      // Obter usuário atual (temporário - depois vem da autenticação)
      const usuarioAtualId = 'bioquimico-temp-id';

      const exame: Omit<Exame, 'id' | 'codigo' | 'criadoEm' | 'atualizadoEm'> = {
        pacienteId: this.pacienteSelecionado.uid,
        pacienteNome: this.pacienteSelecionado.nome,
        pacienteCpf: this.pacienteSelecionado.cpf,
        pacienteCns: this.pacienteSelecionado.cns,
        pacienteDataNascimento: this.pacienteSelecionado.dataNascimento,
        tipoExame: formValue.tipoExame,
        status: 'pendente',
        dataColeta: new Date(formValue.dataColeta),
        observacoes: formValue.observacoes || undefined,
        parametros: formValue.parametros,
        criadoPor: usuarioAtualId,
        atualizadoPor: usuarioAtualId
      };

      const id = await this.exameService.criarExame(exame).toPromise();
      
      this.successMessage = 'Exame cadastrado com sucesso!';

      setTimeout(() => {
        this.router.navigate(['/bioquimico/exames']);
      }, 2000);

    } catch (error: any) {
      console.error('Erro ao salvar exame:', error);
      this.errorMessage = 'Erro ao salvar exame. Por favor, tente novamente.';
    } finally {
      this.isLoading = false;
    }
  }

  onCancel(): void {
    this.router.navigate(['/bioquimico/exames']);
  }

  get totalParametrosAlterados(): number {
    return this.parametrosArray.controls.filter(
      control => control.get('alterado')?.value === true
    ).length;
  }
}
