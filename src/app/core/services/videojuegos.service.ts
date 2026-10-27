import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Videojuego } from '../models/videojuego.model';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

/**
 * Servicio para gestionar videojuegos mediante Supabase PostgREST.
 * Endpoint: /rest/v1/video-juegos
 */
@Injectable({
  providedIn: 'root'
})
export class VideojuegosService {
  private readonly baseUrl = `${environment.supabaseUrl}/rest/v1/video-juegos`;
  private readonly apiKey = environment.supabaseAnonKey;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      apikey: this.apiKey,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    });
    const usuario = this.authService.usuarioActual();
    if (usuario?.access_token) {
      headers = headers.set('Authorization', `Bearer ${usuario.access_token}`);
    }
    return headers;
  }

  /**
   * Obtiene todos los videojuegos.
   */
  obtenerTodos(): Observable<Videojuego[]> {
    return this.http.get<Videojuego[]>(this.baseUrl, { headers: this.getHeaders() });
  }

  /**
   * Obtiene un videojuego por su ID.
   */
  obtenerPorId(id: number): Observable<Videojuego[]> {
    return this.http.get<Videojuego[]>(`${this.baseUrl}?id=eq.${id}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Crea un nuevo videojuego.
   */
  crear(videojuego: Videojuego): Observable<Videojuego[]> {
    return this.http.post<Videojuego[]>(this.baseUrl, videojuego, {
      headers: this.getHeaders()
    });
  }

  /**
   * Actualiza un videojuego existente.
   */
  actualizar(id: number, videojuego: Partial<Videojuego>): Observable<Videojuego[]> {
    return this.http.patch<Videojuego[]>(`${this.baseUrl}?id=eq.${id}`, videojuego, {
      headers: this.getHeaders()
    });
  }

  /**
   * Elimina un videojuego.
   */
  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}?id=eq.${id}`, {
      headers: this.getHeaders()
    });
  }
}
