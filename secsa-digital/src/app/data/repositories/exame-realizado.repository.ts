import { Injectable } from '@angular/core';
import { FirestoreService } from '../../core/services/firestore.service';
import { ExameRealizado } from '../interfaces/exame.interface';
import { Observable } from 'rxjs';
import { where, Timestamp, orderBy } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ExameRealizadoRepository {
  private readonly COLLECTION = 'exames-realizados';

  constructor(private firestoreService: FirestoreService) {}

  /**
   * Busca todos os exames realizados
   */
  getAll(): Observable<ExameRealizado[]> {
    return this.firestoreService.getCollectionWithQuery<ExameRealizado>(
      this.COLLECTION,
      orderBy('dataCadastro', 'desc')
    );
  }

  /**
   * Busca exame por ID
   */
  getById(id: string): Observable<ExameRealizado | undefined> {
    return this.firestoreService.getDocument<ExameRealizado>(this.COLLECTION, id);
  }

  /**
   * Busca exames por paciente
   */
  getByPaciente(pacienteId: string): Observable<ExameRealizado[]> {
    return this.firestoreService.getCollectionWithQuery<ExameRealizado>(
      this.COLLECTION,
      where('pacienteId', '==', pacienteId),
      orderBy('dataColeta', 'desc')
    );
  }

  /**
   * Busca exames por status
   */
  getByStatus(status: 'pendente' | 'finalizado' | 'liberado'): Observable<ExameRealizado[]> {
    return this.firestoreService.getCollectionWithQuery<ExameRealizado>(
      this.COLLECTION,
      where('status', '==', status),
      orderBy('dataCadastro', 'desc')
    );
  }

  /**
   * Busca exames por schema
   */
  getBySchema(schemaId: string): Observable<ExameRealizado[]> {
    return this.firestoreService.getCollectionWithQuery<ExameRealizado>(
      this.COLLECTION,
      where('schemaId', '==', schemaId),
      orderBy('dataColeta', 'desc')
    );
  }

  /**
   * Busca exames pendentes de um schema específico (para validar inativação)
   */
  getPendentesBySchema(schemaId: string): Observable<ExameRealizado[]> {
    return this.firestoreService.getCollectionWithQuery<ExameRealizado>(
      this.COLLECTION,
      where('schemaId', '==', schemaId),
      where('status', '==', 'pendente')
    );
  }

  /**
   * Adiciona um novo exame realizado
   */
  async add(exame: Omit<ExameRealizado, 'uid' | 'dataCadastro'>): Promise<void> {
    const data = {
      ...exame,
      dataCadastro: Timestamp.now()
    };
    await this.firestoreService.addDocument(this.COLLECTION, data);
  }

  /**
   * Atualiza um exame existente
   */
  async update(id: string, exame: Partial<ExameRealizado>): Promise<void> {
    await this.firestoreService.updateDocument(this.COLLECTION, id, exame);
  }

  /**
   * Atualiza status do exame
   */
  async updateStatus(
    id: string, 
    status: 'pendente' | 'finalizado' | 'liberado',
    responsavelId: string
  ): Promise<void> {
    const updateData: Partial<ExameRealizado> = { status };

    if (status === 'finalizado') {
      updateData.dataFinalizacao = Timestamp.now();
      updateData.finalizadoPor = responsavelId;
    } else if (status === 'liberado') {
      updateData.dataLiberacao = Timestamp.now();
      updateData.liberadoPor = responsavelId;
    }

    await this.update(id, updateData);
  }

  /**
   * Adiciona entrada no histórico de edições
   */
  async addHistoricoEdicao(
    id: string,
    usuario: string,
    campoAlterado: string,
    valorAnterior: any,
    valorNovo: any
  ): Promise<void> {
    // Buscar exame atual através do Observable
    return new Promise((resolve, reject) => {
      this.firestoreService.getDocument<ExameRealizado>(
        this.COLLECTION,
        id
      ).subscribe({
        next: async (exame) => {
          if (!exame) {
            reject(new Error('Exame não encontrado'));
            return;
          }

          const novaEntrada = {
            usuario,
            dataHora: Timestamp.now(),
            campoAlterado,
            valorAnterior,
            valorNovo
          };

          const historicoAtualizado = [
            ...(exame.historicoEdicoes || []),
            novaEntrada
          ];

          try {
            await this.update(id, { historicoEdicoes: historicoAtualizado });
            resolve();
          } catch (error) {
            reject(error);
          }
        },
        error: reject
      });
    });
  }

  /**
   * Remove um exame permanentemente
   * ATENÇÃO: Deve ser usado com cuidado
   */
  async delete(id: string): Promise<void> {
    await this.firestoreService.deleteDocument(this.COLLECTION, id);
  }
}
