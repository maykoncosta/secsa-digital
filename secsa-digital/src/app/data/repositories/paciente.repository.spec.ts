import { TestBed } from '@angular/core/testing';
import { PacienteRepository } from './paciente.repository';
import { FirestoreService } from '../../core/services/firestore.service';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { of } from 'rxjs';

describe('PacienteRepository', () => {
  let repository: PacienteRepository;
  let firestoreServiceMock: any;

  beforeEach(() => {
    firestoreServiceMock = {
      getCollectionWithQuery: vi.fn().mockReturnValue(of([])),
      getDocument: vi.fn().mockReturnValue(of(undefined)),
      addDocument: vi.fn().mockResolvedValue({ id: 'new-id' }),
      updateDocument: vi.fn().mockResolvedValue(undefined),
      deleteDocument: vi.fn().mockResolvedValue(undefined)
    };

    repository = new PacienteRepository(firestoreServiceMock);
  });

  it('deve ser criado', () => {
    expect(repository).toBeTruthy();
  });

  describe('getAll', () => {
    it('deve retornar observable de pacientes', () => {
      const result = repository.getAll();
      expect(result).toBeDefined();
      result.subscribe(pacientes => {
        expect(Array.isArray(pacientes)).toBe(true);
      });
    });
  });

  describe('add', () => {
    it('deve ter método add', () => {
      expect(repository.add).toBeDefined();
      expect(typeof repository.add).toBe('function');
    });
  });

  describe('update', () => {
    it('deve ter método update', () => {
      expect(repository.update).toBeDefined();
      expect(typeof repository.update).toBe('function');
    });
  });

  describe('inactivate', () => {
    it('deve inativar um paciente', async () => {
      vi.spyOn(repository, 'update').mockResolvedValue(undefined);
      
      await repository.inactivate('1');
      
      expect(repository.update).toHaveBeenCalledWith('1', { status: 'inativo' });
    });
  });

  describe('activate', () => {
    it('deve ativar um paciente', async () => {
      vi.spyOn(repository, 'update').mockResolvedValue(undefined);
      
      await repository.activate('1');
      
      expect(repository.update).toHaveBeenCalledWith('1', { status: 'ativo' });
    });
  });
});
