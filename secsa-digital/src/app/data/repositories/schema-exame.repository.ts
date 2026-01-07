import { Injectable } from '@angular/core';
import { FirestoreService } from '../../core/services/firestore.service';
import { SchemaExame } from '../interfaces/exame.interface';
import { Observable } from 'rxjs';
import { where, Timestamp, orderBy } from '@angular/fire/firestore';
import { PaginatedResult } from '../../shared/interfaces/paginated-result.interface';

@Injectable({
  providedIn: 'root'
})
export class SchemaExameRepository {
  private readonly COLLECTION = 'schemas-exames';

  // Cache de TODOS os schemas ativos
  private allSchemasCache: SchemaExame[] | null = null;
  private cacheTimestamp: number | null = null;
  private readonly CACHE_DURATION = 300000; // 5 minutos

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
    this.invalidateCache();
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
    this.invalidateCache();
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
    this.invalidateCache();
  }

  /**
   * Invalida o cache
   */
  private invalidateCache(): void {
    this.allSchemasCache = null;
    this.cacheTimestamp = null;
  }

  /**
   * Busca TODOS os schemas ativos (com cache de 5 minutos)
   * Busca apenas 1 vez do Firestore, depois usa cache
   */
  private async getAllSchemasAtivos(): Promise<SchemaExame[]> {
    const now = Date.now();
    
    // Verificar se cache é válido
    if (this.allSchemasCache !== null && this.cacheTimestamp !== null) {
      if (now - this.cacheTimestamp < this.CACHE_DURATION) {
        console.log('✅ Usando cache de schemas');
        return this.allSchemasCache;
      }
    }

    console.log('🔄 Buscando schemas do Firestore...');
    const schemas = await this.firestoreService.getCollectionSnapshot<SchemaExame>(
      this.COLLECTION,
      where('ativo', '==', true),
      orderBy('nome')
    );

    this.allSchemasCache = schemas;
    this.cacheTimestamp = now;
    
    console.log(`📦 Cache atualizado: ${schemas.length} schemas`);
    return schemas;
  }

  /**
   * Busca schemas paginados
   * 
   * ESTRATÉGIA: Cache inteligente
   * - Busca TODOS os schemas UMA VEZ do Firestore
   * - Cacheia por 5 minutos
   * - Filtragem e paginação em memória (super rápido)
   * 
   * Vantagens:
   * ✅ 1 query no Firestore (economia de reads)
   * ✅ Filtro instantâneo (sem delay)
   * ✅ Navegação entre páginas instantânea
   * ✅ Busca funciona perfeitamente
   * 
   * Cache invalidado automaticamente ao adicionar/editar/deletar
   */
  async getPaginated(
    page: number = 1,
    pageSize: number = 10,
    searchTerm?: string,
    categoria?: string
  ): Promise<PaginatedResult<SchemaExame>> {
    try {
      // Buscar TODOS os schemas (usa cache se disponível)
      let allSchemas = await this.getAllSchemasAtivos();

      // Filtrar por categoria se fornecida
      if (categoria) {
        allSchemas = allSchemas.filter(s => s.categoria === categoria);
      }

      // Filtrar se houver termo de busca
      if (searchTerm && searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        allSchemas = allSchemas.filter(s => 
          s.nome.toLowerCase().includes(term) ||
          s.categoria.toLowerCase().includes(term) ||
          s.observacoes?.toLowerCase().includes(term)
        );
      }

      const total = allSchemas.length;
      const totalPages = Math.ceil(total / pageSize);

      // Paginar em memória
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const items = allSchemas.slice(startIndex, endIndex);

      return {
        items,
        total,
        page,
        pageSize,
        totalPages
      };
    } catch (error) {
      console.error('Erro ao buscar schemas paginados:', error);
      return {
        items: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0
      };
    }
  }
}
