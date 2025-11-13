import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { FirestoreService, QueryOptions } from '../../../core/services/firestore.service';
import { ValorReferencia } from '../../../core/models';

@Injectable({
  providedIn: 'root'
})
export class ValorReferenciaService {
  private firestoreService = inject(FirestoreService);
  private readonly COLLECTION = 'valoresReferencia';

  /**
   * Buscar valor de referência por ID
   */
  buscarPorId(id: string): Observable<ValorReferencia | null> {
    return this.firestoreService.getById<ValorReferencia>(this.COLLECTION, id);
  }

  /**
   * Buscar valores de referência por tipo de exame
   */
  buscarPorTipoExame(tipoExame: 'hemograma' | 'urina' | 'fezes'): Observable<ValorReferencia[]> {
    const queryOptions: QueryOptions[] = [
      { field: 'tipoExame', operator: '==', value: tipoExame },
      { field: 'ativo', operator: '==', value: true }
    ];

    return this.firestoreService.query<ValorReferencia>(
      this.COLLECTION,
      queryOptions,
      { field: 'parametro', direction: 'asc' }
    );
  }

  /**
   * Buscar valor de referência específico
   */
  buscarValor(
    tipoExame: 'hemograma' | 'urina' | 'fezes',
    parametro: string,
    idade?: number,
    sexo?: 'M' | 'F'
  ): Observable<ValorReferencia | null> {
    return this.buscarPorTipoExame(tipoExame).pipe(
      map(valores => {
        // Filtrar por parâmetro
        let resultado = valores.filter(v => 
          v.parametro.toLowerCase() === parametro.toLowerCase()
        );

        if (resultado.length === 0) return null;

        // Se há múltiplos valores, filtrar por idade e sexo
        if (resultado.length > 1 && idade !== undefined) {
          resultado = resultado.filter(v => {
            if (!v.faixaEtaria) return true;
            
            const dentroFaixaMin = v.faixaEtaria.min === undefined || idade >= v.faixaEtaria.min;
            const dentroFaixaMax = v.faixaEtaria.max === undefined || idade <= v.faixaEtaria.max;
            
            return dentroFaixaMin && dentroFaixaMax;
          });
        }

        if (resultado.length > 1 && sexo) {
          const filtradoPorSexo = resultado.filter(v => 
            v.sexo === sexo || v.sexo === 'ambos' || !v.sexo
          );
          if (filtradoPorSexo.length > 0) {
            resultado = filtradoPorSexo;
          }
        }

        return resultado[0] || null;
      })
    );
  }

  /**
   * Verificar se valor está fora da referência
   */
  valorAlterado(valor: number, valorRef: ValorReferencia): boolean {
    if (valorRef.valorMinimo !== undefined && valor < valorRef.valorMinimo) {
      return true;
    }
    if (valorRef.valorMaximo !== undefined && valor > valorRef.valorMaximo) {
      return true;
    }
    return false;
  }

  /**
   * Formatar string de valor de referência
   */
  formatarValorReferencia(valorRef: ValorReferencia): string {
    if (valorRef.valorMinimo !== undefined && valorRef.valorMaximo !== undefined) {
      return `${valorRef.valorMinimo} - ${valorRef.valorMaximo} ${valorRef.unidade}`;
    }
    if (valorRef.valorMinimo !== undefined) {
      return `> ${valorRef.valorMinimo} ${valorRef.unidade}`;
    }
    if (valorRef.valorMaximo !== undefined) {
      return `< ${valorRef.valorMaximo} ${valorRef.unidade}`;
    }
    return valorRef.unidade;
  }

  /**
   * Criar valor de referência
   */
  criar(valorReferencia: Omit<ValorReferencia, 'id' | 'criadoEm' | 'atualizadoEm'>): Observable<string> {
    const agora = new Date();
    const novo: Partial<ValorReferencia> = {
      ...valorReferencia,
      ativo: true,
      criadoEm: agora,
      atualizadoEm: agora
    };

    return this.firestoreService.create<ValorReferencia>(this.COLLECTION, novo);
  }

  /**
   * Atualizar valor de referência
   */
  atualizar(id: string, dados: Partial<ValorReferencia>): Observable<void> {
    const dadosAtualizacao = {
      ...dados,
      atualizadoEm: new Date()
    };

    return this.firestoreService.update<ValorReferencia>(this.COLLECTION, id, dadosAtualizacao);
  }

  /**
   * Desativar valor de referência
   */
  desativar(id: string): Observable<void> {
    return this.atualizar(id, { ativo: false });
  }

  /**
   * Listar todos os valores de referência ativos
   */
  listarAtivos(): Observable<ValorReferencia[]> {
    const queryOptions: QueryOptions[] = [
      { field: 'ativo', operator: '==', value: true }
    ];

    return this.firestoreService.query<ValorReferencia>(
      this.COLLECTION,
      queryOptions,
      { field: 'tipoExame', direction: 'asc' }
    );
  }

  /**
   * Calcular idade em anos a partir da data de nascimento
   */
  calcularIdade(dataNascimento: Date): number {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();

    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }

    return idade;
  }
}
