import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PacienteFormModalComponent } from './paciente-form-modal.component';
import { PacienteRepository } from '../../data/repositories/paciente.repository';
import { ToastService } from '../../core/services/toast.service';
import { Timestamp } from '@angular/fire/firestore';
import { vi } from 'vitest';

describe('PacienteFormModalComponent', () => {
  let component: PacienteFormModalComponent;
  let fixture: ComponentFixture<PacienteFormModalComponent>;
  let pacienteRepoSpy: any;
  let toastServiceSpy: any;

  beforeEach(async () => {
    const pacienteRepoSpyObj = {
      add: vi.fn(),
      update: vi.fn()
    };
    const toastServiceSpyObj = {
      success: vi.fn(),
      error: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [PacienteFormModalComponent],
      providers: [
        { provide: PacienteRepository, useValue: pacienteRepoSpyObj },
        { provide: ToastService, useValue: toastServiceSpyObj }
      ]
    }).compileComponents();

    pacienteRepoSpy = TestBed.inject(PacienteRepository);
    toastServiceSpy = TestBed.inject(ToastService);
    
    fixture = TestBed.createComponent(PacienteFormModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('paciente', null);
    component.ngOnInit();
  });

  it('deve ser criado', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('deve inicializar formulário vazio para novo paciente', () => {
      fixture.componentRef.setInput('paciente', null);
      
      component.ngOnInit();
      
      expect(component.form).toBeDefined();
      expect(component.isEditMode()).toBe(false);
    });
  });

  describe('onSubmit', () => {
    beforeEach(() => {
      component.form.patchValue({
        numeroProntuario: 'PAC-002',
        nomeCompleto: 'Maria Santos',
        dataNascimento: '1985-05-15',
        telefone: '11988888888',
        genero: 'F',
        status: 'ativo'
      });
    });

    it('deve criar novo paciente quando não está editando', async () => {
      fixture.componentRef.setInput('paciente', null);
      component.ngOnInit();
      
      // Preencher campos obrigatórios
      component.form.patchValue({
        numeroProntuario: 'PAC-002',
        nomeCompleto: 'Maria Santos',
        dataNascimento: '1985-05-15',
        cpf: '98765432100',
        telefone: '11988888888',
        genero: 'F',
        status: 'ativo'
      });
      
      pacienteRepoSpy.add.mockResolvedValue(undefined);
      
      await component.onSubmit();
      
      expect(pacienteRepoSpy.add).toHaveBeenCalled();
      expect(toastServiceSpy.success).toHaveBeenCalledWith('Paciente cadastrado com sucesso!');
    });

    it('não deve submeter se formulário inválido', async () => {
      fixture.componentRef.setInput('paciente', null);
      component.ngOnInit();
      component.form.patchValue({ nomeCompleto: '' });
      
      await component.onSubmit();
      
      expect(pacienteRepoSpy.add).not.toHaveBeenCalled();
      expect(pacienteRepoSpy.update).not.toHaveBeenCalled();
    });
  });
});
