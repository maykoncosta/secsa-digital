import { Injectable } from '@angular/core';
import { FirestoreService } from '../../core/services/firestore.service';
import { ExameRealizado } from '../interfaces/exame.interface';
import { Observable } from 'rxjs';
import { where, Timestamp, orderBy, limit, startAfter, endBefore, QueryConstraint } from '@angular/fire/firestore';
import { PaginatedResult } from '../../shared/interfaces/paginated-result.interface';

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
   * Busca exames com paginação e filtros
   */
  async getPaginated(
    page: number,
    pageSize: number,
    filters: {
      pacienteId?: string;
      schemaId?: string;
      status?: 'pendente' | 'finalizado' | 'liberado';
      dataColetaInicio?: Date;
      dataColetaFim?: Date;
    } = {},
    lastDoc?: any,
    firstDoc?: any,
    direction?: 'next' | 'prev'
  ): Promise<PaginatedResult<ExameRealizado>> {

    try {
      const constraints: QueryConstraint[] = [];

      // Aplicar filtros
      if (filters.pacienteId) {
        constraints.push(where('pacienteId', '==', filters.pacienteId));
      }
      if (filters.schemaId) {
        constraints.push(where('schemaId', '==', filters.schemaId));
      }
      if (filters.status) {
        constraints.push(where('status', '==', filters.status));
      }
      if (filters.dataColetaInicio) {
        constraints.push(where('dataColeta', '>=', Timestamp.fromDate(filters.dataColetaInicio)));
      }
      if (filters.dataColetaFim) {
        const dataFim = new Date(filters.dataColetaFim);
        dataFim.setHours(23, 59, 59, 999); // Fim do dia
        constraints.push(where('dataColeta', '<=', Timestamp.fromDate(dataFim)));
      }

      // Cursor pagination
      if (direction === 'next' && lastDoc) {
        constraints.push(startAfter(lastDoc));
      } if (direction === 'prev' && firstDoc) {
        constraints.push(endBefore(firstDoc));
      }

      // Limit - buscar mais para ordenar no cliente
      constraints.push(limit(pageSize * 10)); // Busca 10x mais para ordenar


      const snapshot = await this.firestoreService.getCollectionSnapshotWithDocs(
        this.COLLECTION,
        ...constraints
      );

      // Ordenar no cliente e garantir que uid está presente
      let allItems = snapshot.data.map(item => {
        const itemAny = item as any;
        return {
          ...item,
          uid: itemAny['uid'] || itemAny['id'] // Garante que uid está definido
        } as ExameRealizado;
      });
      
      allItems.sort((a, b) => {
        const dateA = a.dataCadastro?.toMillis() || 0;
        const dateB = b.dataCadastro?.toMillis() || 0;
        return dateB - dateA; // desc
      });

      // Aplicar paginação no cliente
      const startIndex = 0;
      const endIndex = pageSize;
      const items = allItems.slice(startIndex, endIndex);

      // Para calcular o total, precisamos fazer uma query separada com os mesmos filtros
      const countConstraints: QueryConstraint[] = [];
      if (filters.pacienteId) {
        countConstraints.push(where('pacienteId', '==', filters.pacienteId));
      }
      if (filters.schemaId) {
        countConstraints.push(where('schemaId', '==', filters.schemaId));
      }
      if (filters.status) {
        countConstraints.push(where('status', '==', filters.status));
      }
      if (filters.dataColetaInicio) {
        countConstraints.push(where('dataColeta', '>=', Timestamp.fromDate(filters.dataColetaInicio)));
      }
      if (filters.dataColetaFim) {
        const dataFim = new Date(filters.dataColetaFim);
        dataFim.setHours(23, 59, 59, 999);
        countConstraints.push(where('dataColeta', '<=', Timestamp.fromDate(dataFim)));
      }

      const countSnapshot = await this.firestoreService.getCollectionSnapshotWithDocs(
        this.COLLECTION,
        ...countConstraints
      );

      const total = countSnapshot.docs.length;
      const totalPages = Math.ceil(total / pageSize);

      const result = {
        items,
        total,
        page,
        pageSize,
        totalPages,
        lastDoc: snapshot.docs[snapshot.docs.length - 1],
        firstDoc: snapshot.docs[0]
      };

      return result;
    } catch (error) {
      throw error;
    }
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

  /**
   * Busca todos os exames (para dashboard/estatísticas)
   */
  async getAllExames(): Promise<ExameRealizado[]> {
    const snapshot = await this.firestoreService.getCollectionSnapshot<ExameRealizado>(this.COLLECTION);
    return snapshot;
  }
}
