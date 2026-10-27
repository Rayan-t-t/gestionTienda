import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Usuario } from '../models/usuario.model';
import { map, Observable, tap } from 'rxjs';

/**
 * Servicio de autenticación que consume el endpoint REST de Supabase Auth.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly authUrl = `${environment.supabaseUrl}/auth/v1`;
  private readonly apiKey = environment.supabaseAnonKey;

  /** Usuario autenticado actual. */
  readonly usuarioActual = signal<Usuario | null>(this.getUsuarioGuardado());

  constructor(private http: HttpClient) {}

  /**
   * Inicia sesión con email y contraseña usando Supabase Auth REST.
   */
  login(email: string, password: string): Observable<Usuario> {
    const url = `${this.authUrl}/token?grant_type=password`;
    return this.http
      .post<any>(
        url,
        { email, password },
        {
          headers: {
            apikey: this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      )
      .pipe(
        map((respuesta) => {
          const role = respuesta.user?.app_metadata?.role || 'user';
          const usuario: Usuario = {
            id: respuesta.user.id,
            email: respuesta.user.email,
            role: role,
            access_token: respuesta.access_token,
            refresh_token: respuesta.refresh_token
          };
          return usuario;
        }),
        tap((usuario) => {
          this.guardarUsuario(usuario);
          this.usuarioActual.set(usuario);
        })
      );
  }

  /**
   * Cierra sesión y limpia el almacenamiento local.
   */
  logout(): void {
    localStorage.removeItem('usuario');
    this.usuarioActual.set(null);
  }

  /**
   * Comprueba si el usuario está autenticado.
   */
  estaAutenticado(): boolean {
    return this.usuarioActual() !== null;
  }

  /**
   * Comprueba si el usuario tiene rol de administrador.
   */
  esAdministrador(): boolean {
    return this.usuarioActual()?.role === 'admin';
  }

  private guardarUsuario(usuario: Usuario): void {
    localStorage.setItem('usuario', JSON.stringify(usuario));
  }

  private getUsuarioGuardado(): Usuario | null {
    try {
      const data = localStorage.getItem('usuario');
      return data ? (JSON.parse(data) as Usuario) : null;
    } catch {
      return null;
    }
  }
}
