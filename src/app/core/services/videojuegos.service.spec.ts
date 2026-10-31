import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { VideojuegosService } from './videojuegos.service';

describe('VideojuegosService', () => {
  let service: VideojuegosService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(VideojuegosService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('finaliza el carrito llamando a la RPC atómica de Supabase', () => {
    let completado = false;
    service.finalizarCompra([
      { id: 12, cantidad: 2 },
      { id: 21, cantidad: 1 }
    ]).subscribe(() => {
      completado = true;
    });

    const peticion = http.expectOne(
      `${environment.supabaseUrl}/rest/v1/rpc/finalizar_compra`
    );
    expect(peticion.request.method).toBe('POST');
    expect(peticion.request.body).toEqual({
      p_articulos: [
        { id: 12, cantidad: 2 },
        { id: 21, cantidad: 1 }
      ]
    });
    peticion.flush(true);

    expect(completado).toBe(true);
  });

  it('rechaza cantidades y productos duplicados antes de llamar a Supabase', () => {
    let mensajeError = '';
    service.finalizarCompra([
      { id: 12, cantidad: 1 },
      { id: 12, cantidad: 2 }
    ]).subscribe({
      error: (error: unknown) => {
        mensajeError = error instanceof Error ? error.message : '';
      }
    });

    expect(mensajeError).toBe('El carrito contiene productos o cantidades no válidos.');
    http.expectNone(`${environment.supabaseUrl}/rest/v1/rpc/finalizar_compra`);
  });

  it('propaga el error devuelto por la RPC y conserva el fallo del pedido', () => {
    let mensajeError = '';
    service.finalizarCompra([{ id: 12, cantidad: 3 }]).subscribe({
      error: (error: unknown) => {
        mensajeError = error instanceof Error ? error.message : '';
      }
    });

    http.expectOne(`${environment.supabaseUrl}/rest/v1/rpc/finalizar_compra`).flush(
      { message: 'Producto no disponible o stock insuficiente.' },
      { status: 400, statusText: 'Bad Request' }
    );

    expect(mensajeError).toBe('Producto no disponible o stock insuficiente.');
  });
});
