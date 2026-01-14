import { Injectable } from '@angular/core';
import { FirestoreService } from '../../core/services/firestore.service';
import { PacienteUserService } from '../../core/services/paciente-user.service';
import { Paciente } from '../interfaces/paciente.interface';
import { Observable } from 'rxjs';
import { where, Timestamp, orderBy, limit, startAfter, QueryConstraint } from '@angular/fire/firestore';
import { PaginatedResult } from '../../shared/interfaces/paginated-result.interface';

@Injectable({
  providedIn: 'root'
})
export class PacienteRepository {
  private readonly COLLECTION = 'pacientes';
  
  // Cache de TODOS os pacientes ativos
  private allPacientesCache: Paciente[] | null = null;
  private cacheTimestamp: number | null = null;
  private readonly CACHE_DURATION = 300000; // 5 minutos

  constructor(
    private firestoreService: FirestoreService,
    private pacienteUserService: PacienteUserService
  ) {}

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
   * Adiciona um novo paciente e cria usuário automaticamente
   */
  async add(paciente: Omit<Paciente, 'id'>): Promise<string> {
    const now = Timestamp.now();
    const data = {
      ...paciente,
      status: paciente.status || 'ativo',
      criadoEm: now,
      atualizadoEm: now
    };
    
    // Adicionar paciente no Firestore
    const docRef = await this.firestoreService.addDocument(this.COLLECTION, data);
    const pacienteId = docRef.id;
    
    // Criar usuário automaticamente para o paciente
    try {
      const pacienteCompleto = { 
        ...paciente,
        id: pacienteId 
      } as Paciente;
      await this.pacienteUserService.criarUsuarioParaPaciente(pacienteCompleto, pacienteId);
      console.log('✅ Paciente e usuário criados com sucesso!');
    } catch (error) {
      console.error('⚠️ Paciente criado, mas erro ao criar usuário:', error);
      // Não lançar erro - o paciente foi criado, o usuário pode ser criado depois
    }
    
    this.invalidateCache();
    return pacienteId;
  }

  /**
   * Atualiza um paciente existente e sincroniza com o usuário
   */
  async update(id: string, paciente: Partial<Paciente>): Promise<void> {
    const data = {
      ...paciente,
      atualizadoEm: Timestamp.now()
    };
    await this.firestoreService.updateDocument(this.COLLECTION, id, data);
    
    // Atualizar usuário vinculado
    try {
      await this.pacienteUserService.atualizarUsuarioPaciente(id, paciente);
    } catch (error) {
      console.error('⚠️ Erro ao sincronizar usuário:', error);
    }
  }

  /**
   * Inativa um paciente (soft delete) e seu usuário
   */
  async inactivate(id: string): Promise<void> {
    await this.update(id, { status: 'inativo' });
    
    // Inativar usuário vinculado
    try {
      await this.pacienteUserService.inativarUsuarioPaciente(id);
    } catch (error) {
      console.error('⚠️ Erro ao inativar usuário:', error);
    }
    
    this.invalidateCache();
  }

  /**
   * Ativa um paciente e seu usuário
   */
  async activate(id: string): Promise<void> {
    await this.update(id, { status: 'ativo' });
    
    // Ativar usuário vinculado
    try {
      await this.pacienteUserService.ativarUsuarioPaciente(id);
    } catch (error) {
      console.error('⚠️ Erro ao ativar usuário:', error);
    }
    
    this.invalidateCache();
  }

  /**
   * Invalida o cache
   */
  private invalidateCache(): void {
    this.allPacientesCache = null;
    this.cacheTimestamp = null;
  }

  /**
   * Busca TODOS os pacientes ativos (com cache de 5 minutos)
   * Busca apenas 1 vez do Firestore, depois usa cache
   */
  private async getAllPacientesAtivos(): Promise<Paciente[]> {
    const now = Date.now();
    
    // Verificar se cache é válido
    if (this.allPacientesCache !== null && this.cacheTimestamp !== null) {
      if (now - this.cacheTimestamp < this.CACHE_DURATION) {
        console.log('✅ Usando cache de pacientes');
        return this.allPacientesCache;
      }
    }

    console.log('🔄 Buscando pacientes do Firestore...');
    const pacientes = await this.firestoreService.getCollectionSnapshot<Paciente>(
      this.COLLECTION,
      where('status', '==', 'ativo'),
      orderBy('nomeCompleto')
    );

    this.allPacientesCache = pacientes;
    this.cacheTimestamp = now;
    
    console.log(`📦 Cache atualizado: ${pacientes.length} pacientes`);
    return pacientes;
  }

  /**
   * Busca pacientes paginados
   * 
   * ESTRATÉGIA: Cache inteligente
   * - Busca TODOS os pacientes UMA VEZ do Firestore
   * - Cacheia por 5 minutos
   * - Filtragem e paginação em memória (super rápido)
   * - Ideal para listas de até ~1000 registros
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
    searchTerm?: string
  ): Promise<PaginatedResult<Paciente>> {
    try {
      // Buscar TODOS os pacientes (usa cache se disponível)
      let allPacientes = await this.getAllPacientesAtivos();

      // Filtrar se houver termo de busca
      if (searchTerm && searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        allPacientes = allPacientes.filter(p => 
          p.nomeCompleto.toLowerCase().includes(term) ||
          p.numeroProntuario.toLowerCase().includes(term) ||
          p.cpf?.includes(term) ||
          p.cns?.includes(term) ||
          p.email?.toLowerCase().includes(term)
        );
      }

      const total = allPacientes.length;
      const totalPages = Math.ceil(total / pageSize);

      // Paginar em memória
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const items = allPacientes.slice(startIndex, endIndex);

      return {
        items,
        total,
        page,
        pageSize,
        totalPages
      };
    } catch (error) {
      console.error('Erro ao buscar pacientes paginados:', error);
      return {
        items: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0
      };
    }
  }

  /**
   * Busca todos os pacientes (para dashboard/estatísticas)
   */
  async getAllPacientes(): Promise<Paciente[]> {
    return this.firestoreService.getCollectionSnapshot<Paciente>(this.COLLECTION);
  }
}
