import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  QueryConstraint,
  CollectionReference,
  DocumentReference,
  DocumentData,
  getDocs
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  constructor(private firestore: Firestore) {}

  /**
   * Obtém uma coleção do Firestore
   */
  getCollection<T extends DocumentData>(collectionName: string): Observable<T[]> {
    const collectionRef = collection(this.firestore, collectionName) as CollectionReference<T>;
    return collectionData(collectionRef, { idField: 'id' }) as Observable<T[]>;
  }

  /**
   * Obtém uma coleção com query
   */
  getCollectionWithQuery<T extends DocumentData>(collectionName: string, ...queryConstraints: QueryConstraint[]): Observable<T[]> {
    const collectionRef = collection(this.firestore, collectionName) as CollectionReference<T>;
    const q = query(collectionRef, ...queryConstraints);
    return collectionData(q, { idField: 'id' }) as Observable<T[]>;
  }

  /**
   * Obtém um documento pelo ID
   */
  getDocument<T extends DocumentData>(collectionName: string, id: string): Observable<T | undefined> {
    const docRef = doc(this.firestore, collectionName, id) as DocumentReference<T>;
    return docData(docRef, { idField: 'id' }) as Observable<T | undefined>;
  }

  /**
   * Adiciona um novo documento
   */
  async addDocument<T extends DocumentData>(collectionName: string, data: T): Promise<DocumentReference> {
    const collectionRef = collection(this.firestore, collectionName);
    return await addDoc(collectionRef, data as any);
  }

  /**
   * Atualiza um documento existente
   */
  async updateDocument<T extends DocumentData>(collectionName: string, id: string, data: Partial<T>): Promise<void> {
    const docRef = doc(this.firestore, collectionName, id);
    return await updateDoc(docRef, data as any);
  }

  /**
   * Remove um documento
   */
  async deleteDocument(collectionName: string, id: string): Promise<void> {
    const docRef = doc(this.firestore, collectionName, id);
    return await deleteDoc(docRef);
  }

  /**
   * Obtém um snapshot da coleção (para paginação)
   */
  async getCollectionSnapshot<T extends DocumentData>(
    collectionName: string,
    ...queryConstraints: QueryConstraint[]
  ): Promise<T[]> {
    const collectionRef = collection(this.firestore, collectionName) as CollectionReference<T>;
    const q = query(collectionRef, ...queryConstraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as T));
  }

  /**
   * Obtém snapshot com documentos raw (para cursor-based pagination)
   */
  async getCollectionSnapshotWithDocs<T extends DocumentData>(
    collectionName: string,
    ...queryConstraints: QueryConstraint[]
  ) {
    const collectionRef = collection(this.firestore, collectionName) as CollectionReference<T>;
    const q = query(collectionRef, ...queryConstraints);
    const snapshot = await getDocs(q);
    return {
      docs: snapshot.docs,
      data: snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as T))
    };
  }
}
