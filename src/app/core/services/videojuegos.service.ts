import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import {
  EMPTY,
  Observable,
  catchError,
  expand,
  map,
  of,
  reduce,
  switchMap,
  tap,
  throwError
} from 'rxjs';
import { environment } from '../../../environments/environment';
import { Videojuego, VideojuegoInforme, VideojuegoListado } from '../models/videojuego.model';

/**
 * Acceso al catálogo de videojuegos mediante PostgREST.
 */
@Injectable({
  providedIn: 'root'
})
export class VideojuegosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.supabaseUrl}/rest/v1/video-juegos`;
  private readonly limiteCatalogo = 50;
  private readonly limiteInforme = 1000;
  private readonly _catalogo = signal<VideojuegoListado[] | null>(null);

  /** Catálogo resumido cacheado para la primera página. */
  readonly catalogo = computed(() => this._catalogo());

  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json',
    Prefer: 'return=representation'
  });

  /**
   * Obtiene una página del catálogo con los campos necesarios para el listado.
   */
  obtenerTodos(
    offset = 0,
    limite = this.limiteCatalogo,
    busqueda = ''
  ): Observable<VideojuegoListado[]> {
    const catalogoCacheado = this._catalogo();
    if (
      offset === 0 &&
      limite === this.limiteCatalogo &&
      !busqueda &&
      catalogoCacheado !== null
    ) {
      return of(catalogoCacheado);
    }

    let params = new HttpParams()
      .set(
        'select',
        'id,titulo,precio,stock,plataforma,genero,disponible,valoracion,portada_url'
      )
      .set('order', 'id.asc')
      .set('limit', limite)
      .set('offset', offset);
    if (busqueda.trim()) {
      const termino = busqueda.trim().replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      const filtro = `"*${termino}*"`;
      params = params.set(
        'or',
        `(titulo.ilike.${filtro},plataforma.ilike.${filtro},genero.ilike.${filtro})`
      );
    }

    return this.http
      .get<VideojuegoListado[]>(this.baseUrl, {
        headers: this.headers.set('Prefer', 'count=exact'),
        params
      })
      .pipe(
        tap((videojuegos) => {
          if (offset === 0 && limite === this.limiteCatalogo && !busqueda.trim()) {
            this._catalogo.set(videojuegos);
          }
        }),
        catchError((error: unknown) =>
          throwError(() => new Error(this.mensajeError(error, 'No se pudo cargar el catálogo.')))
        )
      );
  }

  /**
   * Obtiene todos los campos mínimos para los informes, paginando PostgREST.
   */
  obtenerParaInforme(): Observable<VideojuegoInforme[]> {
    let siguienteOffset = this.limiteInforme;
    return this.obtenerPaginaInforme(0).pipe(
      expand((pagina) => {
        if (pagina.length < this.limiteInforme) {
          return EMPTY;
        }
        const offset = siguienteOffset;
        siguienteOffset += this.limiteInforme;
        return this.obtenerPaginaInforme(offset);
      }),
      reduce((videojuegos, pagina) => videojuegos.concat(pagina), [] as VideojuegoInforme[])
    );
  }

  /**
   * Busca un videojuego por su identificador.
   */
  obtenerPorId(id: number): Observable<Videojuego[]> {
    const params = new HttpParams().set('id', `eq.${id}`);
    return this.http
      .get<Videojuego[]>(this.baseUrl, { headers: this.headers, params })
      .pipe(
        catchError((error: unknown) =>
          throwError(() => new Error(this.mensajeError(error, 'No se pudo cargar el videojuego.')))
        )
      );
  }

  /**
   * Comprueba si un SKU ya existe y, al editar, excluye el videojuego actual.
   */
  existeSku(sku: string, excluirId?: number): Observable<boolean> {
    let params = new HttpParams()
      .set('select', 'id')
      .set('codigo_sku', `eq.${sku.trim()}`)
      .set('limit', '1');
    if (excluirId !== undefined) {
      params = params.set('id', `neq.${excluirId}`);
    }

    return this.http
      .get<Array<Pick<Videojuego, 'id'>>>(this.baseUrl, {
        headers: this.headers,
        params
      })
      .pipe(
        map((filas) => filas.length > 0),
        catchError((error: unknown) =>
          throwError(() => new Error(this.mensajeError(error, 'No se pudo comprobar el código SKU.')))
        )
      );
  }

  /**
   * Crea un videojuego y devuelve la fila insertada.
   */
  crear(videojuego: Videojuego): Observable<Videojuego[]> {
    return this.http
      .post<Videojuego[]>(this.baseUrl, videojuego, { headers: this.headers })
      .pipe(
        tap(() => this.invalidarCatalogo()),
        catchError((error: unknown) =>
          throwError(() => new Error(this.mensajeError(error, 'No se pudo crear el videojuego.')))
        )
      );
  }

  /**
   * Actualiza un videojuego y devuelve la fila resultante.
   */
  actualizar(id: number, videojuego: Partial<Videojuego>): Observable<Videojuego[]> {
    const params = new HttpParams().set('id', `eq.${id}`);
    return this.http
      .patch<Videojuego[]>(this.baseUrl, videojuego, { headers: this.headers, params })
      .pipe(
        tap(() => this.invalidarCatalogo()),
        catchError((error: unknown) =>
          throwError(() => new Error(this.mensajeError(error, 'No se pudo actualizar el videojuego.')))
        )
      );
  }

  /**
   * Solicita un descuento atómico del carrito mediante la RPC autorizada de Supabase.
   */
  finalizarCompra(articulos: Array<{ id: number; cantidad: number }>): Observable<void> {
    if (
      articulos.length === 0 ||
      articulos.some(
        (articulo) =>
          !Number.isSafeInteger(articulo.id) ||
          articulo.id < 1 ||
          !Number.isSafeInteger(articulo.cantidad) ||
          articulo.cantidad < 1
      ) ||
      new Set(articulos.map((articulo) => articulo.id)).size !== articulos.length
    ) {
      return throwError(() => new Error('El carrito contiene productos o cantidades no válidos.'));
    }

    return this.http
      .post<boolean>(
        `${environment.supabaseUrl}/rest/v1/rpc/finalizar_compra`,
        { p_articulos: articulos },
        { headers: this.headers }
      )
      .pipe(
        switchMap((resultado) =>
          resultado === true
            ? of(undefined)
            : throwError(() => new Error('Supabase no confirmó la finalización del pedido.'))
        ),
        tap(() => this.invalidarCatalogo()),
        catchError((error: unknown) =>
          throwError(() => new Error(this.mensajeError(error, 'No se pudo finalizar el pedido.')))
        )
      );
  }

  /**
   * Elimina un videojuego y devuelve la fila eliminada.
   */
  eliminar(id: number): Observable<Videojuego[]> {
    const params = new HttpParams().set('id', `eq.${id}`);
    return this.http
      .delete<Videojuego[]>(this.baseUrl, { headers: this.headers, params })
      .pipe(
        tap(() => this.invalidarCatalogo()),
        catchError((error: unknown) =>
          throwError(() => new Error(this.mensajeError(error, 'No se pudo eliminar el videojuego.')))
        )
      );
  }

  /**
   * Invalida el catálogo cacheado tras una mutación.
   */
  invalidarCatalogo(): void {
    this._catalogo.set(null);
  }

  private obtenerPaginaInforme(offset: number): Observable<VideojuegoInforme[]> {
    const params = new HttpParams()
      .set('select', 'precio,stock,valoracion,plataforma,genero')
      .set('order', 'id.asc')
      .set('limit', this.limiteInforme)
      .set('offset', offset);

    return this.http
      .get<VideojuegoInforme[]>(this.baseUrl, {
        headers: this.headers.set('Prefer', 'count=exact'),
        params
      })
      .pipe(
        catchError((error: unknown) =>
          throwError(() =>
            new Error(this.mensajeError(error, 'No se pudieron cargar los datos para el informe.'))
          )
        )
      );
  }

  private mensajeError(error: unknown, predeterminado: string): string {
    if (error instanceof HttpErrorResponse) {
      const cuerpo: unknown = error.error;
      if (typeof cuerpo === 'object' && cuerpo !== null) {
        const mensaje = (cuerpo as Record<string, unknown>)['message'];
        if (typeof mensaje === 'string' && mensaje.trim()) {
          return mensaje;
        }
      }
      if (error.status === 0) {
        return 'No se pudo conectar con Supabase. Comprueba la conexión e inténtalo de nuevo.';
      }
    }
    return error instanceof Error && error.message ? error.message : predeterminado;
  }
}
