import { Injectable, signal } from '@angular/core';

const CLAVE_TEMA = 'tema';
const CLASE_OSCURA = 'ion-palette-dark';

/**
 * Gestiona el tema claro u oscuro de la aplicación y recuerda la elección del usuario.
 */
@Injectable({
  providedIn: 'root'
})
export class TemaService {
  private readonly _oscuro = signal(this.leerPreferencia());

  /** Indica si el tema oscuro está activo. */
  readonly oscuro = this._oscuro.asReadonly();

  constructor() {
    this.aplicar(this._oscuro());
  }

  /**
   * Cambia entre el tema claro y el oscuro y guarda la elección.
   */
  alternar(): void {
    const oscuro = !this._oscuro();
    this._oscuro.set(oscuro);
    this.aplicar(oscuro);
    try {
      localStorage.setItem(CLAVE_TEMA, oscuro ? 'oscuro' : 'claro');
    } catch {
      // Sin almacenamiento disponible: el tema solo dura mientras la página siga abierta.
    }
  }

  private leerPreferencia(): boolean {
    try {
      const guardado = localStorage.getItem(CLAVE_TEMA);
      if (guardado === 'oscuro' || guardado === 'claro') {
        return guardado === 'oscuro';
      }
    } catch {
      // Se usa la preferencia del sistema si no se puede leer el almacenamiento.
    }
    return typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private aplicar(oscuro: boolean): void {
    document.documentElement.classList.toggle(CLASE_OSCURA, oscuro);
  }
}
