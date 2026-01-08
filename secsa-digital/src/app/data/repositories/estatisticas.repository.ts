import { inject, Injectable } from '@angular/core';
import { FirestoreService } from '../../core/services/firestore.service';
import { EstatisticasGeral, TopExame } from '../interfaces/estatisticas.interface';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EstatisticasRepository {
  private firestoreService = inject(FirestoreService);

  /**
   * Obtém as estatísticas gerais do sistema (em tempo real)
   */
  getEstatisticasGeral(): Observable<EstatisticasGeral | undefined> {
    return this.firestoreService.getDocument<EstatisticasGeral>(
      'estatisticas',
      'geral'
    );
  }

  /**
   * Obtém o top exames (em tempo real)
   */
  getTopExames(): Observable<TopExame[]> {
    return this.firestoreService.getCollection<any>('top-exames').pipe(
      map(docs => {
        return docs
          .map(doc => ({
            id: doc.id,
            nome: doc.nome,
            quantidade: doc.quantidade || 0
          }))
          .filter(exame => exame.quantidade > 0)
          .sort((a, b) => b.quantidade - a.quantidade)
          .slice(0, 10);
      })
    );
  }
}
