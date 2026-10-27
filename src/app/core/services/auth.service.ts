import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, defer, finalize, map, shareReplay, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario } from '../models/usuario.model';

/**
 * Servicio de sesión basado en la API REST de Supabase Auth.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authUrl = `${environment.supabaseUrl}/auth/v1`;
  private readonly apiKey = environment.supabaseAnonKey;
  private refreshEnCurso: Observable<Usuario> | null = null;
  private readonly revisionCaducidad = signal(0);
  private temporizadorCaducidad: ReturnType<typeof setTimeout> | null = null;

  /** Usuario autenticado de la pestaña actual. */
  readonly usuarioActual = signal<Usuario | null>(this.leerUsuarioGuardado());

  /** Indica si hay una sesión con un token de acceso vigente. */
  readonly estaAutenticado = computed(() => {
    this.revisionCaducidad();
    const usuario = this.usuarioActual();
    return usuario !== null && this.tokenVigente(usuario.access_token);
  });

  /** Indica si la sesión vigente pertenece a un administrador. */
  readonly esAdministrador = computed(
    () => this.estaAutenticado() && this.usuarioActual()?.role === 'admin'
  );

  constructor() {
    this.programarCaducidad(this.usuarioActual());
    this.destroyRef.onDestroy(() => this.limpiarTemporizadorCaducidad());
  }

  /**
   * Inicia sesión con email y contraseña.
   */
  login(email: string, password: string): Observable<Usuario> {
    return this.http
      .post<unknown>(`${this.authUrl}/token?grant_type=password`, { email, password }, {
        headers: new HttpHeaders({ apikey: this.apiKey })
      })
      .pipe(
        map((respuesta) => this.convertirRespuesta(respuesta)),
        tap((usuario) => this.guardarUsuario(usuario))
      );
  }

  /**
   * Renueva la sesión usando su refresh token. Las llamadas simultáneas comparten
   * la misma petición para no consumir varias veces un token de un solo uso.
   */
  refrescarToken(): Observable<Usuario> {
    const refreshToken = this.usuarioActual()?.refresh_token;
    if (!refreshToken) {
      return throwError(() => new Error('No hay refresh token disponible.'));
    }

    if (!this.refreshEnCurso) {
      this.refreshEnCurso = defer(() =>
        this.http.post<unknown>(
          `${this.authUrl}/token?grant_type=refresh_token`,
          { refresh_token: refreshToken },
          { headers: new HttpHeaders({ apikey: this.apiKey }) }
        )
      ).pipe(
        map((respuesta) => this.convertirRespuesta(respuesta)),
        tap((usuario) => this.guardarUsuario(usuario)),
        finalize(() => {
          this.refreshEnCurso = null;
        }),
        shareReplay({ bufferSize: 1, refCount: false })
      );
    }

    return this.refreshEnCurso;
  }

  /**
   * Cierra la sesión de esta pestaña.
   */
  logout(): void {
    this.limpiarTemporizadorCaducidad();
    this.usuarioActual.set(null);
    this.revisionCaducidad.update((revision) => revision + 1);
    sessionStorage.removeItem('usuario');
  }

  private guardarUsuario(usuario: Usuario): void {
    sessionStorage.setItem('usuario', JSON.stringify(usuario));
    this.usuarioActual.set(usuario);
    this.programarCaducidad(usuario);
    this.revisionCaducidad.update((revision) => revision + 1);
  }

  private leerUsuarioGuardado(): Usuario | null {
    try {
      const almacenado = sessionStorage.getItem('usuario');
      if (!almacenado) {
        return null;
      }
      const datos: unknown = JSON.parse(almacenado);
      if (!this.esUsuario(datos)) {
        sessionStorage.removeItem('usuario');
        return null;
      }
      return datos;
    } catch (error) {
      sessionStorage.removeItem('usuario');
      console.error('No se pudo leer la sesión guardada.', error);
      return null;
    }
  }

  private programarCaducidad(usuario: Usuario | null): void {
    this.limpiarTemporizadorCaducidad();
    const expiracion = this.obtenerExpiracion(usuario?.access_token);
    if (expiracion === null) {
      return;
    }

    this.temporizadorCaducidad = setTimeout(() => {
      this.revisionCaducidad.update((revision) => revision + 1);
      this.temporizadorCaducidad = null;
    }, Math.max(0, expiracion - Date.now()));
  }

  private limpiarTemporizadorCaducidad(): void {
    if (this.temporizadorCaducidad !== null) {
      clearTimeout(this.temporizadorCaducidad);
      this.temporizadorCaducidad = null;
    }
  }

  private obtenerExpiracion(token: string | undefined): number | null {
    const segmento = token?.split('.')[1];
    if (!segmento) {
      return null;
    }

    try {
      const base64 = segmento.replace(/-/g, '+').replace(/_/g, '/');
      const datos: unknown = JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')));
      if (typeof datos !== 'object' || datos === null) {
        return null;
      }
      const expiracion = (datos as Record<string, unknown>)['exp'];
      return typeof expiracion === 'number' ? expiracion * 1000 : null;
    } catch {
      return null;
    }
  }

  private esUsuario(valor: unknown): valor is Usuario {
    if (typeof valor !== 'object' || valor === null) {
      return false;
    }
    const registro = valor as Record<string, unknown>;
    return (
      typeof registro['id'] === 'string' &&
      typeof registro['email'] === 'string' &&
      (registro['role'] === 'admin' || registro['role'] === 'user') &&
      typeof registro['access_token'] === 'string' &&
      typeof registro['refresh_token'] === 'string'
    );
  }

  private convertirRespuesta(respuesta: unknown): Usuario {
    if (typeof respuesta !== 'object' || respuesta === null) {
      throw new Error('Supabase Auth devolvió una respuesta no válida.');
    }

    const datos = respuesta as Record<string, unknown>;
    const usuarioRespuesta = datos['user'];
    if (typeof usuarioRespuesta !== 'object' || usuarioRespuesta === null) {
      throw new Error('Supabase Auth no devolvió los datos del usuario.');
    }

    const usuario = usuarioRespuesta as Record<string, unknown>;
    const appMetadata = usuario['app_metadata'];
    const metadata =
      typeof appMetadata === 'object' && appMetadata !== null
        ? (appMetadata as Record<string, unknown>)
        : {};
    const accessToken = datos['access_token'];
    const refreshToken = datos['refresh_token'];

    if (
      typeof usuario['id'] !== 'string' ||
      typeof usuario['email'] !== 'string' ||
      typeof accessToken !== 'string' ||
      typeof refreshToken !== 'string'
    ) {
      throw new Error('Supabase Auth devolvió una sesión incompleta.');
    }

    return {
      id: usuario['id'],
      email: usuario['email'],
      role: metadata['role'] === 'admin' ? 'admin' : 'user',
      access_token: accessToken,
      refresh_token: refreshToken
    };
  }

  private tokenVigente(token: string | undefined): boolean {
    const expiracion = this.obtenerExpiracion(token);
    return expiracion !== null && expiracion > Date.now();
  }
}
