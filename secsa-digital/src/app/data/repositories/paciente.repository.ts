import { Injectable } from '@angular/core';
import { FirestoreService } from '../../core/services/firestore.service';
import { Paciente } from '../interfaces/paciente.interface';
import { Observable } from 'rxjs';
import { where, Timestamp } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class PacienteRepository {
  private readonly COLLECTION = 'pacientes';

  constructor(private firestoreService: FirestoreService) {}

  /**
   * Busca todos os pacientes ativos
   */
  getAll(): Observable<Paciente[]> {
    return this.firestoreService.getCollectionWithQuery<Paciente>(
      this.COLLECTION,
      where('status', '==', 'ativo')
    );
  }

  /**
   * Busca paciente por ID
   */
  getById(id: string): Observable<Paciente | undefined> {
    return this.firestoreService.getDocument<Paciente>(this.COLLECTION, id);
  }

  /**
   * Busca paciente por CPF
   */
  getByCpf(cpf: string): Observable<Paciente[]> {
    return this.firestoreService.getCollectionWithQuery<Paciente>(
      this.COLLECTION,
      where('cpf', '==', cpf)
    );
  }

  /**
   * Busca paciente por CNS
   */
  getByCns(cns: string): Observable<Paciente[]> {
    return this.firestoreService.getCollectionWithQuery<Paciente>(
      this.COLLECTION,
      where('cns', '==', cns)
    );
  }

  /**
   * Adiciona um novo paciente
   */
  async add(paciente: Omit<Paciente, 'id'>): Promise<void> {
    const now = Timestamp.now();
    const data = {
      ...paciente,
      criadoEm: now,
      atualizadoEm: now
    };
    await this.firestoreService.addDocument(this.COLLECTION, data);
  }

  /**
   * Atualiza um paciente existente
   */
  async update(id: string, paciente: Partial<Paciente>): Promise<void> {
    const data = {
      ...paciente,
      atualizadoEm: Timestamp.now()
    };
    await this.firestoreService.updateDocument(this.COLLECTION, id, data);
  }

  /**
   * Inativa um paciente (soft delete)
   */
  async inactivate(id: string): Promise<void> {
    await this.update(id, { status: 'inativo' });
  }

  /**
   * Ativa um paciente
   */
  async activate(id: string): Promise<void> {
    await this.update(id, { status: 'ativo' });
  }
}
