import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    sessionStorage.clear();
  });

  it('inicia sesión, guarda la sesión y obtiene el rol de app_metadata', () => {
    service = TestBed.inject(AuthService);
    let inicioSesionCompletado = false;
    service.login('admin@example.test', 'contraseña').subscribe(() => {
      inicioSesionCompletado = true;
    });

    const peticion = http.expectOne(`${environment.supabaseUrl}/auth/v1/token?grant_type=password`);
    expect(peticion.request.method).toBe('POST');
    expect(peticion.request.headers.get('apikey')).toBe(environment.supabaseAnonKey);
    expect(peticion.request.body).toEqual({
      email: 'admin@example.test',
      password: 'contraseña'
    });
    peticion.flush({
      access_token: crearToken(Math.floor(Date.now() / 1000) + 3600),
      refresh_token: 'refresh-token',
      user: {
        id: 'usuario-1',
        email: 'admin@example.test',
        app_metadata: { role: 'admin' }
      }
    });

    expect(inicioSesionCompletado).toBe(true);
    expect(service.usuarioActual()?.role).toBe('admin');
    expect(service.esAdministrador()).toBe(true);
    expect(service.estaAutenticado()).toBe(true);
    expect(JSON.parse(sessionStorage.getItem('usuario') ?? '{}').email).toBe(
      'admin@example.test'
    );
  });

  it('considera caducada una sesión cuyo JWT exp ya pasó', () => {
    sessionStorage.setItem(
      'usuario',
      JSON.stringify({
        id: 'usuario-2',
        email: 'usuario@example.test',
        role: 'user',
        access_token: crearToken(Math.floor(Date.now() / 1000) - 60),
        refresh_token: 'refresh-token'
      })
    );

    const servicioConTokenCaducado = TestBed.inject(AuthService);
    expect(servicioConTokenCaducado.usuarioActual()).not.toBeNull();
    expect(servicioConTokenCaducado.estaAutenticado()).toBe(false);
    expect(servicioConTokenCaducado.esAdministrador()).toBe(false);
  });
});

function crearToken(expiracion: number): string {
  return `header.${btoa(JSON.stringify({ exp: expiracion }))}.signature`;
}
