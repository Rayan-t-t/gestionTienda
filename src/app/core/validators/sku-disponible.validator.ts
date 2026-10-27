import { AsyncValidatorFn } from '@angular/forms';
import { catchError, map, of, switchMap, timer } from 'rxjs';
import { VideojuegosService } from '../services/videojuegos.service';

/**
 * Crea un validador asíncrono que comprueba la disponibilidad de un SKU.
 *
 * @param videojuegosService Servicio que consulta la existencia del SKU.
 * @param obtenerIdActual Devuelve el identificador que debe excluirse al editar.
 * @returns Validador con una pausa de 400 ms antes de consultar PostgREST.
 */
export function crearValidadorSku(
  videojuegosService: Pick<VideojuegosService, 'existeSku'>,
  obtenerIdActual: () => number | null
): AsyncValidatorFn {
  return (control) => {
    const sku = typeof control.value === 'string' ? control.value.trim() : '';
    if (!sku) {
      return of(null);
    }

    return timer(400).pipe(
      switchMap(() => videojuegosService.existeSku(sku, obtenerIdActual() ?? undefined)),
      map((existe) => (existe ? { skuDuplicado: true } : null)),
      catchError(() => of({ errorComprobandoSku: true }))
    );
  };
}
