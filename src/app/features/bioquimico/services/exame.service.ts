import { Injectable, inject } from '@angular/core';
import { Observable, map, switchMap, combineLatest } from 'rxjs';
import { FirestoreService, QueryOptions } from '../../../core/services/firestore.service';
import { Exame, StatusExame } from '../../../core/models';
import { format } from 'date-fns';

@Injectable({
  providedIn: 'root'
})
export class ExameService {
  private firestoreService = inject(FirestoreService);
  private readonly COLLECTION = 'exames';

  /**
   * Gerar código de exame temporário (formato: EX-AAAAMMDD-NNNN)
   * Em produção, será gerado via Cloud Function
   */
  private gerarCodigoExame(): string {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = (hoje.getMonth() + 1).toString().padStart(2, '0');
    const dia = hoje.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    
    return `EX-${ano}${mes}${dia}-${random}`;
  }

  /**
   * Criar exame
   */
  criarExame(exame: Omit<Exame, 'id' | 'codigo' | 'criadoEm' | 'atualizadoEm'>): Observable<string> {
    const agora = new Date();
    const novoExame: Partial<Exame> = {
      ...exame,
      codigo: this.gerarCodigoExame(),
      status: 'pendente',
      criadoEm: agora,
      atualizadoEm: agora
    };

    return this.firestoreService.create<Exame>(this.COLLECTION, novoExame);
  }

  /**
   * Buscar exame por ID
   */
  buscarPorId(id: string): Observable<Exame | null> {
    return this.firestoreService.getById<Exame>(this.COLLECTION, id);
  }

  /**
   * Buscar exame por código
   */
  buscarPorCodigo(codigo: string): Observable<Exame | null> {
    const queryOptions: QueryOptions[] = [
      { field: 'codigo', operator: '==', value: codigo }
    ];

    return this.firestoreService.query<Exame>(this.COLLECTION, queryOptions, undefined, 1).pipe(
      map(exames => exames.length > 0 ? exames[0] : null)
    );
  }

  /**
   * Buscar exames por paciente
   */
  buscarPorPaciente(pacienteId: string): Observable<Exame[]> {
    const queryOptions: QueryOptions[] = [
      { field: 'pacienteId', operator: '==', value: pacienteId }
    ];

    return this.firestoreService.query<Exame>(
      this.COLLECTION,
      queryOptions,
      { field: 'dataColeta', direction: 'desc' }
    );
  }

  /**
   * Listar todos os exames
   */
  listarExames(status?: StatusExame): Observable<Exame[]> {
    const queryOptions: QueryOptions[] = [];

    if (status) {
      queryOptions.push({ field: 'status', operator: '==', value: status });
    }

    return this.firestoreService.query<Exame>(
      this.COLLECTION,
      queryOptions,
      { field: 'dataColeta', direction: 'desc' }
    );
  }

  /**
   * Filtrar exames por múltiplos critérios
   */
  filtrarExames(filtros: {
    pacienteId?: string;
    tipoExame?: 'hemograma' | 'urina' | 'fezes';
    status?: StatusExame;
    dataInicio?: Date;
    dataFim?: Date;
  }): Observable<Exame[]> {
    // Buscar todos e filtrar no cliente (limitação do Firestore para queries complexas)
    return this.listarExames().pipe(
      map(exames => {
        let resultado = [...exames];

        if (filtros.pacienteId) {
          resultado = resultado.filter(e => e.pacienteId === filtros.pacienteId);
        }

        if (filtros.tipoExame) {
          resultado = resultado.filter(e => e.tipoExame === filtros.tipoExame);
        }

        if (filtros.status) {
          resultado = resultado.filter(e => e.status === filtros.status);
        }

        if (filtros.dataInicio) {
          resultado = resultado.filter(e => 
            new Date(e.dataColeta) >= filtros.dataInicio!
          );
        }

        if (filtros.dataFim) {
          resultado = resultado.filter(e => 
            new Date(e.dataColeta) <= filtros.dataFim!
          );
        }

        return resultado;
      })
    );
  }

  /**
   * Atualizar exame
   */
  atualizarExame(id: string, dados: Partial<Exame>): Observable<void> {
    const dadosAtualizacao = {
      ...dados,
      atualizadoEm: new Date()
    };

    return this.firestoreService.update<Exame>(this.COLLECTION, id, dadosAtualizacao);
  }

  /**
   * Liberar exame (muda status para liberado)
   */
  liberarExame(id: string, bioquimicoId: string, bioquimicoNome: string, observacoes?: string): Observable<void> {
    const dados: Partial<Exame> = {
      status: 'liberado',
      dataLiberacao: new Date(),
      bioquimicoId,
      bioquimicoNome,
      observacoes,
      atualizadoPor: bioquimicoId,
      atualizadoEm: new Date()
    };

    return this.atualizarExame(id, dados);
  }

  /**
   * Cancelar exame
   */
  cancelarExame(id: string, usuarioId: string, motivo?: string): Observable<void> {
    const dados: Partial<Exame> = {
      status: 'cancelado',
      observacoes: motivo,
      atualizadoPor: usuarioId,
      atualizadoEm: new Date()
    };

    return this.atualizarExame(id, dados);
  }

  /**
   * Verificar se há valores alterados nos parâmetros
   */
  verificarValoresAlterados(parametros: any[]): number {
    return parametros.filter(p => p.alterado === true).length;
  }

  /**
   * Estatísticas de exames
   */
  obterEstatisticas(): Observable<{
    total: number;
    pendentes: number;
    liberados: number;
    cancelados: number;
  }> {
    return combineLatest([
      this.listarExames(),
      this.listarExames('pendente'),
      this.listarExames('liberado'),
      this.listarExames('cancelado')
    ]).pipe(
      map(([todos, pendentes, liberados, cancelados]) => ({
        total: todos.length,
        pendentes: pendentes.length,
        liberados: liberados.length,
        cancelados: cancelados.length
      }))
    );
  }

  /**
   * Formatar data para exibição
   */
  formatarData(data: Date | string): string {
    return format(new Date(data), 'dd/MM/yyyy');
  }

  /**
   * Formatar data e hora para exibição
   */
  formatarDataHora(data: Date | string): string {
    return format(new Date(data), 'dd/MM/yyyy HH:mm');
  }

  /**
   * Calcular dias desde a coleta
   */
  diasDesdeColeta(dataColeta: Date | string): number {
    const hoje = new Date();
    const coleta = new Date(dataColeta);
    const diffTime = Math.abs(hoje.getTime() - coleta.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
