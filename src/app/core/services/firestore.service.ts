import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  Firestore
} from 'firebase/firestore';
import { environment } from '../../../environments/environment';

/**
 * Servicio para interactuar con Firebase Firestore.
 * Usa la colección 'actividad' para registrar acciones.
 */
@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private db: Firestore;

  constructor() {
    const app = initializeApp(environment.firebase);
    this.db = getFirestore(app);
  }

  /**
   * Registra una actividad en la colección 'actividad'.
   */
  async registrarActividad(actividad: {
    tipo: string;
    descripcion: string;
    usuario?: string;
    fecha?: Date;
  }): Promise<void> {
    try {
      const coleccion = collection(this.db, 'actividad');
      await addDoc(coleccion, {
        ...actividad,
        fecha: actividad.fecha || new Date()
      });
    } catch (error) {
      console.error('Error al registrar actividad en Firestore:', error);
    }
  }

  /**
   * Obtiene todas las actividades registradas.
   */
  async obtenerActividades(): Promise<any[]> {
    try {
      const coleccion = collection(this.db, 'actividad');
      const snapshot = await getDocs(coleccion);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error al obtener actividades de Firestore:', error);
      return [];
    }
  }
}
