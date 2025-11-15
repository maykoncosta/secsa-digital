import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  doc, 
  collectionData,
  docData,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  getDocs
} from '@angular/fire/firestore';
import { Observable, from, map, switchMap } from 'rxjs';
import { ExameRealizado, ParametroExameRealizado } from '../../../core/models';
import { format } from 'date-fns';

@Injectable({
  providedIn: 'root'
})
export class ExameRealizadoService {
  private firestore = inject(Firestore);
  private collectionName = 'examesRealizados';

  /**
   * Gera código único para exame realizado (formato: XXX-YYYYMMDD-NNNN)
   * XXX = código do tipo de exame (ex: HEM, URI, FEZ)
   */
  private async gerarCodigoExame(codigoTipoExame: string): Promise<string> {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = (hoje.getMonth() + 1).toString().padStart(2, '0');
    const dia = hoje.getDate().toString().padStart(2, '0');
    
    // Buscar último número do dia
    const inicioRef = collection(this.firestore, this.collectionName);
    const prefixo = `${codigoTipoExame}-${ano}${mes}${dia}`;
    const q = query(
      inicioRef,
      where('codigo', '>=', `${prefixo}-0000`),
      where('codigo', '<=', `${prefixo}-9999`),
      orderBy('codigo', 'desc')
    );
    
    const snapshot = await getDocs(q);
    
    let proximoNumero = 1;
    if (!snapshot.empty) {
      const ultimoCodigo = snapshot.docs[0].data()['codigo'] as string;
      const ultimoNumero = parseInt(ultimoCodigo.split('-')[2]);
      proximoNumero = ultimoNumero + 1;
    }
    
    const numero = proximoNumero.toString().padStart(4, '0');
    return `${prefixo}-${numero}`;
  }

  /**
   * Cria um novo exame realizado com seus parâmetros
   */
  async criarExameRealizado(
    dadosExame: Omit<ExameRealizado, 'uid' | 'codigo' | 'criadoEm' | 'atualizadoEm'>,
    parametros: Omit<ParametroExameRealizado, 'uid'>[]
  ): Promise<string> {
    const now = Timestamp.now();
    
    // Gerar código único
    const codigo = await this.gerarCodigoExame(dadosExame.exameNome.substring(0, 3).toUpperCase());
    
    // Criar o exame realizado
    const exameRef = await addDoc(collection(this.firestore, this.collectionName), {
      ...dadosExame,
      codigo,
      criadoEm: now,
      atualizadoEm: now
    });

    // Adicionar parâmetros na subcoleção
    const parametrosRef = collection(this.firestore, `${this.collectionName}/${exameRef.id}/parametros`);
    
    for (const parametro of parametros) {
      await addDoc(parametrosRef, parametro);
    }

    return exameRef.id;
  }

  /**
   * Busca um exame realizado por ID
   */
  buscarPorId(exameId: string): Observable<ExameRealizado | null> {
    const exameRef = doc(this.firestore, `${this.collectionName}/${exameId}`);
    return docData(exameRef, { idField: 'uid' }).pipe(
      map((exame: any) => {
        if (!exame) return null;
        return this.converterTimestamps(exame);
      })
    );
  }

  /**
   * Busca os parâmetros de um exame realizado
   */
  buscarParametros(exameId: string): Observable<ParametroExameRealizado[]> {
    const parametrosRef = collection(this.firestore, `${this.collectionName}/${exameId}/parametros`);
    return collectionData(parametrosRef, { idField: 'uid' }) as Observable<ParametroExameRealizado[]>;
  }

  /**
   * Busca exame completo com parâmetros
   */
  buscarExameCompleto(exameId: string): Observable<{ exame: ExameRealizado; parametros: ParametroExameRealizado[] } | null> {
    return this.buscarPorId(exameId).pipe(
      switchMap(exame => {
        if (!exame) return from([null]);
        
        return this.buscarParametros(exameId).pipe(
          map(parametros => ({ exame, parametros }))
        );
      })
    );
  }

  /**
   * Lista exames realizados por paciente
   */
  listarPorPaciente(pacienteId: string): Observable<ExameRealizado[]> {
    const examesRef = collection(this.firestore, this.collectionName);
    const q = query(
      examesRef,
      where('pacienteId', '==', pacienteId),
      orderBy('dataColeta', 'desc')
    );
    
    return collectionData(q, { idField: 'uid' }).pipe(
      map((exames: any[]) => exames.map(e => this.converterTimestamps(e)))
    );
  }

  /**
   * Lista exames realizados por tipo de exame
   */
  listarPorTipoExame(tipoExameId: string): Observable<ExameRealizado[]> {
    const examesRef = collection(this.firestore, this.collectionName);
    const q = query(
      examesRef,
      where('exameId', '==', tipoExameId),
      orderBy('dataColeta', 'desc')
    );
    
    return collectionData(q, { idField: 'uid' }).pipe(
      map((exames: any[]) => exames.map(e => this.converterTimestamps(e)))
    );
  }

  /**
   * Lista exames realizados por status
   */
  listarPorStatus(status: 'pendente' | 'finalizado' | 'liberado' | 'cancelado'): Observable<ExameRealizado[]> {
    const examesRef = collection(this.firestore, this.collectionName);
    const q = query(
      examesRef,
      where('status', '==', status),
      orderBy('dataColeta', 'desc')
    );
    
    return collectionData(q, { idField: 'uid' }).pipe(
      map((exames: any[]) => exames.map(e => this.converterTimestamps(e)))
    );
  }

  /**
   * Lista todos os exames realizados
   */
  listarTodos(): Observable<ExameRealizado[]> {
    const examesRef = collection(this.firestore, this.collectionName);
    const q = query(examesRef, orderBy('dataColeta', 'desc'));
    
    return collectionData(q, { idField: 'uid' }).pipe(
      map((exames: any[]) => exames.map(e => this.converterTimestamps(e)))
    );
  }

  /**
   * Atualiza um exame realizado
   */
  async atualizarExame(exameId: string, dados: Partial<ExameRealizado>): Promise<void> {
    const exameRef = doc(this.firestore, `${this.collectionName}/${exameId}`);
    await updateDoc(exameRef, {
      ...dados,
      atualizadoEm: Timestamp.now()
    });
  }

  /**
   * Atualiza o status de um exame
   */
  async atualizarStatus(
    exameId: string, 
    status: 'pendente' | 'finalizado' | 'liberado' | 'cancelado'
  ): Promise<void> {
    const updates: any = { status };
    
    if (status === 'liberado') {
      updates.dataLiberacao = Timestamp.now();
    } else if (status === 'finalizado') {
      updates.dataResultado = Timestamp.now();
    }
    
    await this.atualizarExame(exameId, updates);
  }

  /**
   * Atualiza um parâmetro específico
   */
  async atualizarParametro(
    exameId: string, 
    parametroId: string, 
    dados: Partial<ParametroExameRealizado>
  ): Promise<void> {
    const parametroRef = doc(
      this.firestore, 
      `${this.collectionName}/${exameId}/parametros/${parametroId}`
    );
    await updateDoc(parametroRef, dados);
  }

  /**
   * Adiciona observações ao exame
   */
  async adicionarObservacoes(exameId: string, observacoes: string): Promise<void> {
    await this.atualizarExame(exameId, { observacoes });
  }

  /**
   * Busca exames por período
   */
  listarPorPeriodo(dataInicio: Date, dataFim: Date): Observable<ExameRealizado[]> {
    const examesRef = collection(this.firestore, this.collectionName);
    const q = query(
      examesRef,
      where('dataColeta', '>=', Timestamp.fromDate(dataInicio)),
      where('dataColeta', '<=', Timestamp.fromDate(dataFim)),
      orderBy('dataColeta', 'desc')
    );
    
    return collectionData(q, { idField: 'uid' }).pipe(
      map((exames: any[]) => exames.map(e => this.converterTimestamps(e)))
    );
  }

  /**
   * Busca exames por profissional
   */
  listarPorProfissional(profissionalId: string): Observable<ExameRealizado[]> {
    const examesRef = collection(this.firestore, this.collectionName);
    const q = query(
      examesRef,
      where('profissionalId', '==', profissionalId),
      orderBy('dataColeta', 'desc')
    );
    
    return collectionData(q, { idField: 'uid' }).pipe(
      map((exames: any[]) => exames.map(e => this.converterTimestamps(e)))
    );
  }

  // ==================== HELPERS ====================

  /**
   * Converte Timestamps do Firestore para Date
   */
  private converterTimestamps(exame: any): ExameRealizado {
    const converted = { ...exame };
    
    const timestampFields = [
      'dataColeta', 
      'dataResultado', 
      'dataLiberacao', 
      'pacienteDataNascimento',
      'criadoEm', 
      'atualizadoEm'
    ];
    
    timestampFields.forEach(field => {
      if (converted[field] instanceof Timestamp) {
        converted[field] = converted[field].toDate();
      }
    });
    
    return converted as ExameRealizado;
  }

  /**
   * Calcula estatísticas de exames
   */
  async obterEstatisticas(): Promise<{
    total: number;
    pendentes: number;
    finalizados: number;
    liberados: number;
    cancelados: number;
  }> {
    const examesRef = collection(this.firestore, this.collectionName);
    const snapshot = await getDocs(examesRef);
    
    const stats = {
      total: snapshot.size,
      pendentes: 0,
      finalizados: 0,
      liberados: 0,
      cancelados: 0
    };
    
    snapshot.docs.forEach(doc => {
      const status = doc.data()['status'];
      if (status === 'pendente') stats.pendentes++;
      else if (status === 'finalizado') stats.finalizados++;
      else if (status === 'liberado') stats.liberados++;
      else if (status === 'cancelado') stats.cancelados++;
    });
    
    return stats;
  }
}
