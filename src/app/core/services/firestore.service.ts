import type { Firestore, Timestamp } from 'firebase/firestore';
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
  private dbPromise: Promise<Firestore> | null = null;

  /**
   * Carga Firebase bajo demanda para que no entre en el bundle del catálogo.
   */
  private obtenerDb(): Promise<Firestore> {
    this.dbPromise ??= (async () => {
      const [{ getApp, getApps, initializeApp }, { getFirestore }] = await Promise.all([
        import('firebase/app'),
        import('firebase/firestore')
      ]);
      const app = getApps().length > 0 ? getApp() : initializeApp(environment.firebaseConfig);
      return getFirestore(app);
    })();
    return this.dbPromise;
  }

  /**
   * Registra una actividad y propaga cualquier fallo para que la interfaz lo informe.
   */
  async registrarActividad(actividad: NuevaActividad): Promise<void> {
    try {
      const [db, { addDoc, collection }] = await Promise.all([
        this.obtenerDb(),
        import('firebase/firestore')
      ]);
      await addDoc(collection(db, 'actividad'), actividad);
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
      const [db, { collection, getDocs, limit, orderBy, query }] = await Promise.all([
        this.obtenerDb(),
        import('firebase/firestore')
      ]);
      const consulta = query(
        collection(db, 'actividad'),
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
