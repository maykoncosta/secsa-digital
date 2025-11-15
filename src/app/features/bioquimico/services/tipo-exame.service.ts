import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  doc, 
  collectionData,
  docData,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TipoExame, ParametroTipoExame, ValorReferenciaParametro } from '../../../core/models';

@Injectable({
  providedIn: 'root'
})
export class TipoExameService {
  private firestore = inject(Firestore);
  private collectionName = 'exames';

  // ==================== TIPOS DE EXAMES ====================

  /**
   * Lista todos os tipos de exames ativos
   */
  listarTiposExames(): Observable<TipoExame[]> {
    const examesRef = collection(this.firestore, this.collectionName);
    const q = query(examesRef, where('ativo', '==', true), orderBy('ordem'));
    
    return collectionData(q, { idField: 'uid' }).pipe(
      map((exames: any[]) => 
        exames.map(exame => this.converterTimestamps(exame))
      )
    );
  }

  /**
   * Busca um tipo de exame por ID
   */
  buscarTipoExamePorId(exameId: string): Observable<TipoExame> {
    const exameRef = doc(this.firestore, `${this.collectionName}/${exameId}`);
    return docData(exameRef, { idField: 'uid' }).pipe(
      map((exame: any) => this.converterTimestamps(exame))
    );
  }

  /**
   * Cria um novo tipo de exame
   */
  async criarTipoExame(tipoExame: Omit<TipoExame, 'uid' | 'dataCriacao' | 'dataAtualizacao'>): Promise<string> {
    const examesRef = collection(this.firestore, this.collectionName);
    const now = Timestamp.now();
    
    const novoExame = {
      ...tipoExame,
      dataCriacao: now,
      dataAtualizacao: now
    };

    const docRef = await addDoc(examesRef, novoExame);
    return docRef.id;
  }

  /**
   * Atualiza um tipo de exame
   */
  async atualizarTipoExame(exameId: string, dados: Partial<TipoExame>): Promise<void> {
    const exameRef = doc(this.firestore, `${this.collectionName}/${exameId}`);
    await updateDoc(exameRef, {
      ...dados,
      dataAtualizacao: Timestamp.now()
    });
  }

  /**
   * Desativa um tipo de exame (soft delete)
   */
  async desativarTipoExame(exameId: string): Promise<void> {
    await this.atualizarTipoExame(exameId, { ativo: false });
  }

  // ==================== PARÂMETROS ====================

  /**
   * Lista todos os parâmetros de um tipo de exame
   */
  listarParametros(exameId: string): Observable<ParametroTipoExame[]> {
    const parametrosRef = collection(this.firestore, `${this.collectionName}/${exameId}/parametros`);
    const q = query(parametrosRef, orderBy('ordem'));
    
    return collectionData(q, { idField: 'uid' }) as Observable<ParametroTipoExame[]>;
  }

  /**
   * Busca um parâmetro específico
   */
  buscarParametroPorId(exameId: string, parametroId: string): Observable<ParametroTipoExame> {
    const parametroRef = doc(this.firestore, `${this.collectionName}/${exameId}/parametros/${parametroId}`);
    return docData(parametroRef, { idField: 'uid' }) as Observable<ParametroTipoExame>;
  }

  /**
   * Adiciona um parâmetro a um tipo de exame
   */
  async adicionarParametro(exameId: string, parametro: Omit<ParametroTipoExame, 'uid'>): Promise<string> {
    const parametrosRef = collection(this.firestore, `${this.collectionName}/${exameId}/parametros`);
    const docRef = await addDoc(parametrosRef, parametro);
    return docRef.id;
  }

  /**
   * Atualiza um parâmetro
   */
  async atualizarParametro(exameId: string, parametroId: string, dados: Partial<ParametroTipoExame>): Promise<void> {
    const parametroRef = doc(this.firestore, `${this.collectionName}/${exameId}/parametros/${parametroId}`);
    await updateDoc(parametroRef, dados);
  }

  /**
   * Remove um parâmetro
   */
  async removerParametro(exameId: string, parametroId: string): Promise<void> {
    const parametroRef = doc(this.firestore, `${this.collectionName}/${exameId}/parametros/${parametroId}`);
    await deleteDoc(parametroRef);
  }

  // ==================== VALORES DE REFERÊNCIA ====================

  /**
   * Lista todos os valores de referência de um parâmetro
   */
  listarValoresReferencia(exameId: string, parametroId: string): Observable<ValorReferenciaParametro[]> {
    const referenciasRef = collection(
      this.firestore, 
      `${this.collectionName}/${exameId}/parametros/${parametroId}/valoresReferencia`
    );
    const q = query(referenciasRef, where('ativo', '==', true));
    
    return collectionData(q, { idField: 'uid' }) as Observable<ValorReferenciaParametro[]>;
  }

  /**
   * Busca o valor de referência aplicável para um paciente
   */
  async buscarValorReferenciaAplicavel(
    exameId: string, 
    parametroId: string, 
    sexo: 'M' | 'F',
    idade: number
  ): Promise<ValorReferenciaParametro | null> {
    const referenciasRef = collection(
      this.firestore, 
      `${this.collectionName}/${exameId}/parametros/${parametroId}/valoresReferencia`
    );
    
    const q = query(referenciasRef, where('ativo', '==', true));
    const snapshot = await getDocs(q);
    
    // Filtra valores de referência aplicáveis
    const referencias = snapshot.docs
      .map(doc => ({ uid: doc.id, ...doc.data() } as ValorReferenciaParametro))
      .filter(ref => {
        // Verifica sexo
        if (ref.sexo !== 'ambos' && ref.sexo !== sexo) {
          return false;
        }
        
        // Verifica idade
        if (ref.idadeMin !== undefined && idade < ref.idadeMin) {
          return false;
        }
        if (ref.idadeMax !== undefined && idade > ref.idadeMax) {
          return false;
        }
        
        return true;
      });
    
    // Retorna a primeira referência aplicável (pode ser refinado para priorizar)
    return referencias.length > 0 ? referencias[0] : null;
  }

  /**
   * Adiciona um valor de referência a um parâmetro
   */
  async adicionarValorReferencia(
    exameId: string, 
    parametroId: string, 
    referencia: Omit<ValorReferenciaParametro, 'uid'>
  ): Promise<string> {
    const referenciasRef = collection(
      this.firestore, 
      `${this.collectionName}/${exameId}/parametros/${parametroId}/valoresReferencia`
    );
    const docRef = await addDoc(referenciasRef, referencia);
    return docRef.id;
  }

  /**
   * Atualiza um valor de referência
   */
  async atualizarValorReferencia(
    exameId: string, 
    parametroId: string, 
    referenciaId: string,
    dados: Partial<ValorReferenciaParametro>
  ): Promise<void> {
    const referenciaRef = doc(
      this.firestore, 
      `${this.collectionName}/${exameId}/parametros/${parametroId}/valoresReferencia/${referenciaId}`
    );
    await updateDoc(referenciaRef, dados);
  }

  /**
   * Desativa um valor de referência
   */
  async desativarValorReferencia(exameId: string, parametroId: string, referenciaId: string): Promise<void> {
    await this.atualizarValorReferencia(exameId, parametroId, referenciaId, { ativo: false });
  }

  // ==================== HELPERS ====================

  /**
   * Converte Timestamps do Firestore para Date
   */
  private converterTimestamps(obj: any): any {
    const converted = { ...obj };
    
    if (converted.dataCriacao instanceof Timestamp) {
      converted.dataCriacao = converted.dataCriacao.toDate();
    }
    if (converted.dataAtualizacao instanceof Timestamp) {
      converted.dataAtualizacao = converted.dataAtualizacao.toDate();
    }
    
    return converted;
  }

  /**
   * Formata valor de referência para exibição
   */
  formatarValorReferencia(referencia: ValorReferenciaParametro): string {
    if (referencia.valorEsperado) {
      return referencia.valorEsperado;
    }
    
    if (referencia.valorMin !== undefined && referencia.valorMax !== undefined) {
      return `${referencia.valorMin} - ${referencia.valorMax}`;
    }
    
    if (referencia.valorMin !== undefined) {
      return `≥ ${referencia.valorMin}`;
    }
    
    if (referencia.valorMax !== undefined) {
      return `≤ ${referencia.valorMax}`;
    }
    
    return '-';
  }
}
