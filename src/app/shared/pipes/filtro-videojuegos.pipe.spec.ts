import { FiltroVideojuegosPipe } from './filtro-videojuegos.pipe';
import { VideojuegoListado } from '../../core/models/videojuego.model';

describe('FiltroVideojuegosPipe', () => {
  const pipe = new FiltroVideojuegosPipe();
  const videojuegos: VideojuegoListado[] = [
    {
      id: 1,
      titulo: 'Aventura Galáctica',
      precio: 49.99,
      stock: 4,
      plataforma: 'PC',
      genero: 'Aventura',
      disponible: true
    },
    {
      id: 2,
      titulo: 'Cancha Total',
      precio: 39.99,
      stock: 2,
      plataforma: 'PS5',
      genero: 'Deportes',
      disponible: true
    }
  ];

  it('filtra por título sin distinguir mayúsculas', () => {
    expect(pipe.transform(videojuegos, 'galáctica')).toEqual([videojuegos[0]]);
  });

  it('filtra por plataforma o género y devuelve todo si no hay búsqueda', () => {
    expect(pipe.transform(videojuegos, 'ps5')).toEqual([videojuegos[1]]);
    expect(pipe.transform(videojuegos, 'deportes')).toEqual([videojuegos[1]]);
    expect(pipe.transform(videojuegos, '  ')).toBe(videojuegos);
    expect(pipe.transform(null, 'pc')).toEqual([]);
  });
});
