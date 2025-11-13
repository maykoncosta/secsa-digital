import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, of, map, debounceTime, switchMap, catchError } from 'rxjs';
import { PacienteService } from '../../services/paciente.service';
import { Usuario } from '../../../../core/models';
import { CpfPipe } from '../../../../shared/pipes/cpf.pipe';
import { CnsPipe } from '../../../../shared/pipes/cns.pipe';
import { TelefonePipe } from '../../../../shared/pipes/telefone.pipe';

@Component({
  selector: 'app-cadastro-paciente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CpfPipe, CnsPipe, TelefonePipe],
  templateUrl: './cadastro-paciente.component.html',
  styleUrl: './cadastro-paciente.component.scss'
})
export class CadastroPacienteComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private pacienteService = inject(PacienteService);

  form!: FormGroup;
  isLoading = false;
  isEditMode = false;
  pacienteId?: string;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.initForm();
    
    // Verifica se está em modo de edição
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.isEditMode = true;
        this.pacienteId = id;
        this.carregarPaciente(id);
      }
    });
  }

  private initForm(): void {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      cpf: ['', [Validators.required], [this.cpfUnicoValidator.bind(this)]],
      cns: ['', [], [this.cnsUnicoValidator.bind(this)]],
      sexo: ['', [Validators.required]],
      dataNascimento: ['', [Validators.required, this.idadeMinimaValidator]],
      telefone: ['', [Validators.required, Validators.pattern(/^\d{10,11}$/)]],
      email: ['', [Validators.email]],
      endereco: this.fb.group({
        cep: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
        logradouro: ['', [Validators.required, Validators.maxLength(150)]],
        numero: ['', [Validators.required, Validators.maxLength(10)]],
        complemento: ['', [Validators.maxLength(50)]],
        bairro: ['', [Validators.required, Validators.maxLength(100)]],
        cidade: ['', [Validators.required, Validators.maxLength(100)]],
        estado: ['', [Validators.required, Validators.pattern(/^[A-Z]{2}$/)]]
      })
    });

    // Validação de CPF síncrona
    this.form.get('cpf')?.addValidators(this.cpfValidator.bind(this));

    // Validação de CNS síncrona quando preenchido
    this.form.get('cns')?.valueChanges.subscribe(value => {
      if (value && value.trim() !== '') {
        this.form.get('cns')?.addValidators(this.cnsValidator.bind(this));
      } else {
        this.form.get('cns')?.clearValidators();
        this.form.get('cns')?.clearAsyncValidators();
      }
      this.form.get('cns')?.updateValueAndValidity({ emitEvent: false });
    });
  }

  private carregarPaciente(id: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.pacienteService.buscarPorId(id).subscribe({
      next: (paciente) => {
        if (paciente) {
          // Formata data para o formato do input (YYYY-MM-DD)
          const dataFormatada = paciente.dataNascimento instanceof Date 
            ? paciente.dataNascimento.toISOString().split('T')[0]
            : new Date(paciente.dataNascimento).toISOString().split('T')[0];

          this.form.patchValue({
            nome: paciente.nome,
            cpf: paciente.cpf,
            cns: paciente.cns || '',
            sexo: paciente.sexo,
            dataNascimento: dataFormatada,
            telefone: paciente.telefone,
            email: paciente.email || '',
            endereco: {
              cep: paciente.endereco.cep,
              logradouro: paciente.endereco.logradouro,
              numero: paciente.endereco.numero,
              complemento: paciente.endereco.complemento || '',
              bairro: paciente.endereco.bairro,
              cidade: paciente.endereco.cidade,
              estado: paciente.endereco.estado
            }
          });
        } else {
          this.errorMessage = 'Paciente não encontrado.';
          setTimeout(() => {
            this.router.navigate(['/bioquimico/pacientes']);
          }, 2000);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar paciente:', error);
        this.errorMessage = 'Erro ao carregar paciente. Por favor, tente novamente.';
        this.isLoading = false;
      }
    });
  }

  // Validador síncrono de CPF
  private cpfValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const cpf = control.value.replace(/\D/g, '');
    if (!this.pacienteService.validarCpf(cpf)) {
      return { cpfInvalido: true };
    }
    return null;
  }

  // Validador assíncrono de CPF único
  private cpfUnicoValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    if (!control.value) return of(null);

    const cpf = control.value.replace(/\D/g, '');
    if (!this.pacienteService.validarCpf(cpf)) {
      return of(null); // Já validado pelo validador síncrono
    }

    return of(control.value).pipe(
      debounceTime(500),
      switchMap(() => this.pacienteService.cpfExiste(cpf, this.pacienteId)),
      map(existe => existe ? { cpfJaExiste: true } : null),
      catchError(() => of(null))
    );
  }

  // Validador síncrono de CNS
  private cnsValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value || control.value.trim() === '') return null;
    
    const cns = control.value.replace(/\D/g, '');
    if (!this.pacienteService.validarCns(cns)) {
      return { cnsInvalido: true };
    }
    return null;
  }

  // Validador assíncrono de CNS único
  private cnsUnicoValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    if (!control.value || control.value.trim() === '') return of(null);

    const cns = control.value.replace(/\D/g, '');
    if (!this.pacienteService.validarCns(cns)) {
      return of(null); // Já validado pelo validador síncrono
    }

    return of(control.value).pipe(
      debounceTime(500),
      switchMap(() => this.pacienteService.cnsExiste(cns, this.pacienteId)),
      map(existe => existe ? { cnsJaExiste: true } : null),
      catchError(() => of(null))
    );
  }

  // Validador de idade mínima
  private idadeMinimaValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const dataNascimento = new Date(control.value);
    const hoje = new Date();
    const idade = hoje.getFullYear() - dataNascimento.getFullYear();
    const mesAtual = hoje.getMonth();
    const mesNascimento = dataNascimento.getMonth();

    if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < dataNascimento.getDate())) {
      return idade - 1 < 0 ? { idadeMinima: true } : null;
    }

    return idade < 0 ? { idadeMinima: true } : null;
  }

  // Aplicar máscara de CPF no input
  onCpfInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 11) {
      value = value.substring(0, 11);
    }

    this.form.patchValue({ cpf: value }, { emitEvent: false });
  }

  // Aplicar máscara de CNS no input
  onCnsInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 15) {
      value = value.substring(0, 15);
    }

    this.form.patchValue({ cns: value }, { emitEvent: false });
  }

  // Aplicar máscara de telefone no input
  onTelefoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 11) {
      value = value.substring(0, 11);
    }

    this.form.patchValue({ telefone: value }, { emitEvent: false });
  }

  // Aplicar máscara de CEP no input
  onCepInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 8) {
      value = value.substring(0, 8);
    }

    this.form.patchValue({ 
      endereco: { 
        ...this.form.value.endereco, 
        cep: value 
      } 
    }, { emitEvent: false });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.markFormGroupTouched(this.form);
      this.errorMessage = 'Por favor, corrija os erros no formulário.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const formValue = this.form.value;
      
      // Converte data de nascimento para Date
      const dataNascimento = new Date(formValue.dataNascimento);

      const paciente: Partial<Omit<Usuario, 'uid' | 'criadoEm' | 'atualizadoEm'>> & {
        nome: string;
        cpf: string;
        sexo: 'M' | 'F';
        dataNascimento: Date;
        telefone: string;
        endereco: any;
        perfil: string;
        primeiroAcesso: boolean;
        ativo: boolean;
      } = {
        nome: formValue.nome.trim(),
        cpf: formValue.cpf.replace(/\D/g, ''),
        sexo: formValue.sexo,
        dataNascimento,
        telefone: formValue.telefone.replace(/\D/g, ''),
        endereco: {
          cep: formValue.endereco.cep.replace(/\D/g, ''),
          logradouro: formValue.endereco.logradouro.trim(),
          numero: formValue.endereco.numero.trim(),
          bairro: formValue.endereco.bairro.trim(),
          cidade: formValue.endereco.cidade.trim(),
          estado: formValue.endereco.estado.toUpperCase()
        },
        perfil: 'paciente',
        primeiroAcesso: true,
        ativo: true
      };

      // Adiciona CNS apenas se preenchido
      if (formValue.cns) {
        paciente.cns = formValue.cns.replace(/\D/g, '');
      }

      // Adiciona email apenas se preenchido
      if (formValue.email) {
        paciente.email = formValue.email.trim();
      }

      // Adiciona complemento apenas se preenchido
      if (formValue.endereco.complemento) {
        paciente.endereco.complemento = formValue.endereco.complemento.trim();
      }

      if (this.isEditMode && this.pacienteId) {
        await this.pacienteService.atualizarPaciente(this.pacienteId, paciente).toPromise();
        this.successMessage = 'Paciente atualizado com sucesso!';
      } else {
        await this.pacienteService.criarPaciente(paciente).toPromise();
        this.successMessage = `Paciente cadastrado com sucesso! Senha padrão: ${this.pacienteService.gerarSenhaPadrao(dataNascimento)}`;
      }

      setTimeout(() => {
        this.router.navigate(['/bioquimico/pacientes']);
      }, 2000);

    } catch (error: any) {
      console.error('Erro ao salvar paciente:', error);
      this.errorMessage = 'Erro ao salvar paciente. Por favor, tente novamente.';
    } finally {
      this.isLoading = false;
    }
  }

  onCancel(): void {
    this.router.navigate(['/bioquimico/pacientes']);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Helper para exibir erros
  getErrorMessage(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (!control || !control.touched || !control.errors) return '';

    const errors = control.errors;

    if (errors['required']) return 'Campo obrigatório';
    if (errors['minlength']) return `Mínimo de ${errors['minlength'].requiredLength} caracteres`;
    if (errors['maxlength']) return `Máximo de ${errors['maxlength'].requiredLength} caracteres`;
    if (errors['email']) return 'Email inválido';
    if (errors['pattern']) return 'Formato inválido';
    if (errors['cpfInvalido']) return 'CPF inválido';
    if (errors['cpfJaExiste']) return 'CPF já cadastrado';
    if (errors['cnsInvalido']) return 'CNS inválido';
    if (errors['cnsJaExiste']) return 'CNS já cadastrado';
    if (errors['idadeMinima']) return 'Data de nascimento inválida';

    return 'Campo inválido';
  }
}
