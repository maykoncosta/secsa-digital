import { Injectable } from '@angular/core';
import { FirestoreService } from '../../core/services/firestore.service';
import { SchemaExame } from '../interfaces/exame.interface';
import { Observable } from 'rxjs';
import { where, Timestamp } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class SchemaExameRepository {
  private readonly COLLECTION = 'schemas-exames';

  constructor(private firestoreService: FirestoreService) {}

  /**
   * Busca todos os schemas ativos
   */
  getAllAtivos(): Observable<SchemaExame[]> {
    return this.firestoreService.getCollectionWithQuery<SchemaExame>(
      this.COLLECTION,
      where('ativo', '==', true)
    );
  }

  /**
   * Busca todos os schemas (ativos e inativos)
   */
  getAll(): Observable<SchemaExame[]> {
    return this.firestoreService.getCollection<SchemaExame>(this.COLLECTION);
  }

  /**
   * Busca schema por ID
   */
  getById(id: string): Observable<SchemaExame | undefined> {
    return this.firestoreService.getDocument<SchemaExame>(this.COLLECTION, id);
  }

  /**
   * Busca schemas por categoria
   */
  getByCategoria(categoria: string): Observable<SchemaExame[]> {
    return this.firestoreService.getCollectionWithQuery<SchemaExame>(
      this.COLLECTION,
      where('categoria', '==', categoria),
      where('ativo', '==', true)
    );
  }

  /**
   * Verifica se existe schema com o mesmo nome (para evitar duplicatas)
   */
  getByNome(nome: string): Observable<SchemaExame[]> {
    return this.firestoreService.getCollectionWithQuery<SchemaExame>(
      this.COLLECTION,
      where('nome', '==', nome),
      where('ativo', '==', true)
    );
  }

  /**
   * Adiciona um novo schema de exame
   */
  async add(schema: Omit<SchemaExame, 'id' | 'criadoEm' | 'atualizadoEm'>): Promise<void> {
    const now = Timestamp.now();
    const data = {
      ...schema,
      criadoEm: now,
      atualizadoEm: now
    };
    await this.firestoreService.addDocument(this.COLLECTION, data);
  }

  /**
   * Atualiza um schema existente
   */
  async update(id: string, schema: Partial<SchemaExame>): Promise<void> {
    const data = {
      ...schema,
      atualizadoEm: Timestamp.now()
    };
    await this.firestoreService.updateDocument(this.COLLECTION, id, data);
  }

  /**
   * Inativa um schema (soft delete)
   */
  async inactivate(id: string): Promise<void> {
    await this.update(id, { ativo: false });
  }

  /**
   * Ativa um schema
   */
  async activate(id: string): Promise<void> {
    await this.update(id, { ativo: true });
  }

  /**
   * Remove um schema permanentemente
   * ATENÇÃO: Deve ser usado apenas se não houver exames vinculados
   */
  async delete(id: string): Promise<void> {
    await this.firestoreService.deleteDocument(this.COLLECTION, id);
  }
}
