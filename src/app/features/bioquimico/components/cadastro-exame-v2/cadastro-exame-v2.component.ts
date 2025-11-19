import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, map } from 'rxjs';
import { differenceInYears } from 'date-fns';
import { PacienteService } from '../../services/paciente.service';
import { TipoExameService } from '../../services/tipo-exame.service';
import { ExameRealizadoService } from '../../services/exame-realizado.service';
import {
    Usuario,
    TipoExame,
    ParametroTipoExame,
    ValorReferenciaParametro,
    ParametroExameRealizado
} from '../../../../core/models';
import { CpfPipe } from '../../../../shared/pipes/cpf.pipe';
import { CnsPipe } from '../../../../shared/pipes/cns.pipe';

@Component({
    selector: 'app-cadastro-exame-v2',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule, CpfPipe, CnsPipe],
    templateUrl: './cadastro-exame-v2.component.html',
    styleUrl: './cadastro-exame-v2.component.scss'
})
export class CadastroExameV2Component implements OnInit {
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private pacienteService = inject(PacienteService);
    private tipoExameService = inject(TipoExameService);
    private exameRealizadoService = inject(ExameRealizadoService);

    form!: FormGroup;
    isLoading = false;
    errorMessage = '';
    successMessage = '';

    // Busca de paciente
    searchPaciente = '';
    criterioBusca: 'nome' | 'cpf' | 'cns' = 'nome';
    pacientesFiltrados: Usuario[] = [];
    pacienteSelecionado: Usuario | null = null;
    buscandoPaciente = false;

    // Tipos de exames disponíveis
    tiposExames: TipoExame[] = [];
    tipoExameSelecionado: TipoExame | null = null;

    // Carregamento de parâmetros
    carregandoParametros = false;

    // Parâmetros do exame selecionado
    parametros: ParametroTipoExame[] = [];

    ngOnInit(): void {
        this.initForm();
        this.carregarTiposExames();
    }

    private initForm(): void {
        this.form = this.fb.group({
            pacienteId: ['', Validators.required],
            tipoExameId: [{ value: '', disabled: true }, Validators.required],
            dataColeta: ['', Validators.required],
            observacoes: [''],
            parametros: this.fb.array([])
        });
    }

    get parametrosArray(): FormArray {
        return this.form.get('parametros') as FormArray;
    }

    /**
     * Carrega os tipos de exames disponíveis
     */
    private carregarTiposExames(): void {
        this.tipoExameService.listarTiposExames().subscribe({
            next: (tipos) => {
                this.tiposExames = tipos;
                console.log('Tipos de exames carregados:', tipos.length);
            },
            error: (error) => {
                console.error('Erro ao carregar tipos de exames:', error);
                this.errorMessage = 'Erro ao carregar tipos de exames disponíveis';
            }
        });
    }

    /**
     * Busca pacientes pelo termo de busca e critério selecionado
     */
    buscarPacientes(): void {
        const termo = this.searchPaciente.trim();
        
        if (!termo || termo.length < 3) {
            this.errorMessage = 'Digite pelo menos 3 caracteres para buscar.';
            this.pacientesFiltrados = [];
            return;
        }

        this.buscandoPaciente = true;
        this.errorMessage = '';

        // Busca baseada no critério selecionado
        let observable$: Observable<Usuario[]>;
        
        switch (this.criterioBusca) {
            case 'cpf':
                observable$ = this.pacienteService.buscarPorCpf(termo).pipe(
                    map(paciente => paciente ? [paciente] : [])
                );
                break;
            case 'cns':
                observable$ = this.pacienteService.buscarPorCns(termo).pipe(
                    map(paciente => paciente ? [paciente] : [])
                );
                break;
            case 'nome':
            default:
                observable$ = this.pacienteService.buscarPorNome(termo);
                break;
        }

        observable$.subscribe({
            next: (pacientes: Usuario[]) => {
                this.pacientesFiltrados = pacientes;
                this.buscandoPaciente = false;
                
                if (pacientes.length === 0) {
                    this.errorMessage = 'Nenhum paciente encontrado.';
                }
            },
            error: (error: any) => {
                console.error('Erro ao buscar pacientes:', error);
                this.errorMessage = 'Erro ao buscar pacientes. Tente novamente.';
                this.buscandoPaciente = false;
            }
        });
    }

    /**
     * Seleciona um paciente da lista
     */
    selecionarPaciente(paciente: Usuario): void {
        this.pacienteSelecionado = paciente;
        this.searchPaciente = `${paciente.nome} - CPF: ${paciente.cpf}`;
        this.form.patchValue({ pacienteId: paciente.uid });
        this.pacientesFiltrados = [];

        // Habilita seleção de tipo de exame
        this.form.get('tipoExameId')?.enable();
    }

    /**
     * Limpa a seleção do paciente
     */
    limparPaciente(): void {
        this.pacienteSelecionado = null;
        this.searchPaciente = '';
        this.pacientesFiltrados = [];
        this.form.patchValue({ pacienteId: '', tipoExameId: '' });
        this.form.get('tipoExameId')?.disable();
        this.limparParametros();
    }

    /**
     * Quando o tipo de exame é alterado, carrega seus parâmetros
     */
    async onTipoExameChange(): Promise<void> {
        this.limparParametros();
        const tipoExameId = this.form.get('tipoExameId')?.value;

        if (!tipoExameId || !this.pacienteSelecionado) {
            this.limparParametros();
            return;
        }

        // Encontra o tipo de exame selecionado
        this.tipoExameSelecionado = this.tiposExames.find(t => t.uid === tipoExameId) || null;

        if (!this.tipoExameSelecionado) return;

        this.carregandoParametros = true;

        try {
            // Carrega os parâmetros do tipo de exame
            await this.carregarParametrosComReferencias(tipoExameId);
        } catch (error) {
            console.error('Erro ao carregar parâmetros:', error);
            this.errorMessage = 'Erro ao carregar parâmetros do exame';
            this.carregandoParametros = false;
        }
    }

    /**
     * Carrega parâmetros e valores de referência
     */
    private async carregarParametrosComReferencias(tipoExameId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.tipoExameService.listarParametros(tipoExameId).subscribe({
                next: async (parametros) => {
                    this.parametros = parametros;

                    // Para cada parâmetro, carrega o valor de referência aplicável
                    for (const parametro of parametros) {
                        await this.adicionarParametroComReferencia(tipoExameId, parametro);
                    }

                    this.carregandoParametros = false;
                    console.log('Parâmetros carregados:', parametros.length);
                    resolve();
                },
                error: (error) => {
                    this.carregandoParametros = false;
                    reject(error);
                }
            });
        });
    }

    /**
     * Adiciona um parâmetro ao FormArray com seu valor de referência
     */
    private async adicionarParametroComReferencia(
        tipoExameId: string,
        parametro: ParametroTipoExame
    ): Promise<void> {
        if (!this.pacienteSelecionado) return;

        // Calcula idade do paciente
        const idade = differenceInYears(new Date(), this.pacienteSelecionado.dataNascimento);
        const sexo = this.pacienteSelecionado.sexo;

        // Busca valor de referência aplicável
        const valorRef = await this.tipoExameService.buscarValorReferenciaAplicavel(
            tipoExameId,
            parametro.uid,
            sexo,
            idade
        );

        // Formata valor de referência para exibição
        const valorRefFormatado = valorRef
            ? this.tipoExameService.formatarValorReferencia(valorRef)
            : '-';

        // Adiciona ao FormArray
        const parametroGroup = this.fb.group({
            parametroId: [parametro.uid],
            nome: [parametro.nome],
            valor: ['', parametro.obrigatorio ? Validators.required : []],
            unidade: [parametro.unidade],
            tipo: [parametro.tipo],
            grupo: [parametro.grupo],
            valorReferencia: [valorRefFormatado],
            valorReferenciaObj: [valorRef],
            interpretacao: ['normal']
        });

        this.parametrosArray.push(parametroGroup);
    }

    /**
     * Limpa os parâmetros do formulário
     */
    private limparParametros(): void {
        while (this.parametrosArray.length > 0) {
            this.parametrosArray.removeAt(0);
        }
        this.parametros = [];
        this.tipoExameSelecionado = null;
    }

    /**
     * Quando o valor de um parâmetro muda, valida contra referência
     */
    onValorChange(index: number): void {
        const parametroGroup = this.parametrosArray.at(index) as FormGroup;
        const valor = parametroGroup.get('valor')?.value;
        const tipo = parametroGroup.get('tipo')?.value;
        const valorRefObj = parametroGroup.get('valorReferenciaObj')?.value as ValorReferenciaParametro;

        // Se não tiver valor digitado, reseta para normal
        if (!valor || valor === '') {
            parametroGroup.patchValue({ interpretacao: 'normal' }, { emitEvent: false });
            return;
        }

        // Se não tiver referência, assume normal
        if (!valorRefObj) {
            parametroGroup.patchValue({ interpretacao: 'normal' }, { emitEvent: false });
            return;
        }

        let interpretacao: 'normal' | 'alterado' = 'normal';

        // Validação para valores numéricos
        if (tipo === 'numerico') {
            const valorNum = typeof valor === 'string' ? parseFloat(valor) : valor;

            // Verifica se é um número válido
            if (isNaN(valorNum) || !isFinite(valorNum)) {
                return;
            }

            // Se tem valor esperado (texto), não valida numericamente
            if (valorRefObj.valorEsperado) {
                parametroGroup.patchValue({ interpretacao: 'normal' }, { emitEvent: false });
                return;
            }

            // Verifica se está abaixo do mínimo
            if (valorRefObj.valorMin !== undefined && valorNum < valorRefObj.valorMin) {
                interpretacao = 'alterado';
            } 
            // Verifica se está acima do máximo
            else if (valorRefObj.valorMax !== undefined && valorNum > valorRefObj.valorMax) {
                interpretacao = 'alterado';
            }
        } 
        // Validação para valores de texto (ex: "Negativo", "Ausente")
        else if (tipo === 'texto' && valorRefObj.valorEsperado) {
            const valorTexto = String(valor).toLowerCase().trim();
            const valorEsperado = valorRefObj.valorEsperado.toLowerCase().trim();
            
            // Compara valores ignorando case e espaços
            if (valorTexto !== valorEsperado) {
                interpretacao = 'alterado';
            }
        }

        // Atualiza interpretação
        parametroGroup.patchValue({ interpretacao }, { emitEvent: false });
        
        // Log para debug
        if (interpretacao !== 'normal') {
            console.log(`⚠️ ${parametroGroup.get('nome')?.value}: ${valor} - ${interpretacao.toUpperCase()}`);
        }
    }

    /**
     * Verifica se deve mostrar cabeçalho de grupo
     */
    mostrarCabecalhoGrupo(index: number): boolean {
        const parametroAtual = this.parametrosArray.at(index).get('grupo')?.value;

        if (!parametroAtual) return false;
        if (index === 0 && parametroAtual) return true;

        const parametroAnterior = this.parametrosArray.at(index - 1).get('grupo')?.value;
        return parametroAtual !== parametroAnterior;
    }

    /**
     * Obtém o nome do grupo para exibição
     */
    getNomeGrupo(index: number): string {
        const grupo = this.parametrosArray.at(index).get('grupo')?.value;

        if (!grupo) return '';

        // Converte para maiúsculas
        return grupo.toUpperCase();
    }

    /**
     * Determina sexo por extenso
     */
    determinarSexo(sexo: string): string {
        return sexo === 'M' ? 'Masculino' : 'Feminino';
    }

    /**
     * Retorna a classe CSS baseada na interpretação
     */
    getInterpretacaoClass(interpretacao: string): string {
        return interpretacao === 'alterado' ? 'badge-warning' : 'badge-success';
    }

    /**
     * Retorna o ícone baseado na interpretação
     */
    getInterpretacaoIcon(interpretacao: string): string {
        return interpretacao === 'alterado' ? '⚠️' : '✓';
    }

    /**
     * Verifica se há algum valor alterado
     */
    hasValoresAlterados(): boolean {
        return this.parametrosArray.controls.some(control => {
            const interpretacao = control.get('interpretacao')?.value;
            return interpretacao === 'alterado';
        });
    }

    /**
     * Conta valores por interpretação
     */
    contarInterpretacoes(): { normal: number; alterado: number } {
        const contagem = { normal: 0, alterado: 0 };
        
        this.parametrosArray.controls.forEach(control => {
            const valor = control.get('valor')?.value;
            const interpretacao = control.get('interpretacao')?.value;
            
            if (valor) {
                if (interpretacao === 'alterado') {
                    contagem.alterado++;
                } else {
                    contagem.normal++;
                }
            }
        });
        
        return contagem;
    }

    /**
     * Submete o formulário
     */
    async onSubmit(): Promise<void> {
        // Validação manual porque tipoExameId pode estar disabled
        const formValue = this.form.getRawValue();

        if (!this.pacienteSelecionado || !formValue.pacienteId) {
            this.errorMessage = 'Por favor, selecione um paciente.';
            return;
        }

        if (!this.tipoExameSelecionado || !formValue.tipoExameId) {
            this.errorMessage = 'Por favor, selecione um tipo de exame.';
            return;
        }

        if (!formValue.dataColeta) {
            this.errorMessage = 'Por favor, informe a data da coleta.';
            return;
        }

        // Valida parâmetros obrigatórios
        const parametrosInvalidos = formValue.parametros.some((p: any, index: number) => {
            const parametroOriginal = this.parametros[index];
            return parametroOriginal?.obrigatorio && !p.valor;
        });

        if (parametrosInvalidos) {
            this.errorMessage = 'Por favor, preencha todos os parâmetros obrigatórios.';
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';

        try {
            const formValue = this.form.getRawValue();

            // Prepara dados do exame realizado
            const dadosExame: any = {
                pacienteId: this.pacienteSelecionado.uid,
                pacienteNome: this.pacienteSelecionado.nome,
                pacienteCpf: this.pacienteSelecionado.cpf,
                pacienteDataNascimento: this.pacienteSelecionado.dataNascimento,
                exameId: this.tipoExameSelecionado.uid,
                exameNome: this.tipoExameSelecionado.nome,
                dataColeta: new Date(formValue.dataColeta),
                status: 'pendente' as const,
                profissionalId: 'USER_ID_TEMPORARIO', // TODO: Pegar do Auth
                profissionalNome: 'Bioquímico Temporário' // TODO: Pegar do Auth
            };

            // Adiciona campos opcionais apenas se tiverem valor
            if (this.pacienteSelecionado.cns) {
                dadosExame.pacienteCns = this.pacienteSelecionado.cns;
            }
            if (formValue.observacoes) {
                dadosExame.observacoes = formValue.observacoes;
            }

            // Prepara parâmetros
            const parametros: Omit<ParametroExameRealizado, 'uid'>[] = formValue.parametros.map((p: any) => ({
                nome: p.nome,
                valor: p.valor,
                unidade: p.unidade,
                valorReferencia: p.valorReferencia,
                interpretacao: p.interpretacao || 'normal',
                grupo: p.grupo
            }));

            // Cria o exame realizado
            const exameId = await this.exameRealizadoService.criarExameRealizado(dadosExame, parametros);

            this.successMessage = 'Exame cadastrado com sucesso!';
            console.log('Exame criado:', exameId);

            // Redireciona após 2 segundos
            setTimeout(() => {
                this.router.navigate(['/bioquimico/exames']);
            }, 2000);

        } catch (error) {
            console.error('Erro ao cadastrar exame:', error);
            this.errorMessage = 'Erro ao cadastrar exame. Tente novamente.';
        } finally {
            this.isLoading = false;
        }
    }


    /**
     * Cancela e volta para lista
     */
    cancelar(): void {
        this.router.navigate(['/bioquimico/exames']);
    }
}
