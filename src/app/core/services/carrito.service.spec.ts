import { TestBed } from '@angular/core/testing';
import { VideojuegoListado } from '../models/videojuego.model';
import { CarritoService } from './carrito.service';

describe('CarritoService', () => {
  let service: CarritoService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(CarritoService);
    service.sincronizarUsuario('usuario-1');
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('suma cantidades e importe y persiste el carrito de la cuenta activa', () => {
    service.agregar(crearVideojuego());
    service.agregar(crearVideojuego());

    expect(service.cantidadTotal()).toBe(2);
    expect(service.importeTotal()).toBe(39.98);
    expect(service.articulos()[0].cantidad).toBe(2);
    expect(JSON.parse(localStorage.getItem('carrito:usuario-1') ?? '[]')[0].cantidad).toBe(2);
  });

  it('mantiene carritos separados y recupera el de la cuenta al volver a ella', () => {
    service.agregar(crearVideojuego());
    service.sincronizarUsuario('usuario-2');

    expect(service.articulos()).toEqual([]);
    service.agregar({ ...crearVideojuego(), id: 8, titulo: 'Otro juego' });
    service.sincronizarUsuario('usuario-1');

    expect(service.articulos().map((articulo) => articulo.titulo)).toEqual(['Juego de prueba']);
  });

  it('no permite añadir más unidades que el stock disponible', () => {
    const videojuego = crearVideojuego();
    service.agregar(videojuego);
    service.agregar(videojuego);

    expect(() => service.agregar(videojuego)).toThrowError(
      'No hay suficiente stock para añadir otra unidad.'
    );
    expect(service.articulos()[0].cantidad).toBe(2);
  });
});

function crearVideojuego(): VideojuegoListado {
  return {
    id: 7,
    titulo: 'Juego de prueba',
    precio: 19.99,
    stock: 2,
    plataforma: 'PC',
    genero: 'RPG',
    disponible: true,
    valoracion: 8,
    portada_url: null
  };
}
