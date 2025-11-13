import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  WhereFilterOp,
  OrderByDirection,
  Timestamp,
  DocumentData,
  QueryConstraint,
  CollectionReference
} from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';

export interface QueryOptions {
  field: string;
  operator: WhereFilterOp;
  value: any;
}

export interface OrderOptions {
  field: string;
  direction?: OrderByDirection;
}

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private firestore = inject(Firestore);

  /**
   * Converte timestamps do Firestore para Date
   */
  private convertTimestamps<T>(data: DocumentData): T {
    const converted: any = { ...data };
    
    Object.keys(converted).forEach(key => {
      if (converted[key] instanceof Timestamp) {
        converted[key] = converted[key].toDate();
      } else if (converted[key] && typeof converted[key] === 'object' && !Array.isArray(converted[key])) {
        converted[key] = this.convertTimestamps(converted[key]);
      } else if (Array.isArray(converted[key])) {
        converted[key] = converted[key].map((item: any) => 
          item instanceof Timestamp ? item.toDate() : 
          (typeof item === 'object' ? this.convertTimestamps(item) : item)
        );
      }
    });
    
    return converted as T;
  }

  /**
   * Converte Date para Timestamp para salvar no Firestore
   */
  private convertDatesToTimestamps(data: any): any {
    const converted: any = { ...data };
    
    Object.keys(converted).forEach(key => {
      if (converted[key] instanceof Date) {
        converted[key] = Timestamp.fromDate(converted[key]);
      } else if (converted[key] && typeof converted[key] === 'object' && !Array.isArray(converted[key])) {
        converted[key] = this.convertDatesToTimestamps(converted[key]);
      } else if (Array.isArray(converted[key])) {
        converted[key] = converted[key].map((item: any) =>
          item instanceof Date ? Timestamp.fromDate(item) :
          (typeof item === 'object' ? this.convertDatesToTimestamps(item) : item)
        );
      }
    });
    
    return converted;
  }

  /**
   * Criar documento
   */
  create<T>(collectionName: string, data: Partial<T>): Observable<string> {
    const collectionRef = collection(this.firestore, collectionName);
    const dataWithTimestamps = this.convertDatesToTimestamps(data);
    
    return from(addDoc(collectionRef, dataWithTimestamps)).pipe(
      map(docRef => docRef.id)
    );
  }

  /**
   * Buscar documento por ID
   */
  getById<T>(collectionName: string, id: string): Observable<T | null> {
    const docRef = doc(this.firestore, collectionName, id);
    
    return from(getDoc(docRef)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          return this.convertTimestamps<T>({ uid: docSnap.id, ...data });
        }
        return null;
      })
    );
  }

  /**
   * Atualizar documento
   */
  update<T>(collectionName: string, id: string, data: Partial<T>): Observable<void> {
    const docRef = doc(this.firestore, collectionName, id);
    const dataWithTimestamps = this.convertDatesToTimestamps(data);
    
    return from(updateDoc(docRef, dataWithTimestamps));
  }

  /**
   * Deletar documento
   */
  delete(collectionName: string, id: string): Observable<void> {
    const docRef = doc(this.firestore, collectionName, id);
    return from(deleteDoc(docRef));
  }

  /**
   * Query com filtros e ordenação
   */
  query<T>(
    collectionName: string,
    queryOptions?: QueryOptions[],
    orderOptions?: OrderOptions,
    limitCount?: number
  ): Observable<T[]> {
    const collectionRef = collection(this.firestore, collectionName);
    const constraints: QueryConstraint[] = [];

    // Adicionar filtros where
    if (queryOptions && queryOptions.length > 0) {
      queryOptions.forEach(option => {
        constraints.push(where(option.field, option.operator, option.value));
      });
    }

    // Adicionar ordenação
    if (orderOptions) {
      constraints.push(orderBy(orderOptions.field, orderOptions.direction || 'asc'));
    }

    // Adicionar limite
    if (limitCount) {
      constraints.push(limit(limitCount));
    }

    const q = query(collectionRef, ...constraints);

    return from(getDocs(q)).pipe(
      map(querySnapshot => {
        const docs: T[] = [];
        querySnapshot.forEach(doc => {
          docs.push(this.convertTimestamps<T>({ uid: doc.id, ...doc.data() }));
        });
        return docs;
      })
    );
  }

  /**
   * Buscar todos os documentos de uma coleção
   */
  getAll<T>(collectionName: string): Observable<T[]> {
    return this.query<T>(collectionName);
  }

  /**
   * Verifica se um documento existe
   */
  exists(collectionName: string, id: string): Observable<boolean> {
    const docRef = doc(this.firestore, collectionName, id);
    return from(getDoc(docRef)).pipe(
      map(docSnap => docSnap.exists())
    );
  }
}
