import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  addDoc,
  collection,
  Firestore,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  Timestamp,
} from 'firebase/firestore';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

/** Datos que se guardan en la colección de auditoría. */
export interface NuevaActividad {
  tipo: string;
  usuario: string;
  detalle: string;
  fecha: Date;
  unidadesVendidas?: number;
}

/** Actividad de auditoría recuperada de Firestore. */
export interface Actividad extends Omit<NuevaActividad, 'fecha'> {
  id: string;
  fecha: Timestamp;
}

/**
 * Servicio de auditoría sobre la colección actividad de Firestore.
 */
@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private readonly db: Firestore;

  constructor() {
    const app = getApps().length > 0 ? getApp() : initializeApp(environment.firebaseConfig);
    this.db = getFirestore(app);
  }

  /**
   * Registra una actividad y propaga cualquier fallo para que la interfaz lo informe.
   */
  async registrarActividad(actividad: NuevaActividad): Promise<void> {
    try {
      await addDoc(collection(this.db, 'actividad'), actividad);
    } catch (error) {
      console.error('No se pudo registrar la actividad en Firestore.', error);
      throw error;
    }
  }

  /**
   * Obtiene las actividades más recientes, ordenadas por fecha descendente.
   */
  async obtenerActividades(limite = 500): Promise<Actividad[]> {
    try {
      const consulta = query(
        collection(this.db, 'actividad'),
        orderBy('fecha', 'desc'),
        limit(Math.max(1, Math.floor(limite)))
      );
      const snapshot = await getDocs(consulta);
      return snapshot.docs.map((documento) => ({
        id: documento.id,
        ...(documento.data() as Omit<NuevaActividad, 'fecha'>),
        fecha: documento.get('fecha') as Timestamp
      }));
    } catch (error) {
      console.error('No se pudieron obtener las actividades de Firestore.', error);
      throw error;
    }
  }
}
