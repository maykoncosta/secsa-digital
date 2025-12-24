import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PacientesListComponent } from './pacientes-list.component';
import { PacienteRepository } from '../../data/repositories/paciente.repository';
import { ToastService } from '../../core/services/toast.service';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Timestamp } from '@angular/fire/firestore';
import { Paciente } from '../../data/interfaces/paciente.interface';
import { vi } from 'vitest';

describe('PacientesListComponent', () => {
  let component: PacientesListComponent;
  let fixture: ComponentFixture<PacientesListComponent>;
  let pacienteRepoSpy: any;
  let toastServiceSpy: any;

  const mockPacientes: Paciente[] = [
    {
      id: '1',
      numeroProntuario: 'PAC-001',
      nomeCompleto: 'João Silva',
      dataNascimento: new Date('1990-01-01'),
      cpf: '12345678901',
      cns: '123456789012345',
      telefone: '11999999999',
      genero: 'M',
      status: 'ativo',
      criadoEm: Timestamp.now(),
      atualizadoEm: Timestamp.now()
    },
    {
      id: '2',
      numeroProntuario: 'PAC-002',
      nomeCompleto: 'Maria Santos',
      dataNascimento: new Date('1985-05-15'),
      cpf: '98765432100',
      telefone: '11988888888',
      genero: 'F',
      status: 'ativo',
      criadoEm: Timestamp.now(),
      atualizadoEm: Timestamp.now()
    }
  ];

  beforeEach(async () => {
    const pacienteRepoSpyObj = {
      getAll: vi.fn(),
      update: vi.fn(),
      inactivate: vi.fn(),
      activate: vi.fn()
    };
    const toastServiceSpyObj = {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn()
    };
    const activatedRouteMock = {
      snapshot: { params: {} },
      params: of({})
    };

    await TestBed.configureTestingModule({
      imports: [PacientesListComponent],
      providers: [
        { provide: PacienteRepository, useValue: pacienteRepoSpyObj },
        { provide: ToastService, useValue: toastServiceSpyObj },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();

    pacienteRepoSpy = TestBed.inject(PacienteRepository);
    toastServiceSpy = TestBed.inject(ToastService);
    
    fixture = TestBed.createComponent(PacientesListComponent);
    component = fixture.componentInstance;
  });

  it('deve ser criado', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('deve carregar pacientes ao inicializar', () => {
      pacienteRepoSpy.getAll.mockReturnValue(of(mockPacientes));
      
      component.ngOnInit();
      
      expect(pacienteRepoSpy.getAll).toHaveBeenCalled();
      expect(component.pacientes()).toEqual(mockPacientes);
      expect(component.filteredPacientes()).toEqual(mockPacientes);
      expect(component.loading()).toBe(false);
    });

    it('deve exibir erro ao falhar no carregamento', () => {
      const error = new Error('Erro ao carregar');
      pacienteRepoSpy.getAll.mockReturnValue(throwError(() => error));
      
      component.ngOnInit();
      
      expect(toastServiceSpy.error).toHaveBeenCalledWith('Erro ao carregar pacientes');
      expect(component.loading()).toBe(false);
    });
  });

  describe('onSearch', () => {
    beforeEach(() => {
      component.pacientes.set(mockPacientes);
      component.filteredPacientes.set(mockPacientes);
    });

    it('deve filtrar pacientes por nome', () => {
      component.searchTerm = 'joão';
      
      component.onSearch();
      
      expect(component.filteredPacientes().length).toBe(1);
      expect(component.filteredPacientes()[0].nomeCompleto).toBe('João Silva');
    });

    it('deve filtrar pacientes por CPF', () => {
      component.searchTerm = '123456789';
      
      component.onSearch();
      
      expect(component.filteredPacientes().length).toBe(1);
      expect(component.filteredPacientes()[0].cpf).toBe('12345678901');
    });

    it('deve filtrar pacientes por prontuário', () => {
      component.searchTerm = 'PAC-002';
      
      component.onSearch();
      
      expect(component.filteredPacientes().length).toBe(1);
      expect(component.filteredPacientes()[0].numeroProntuario).toBe('PAC-002');
    });

    it('deve mostrar todos os pacientes quando o termo de busca está vazio', () => {
      component.searchTerm = '';
      
      component.onSearch();
      
      expect(component.filteredPacientes()).toEqual(mockPacientes);
    });

    it('deve retornar array vazio quando nenhum paciente corresponder', () => {
      component.searchTerm = 'xyzabc123';
      
      component.onSearch();
      
      expect(component.filteredPacientes().length).toBe(0);
    });
  });

  describe('toggleStatus', () => {
    it('deve inativar um paciente ativo', async () => {
      const paciente = { ...mockPacientes[0], status: 'ativo' as const };
      pacienteRepoSpy.inactivate.mockResolvedValue(undefined);
      pacienteRepoSpy.getAll.mockReturnValue(of(mockPacientes));
      
      await component.toggleStatus(paciente);
      
      expect(pacienteRepoSpy.inactivate).toHaveBeenCalledWith(paciente.id);
      expect(toastServiceSpy.success).toHaveBeenCalledWith('Paciente inativado com sucesso');
    });

    it('deve ativar um paciente inativo', async () => {
      const paciente = { ...mockPacientes[0], status: 'inativo' as const };
      pacienteRepoSpy.activate.mockResolvedValue(undefined);
      pacienteRepoSpy.getAll.mockReturnValue(of(mockPacientes));
      
      await component.toggleStatus(paciente);
      
      expect(pacienteRepoSpy.activate).toHaveBeenCalledWith(paciente.id);
      expect(toastServiceSpy.success).toHaveBeenCalledWith('Paciente ativado com sucesso');
    });

    it('deve exibir erro ao falhar na mudança de status', async () => {
      const paciente = { ...mockPacientes[0] };
      const error = new Error('Erro ao atualizar');
      pacienteRepoSpy.inactivate.mockRejectedValue(error);
      
      await component.toggleStatus(paciente);
      
      expect(toastServiceSpy.error).toHaveBeenCalledWith('Erro ao alterar status do paciente');
    });
  });

  describe('openNewPacienteModal', () => {
    it('deve abrir modal para novo paciente', () => {
      component.openNewPacienteModal();
      
      expect(component.showModal()).toBe(true);
      expect(component.selectedPaciente()).toBeNull();
    });
  });

  describe('editPaciente', () => {
    it('deve abrir modal para editar paciente', () => {
      const paciente = mockPacientes[0];
      
      component.editPaciente(paciente);
      
      expect(component.showModal()).toBe(true);
      expect(component.selectedPaciente()).toEqual(paciente);
    });
  });

  describe('closeModal', () => {
    it('deve fechar modal e limpar seleção', () => {
      component.showModal.set(true);
      component.selectedPaciente.set(mockPacientes[0]);
      
      component.closeModal();
      
      expect(component.showModal()).toBe(false);
      expect(component.selectedPaciente()).toBeNull();
    });
  });

  describe('getStatusClass', () => {
    it('deve retornar classe para paciente ativo', () => {
      const result = component.getStatusClass('ativo');
      
      expect(result).toContain('bg-green-100');
      expect(result).toContain('text-green-700');
    });

    it('deve retornar classe para paciente inativo', () => {
      const result = component.getStatusClass('inativo');
      
      expect(result).toContain('bg-slate-100');
      expect(result).toContain('text-slate-700');
    });
  });
});
