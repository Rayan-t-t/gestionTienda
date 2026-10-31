import { computed, Injectable, signal } from '@angular/core';
import { VideojuegoListado } from '../models/videojuego.model';

export type ArticuloCarrito = Omit<VideojuegoListado, 'id'> & {
  id: number;
  cantidad: number;
};

/**
 * Gestiona el carrito de la cuenta activa y lo conserva en este navegador.
 */
@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private readonly _articulos = signal<ArticuloCarrito[]>([]);
  private usuarioId: string | null = null;

  readonly articulos = computed(() => this._articulos());
  readonly cantidadTotal = computed(() =>
    this._articulos().reduce((total, articulo) => total + articulo.cantidad, 0)
  );
  readonly importeTotal = computed(() =>
    this._articulos().reduce(
      (total, articulo) => total + articulo.precio * articulo.cantidad,
      0
    )
  );

  /**
   * Carga el carrito asociado a una cuenta sin mezclarlo con otras sesiones.
   */
  sincronizarUsuario(usuarioId: string | null): void {
    if (this.usuarioId === usuarioId) {
      return;
    }

    this.usuarioId = usuarioId;
    this._articulos.set(usuarioId ? this.leerCarrito(usuarioId) : []);
  }

  /**
   * Añade un videojuego, sin superar el stock indicado por el catálogo.
   */
  agregar(videojuego: VideojuegoListado): void {
    if (this.usuarioId === null) {
      throw new Error('Inicia sesión para añadir productos al carrito.');
    }
    if (videojuego.id === undefined || !videojuego.disponible || videojuego.stock < 1) {
      throw new Error('Este videojuego no está disponible para añadir al carrito.');
    }

    const articulos = this._articulos();
    const existente = articulos.find((articulo) => articulo.id === videojuego.id);
    const cantidad = (existente?.cantidad ?? 0) + 1;
    if (cantidad > videojuego.stock) {
      throw new Error('No hay suficiente stock para añadir otra unidad.');
    }

    const nuevoArticulo: ArticuloCarrito = {
      id: videojuego.id,
      titulo: videojuego.titulo,
      precio: videojuego.precio,
      stock: videojuego.stock,
      plataforma: videojuego.plataforma,
      genero: videojuego.genero,
      disponible: videojuego.disponible,
      valoracion: videojuego.valoracion,
      portada_url: videojuego.portada_url,
      cantidad
    };

    this.guardar(
      existente
        ? articulos.map((articulo) =>
            articulo.id === videojuego.id ? nuevoArticulo : articulo
          )
        : [...articulos, nuevoArticulo]
    );
  }

  /**
   * Cambia la cantidad de una línea sin permitir cantidades no válidas.
   */
  establecerCantidad(id: number, cantidad: number): void {
    if (!Number.isInteger(cantidad) || cantidad < 1) {
      throw new Error('La cantidad debe ser un número entero mayor que cero.');
    }

    const articulo = this._articulos().find((elemento) => elemento.id === id);
    if (!articulo) {
      return;
    }
    if (cantidad > articulo.stock) {
      throw new Error(`Solo quedan ${articulo.stock} unidades de «${articulo.titulo}».`);
    }

    this.guardar(
      this._articulos().map((elemento) =>
        elemento.id === id ? { ...elemento, cantidad } : elemento
      )
    );
  }

  /**
   * Elimina una línea del carrito actual.
   */
  quitar(id: number): void {
    this.guardar(this._articulos().filter((articulo) => articulo.id !== id));
  }

  private guardar(articulos: ArticuloCarrito[]): void {
    if (this.usuarioId === null) {
      throw new Error('No hay una cuenta activa para guardar el carrito.');
    }

    localStorage.setItem(this.claveCarrito(this.usuarioId), JSON.stringify(articulos));
    this._articulos.set(articulos);
  }

  private leerCarrito(usuarioId: string): ArticuloCarrito[] {
    const clave = this.claveCarrito(usuarioId);
    const almacenado = localStorage.getItem(clave);
    if (almacenado === null) {
      return [];
    }

    try {
      const datos: unknown = JSON.parse(almacenado);
      if (!Array.isArray(datos) || !datos.every(this.esArticuloCarrito)) {
        throw new Error('El contenido guardado no tiene el formato esperado.');
      }
      return datos;
    } catch (error: unknown) {
      console.error('No se pudo recuperar el carrito guardado.', error);
      localStorage.removeItem(clave);
      return [];
    }
  }

  private esArticuloCarrito(valor: unknown): valor is ArticuloCarrito {
    if (typeof valor !== 'object' || valor === null) {
      return false;
    }
    const articulo = valor as Record<string, unknown>;
    const id = articulo['id'];
    const precio = articulo['precio'];
    const stock = articulo['stock'];
    const cantidad = articulo['cantidad'];
    const plataforma = articulo['plataforma'];
    const genero = articulo['genero'];
    const valoracion = articulo['valoracion'];
    const portadaUrl = articulo['portada_url'];
    return (
      typeof id === 'number' &&
      Number.isInteger(id) &&
      typeof articulo['titulo'] === 'string' &&
      typeof precio === 'number' &&
      Number.isFinite(precio) &&
      precio >= 0 &&
      typeof stock === 'number' &&
      Number.isInteger(stock) &&
      stock >= 0 &&
      typeof cantidad === 'number' &&
      Number.isInteger(cantidad) &&
      cantidad > 0 &&
      (plataforma === 'PC' ||
        plataforma === 'PS5' ||
        plataforma === 'Xbox' ||
        plataforma === 'Switch') &&
      (genero === 'RPG' ||
        genero === 'Accion' ||
        genero === 'Deportes' ||
        genero === 'Estrategia' ||
        genero === 'Aventura') &&
      typeof articulo['disponible'] === 'boolean' &&
      (valoracion === null ||
        valoracion === undefined ||
        (typeof valoracion === 'number' && valoracion >= 0 && valoracion <= 10)) &&
      (portadaUrl === null || portadaUrl === undefined || typeof portadaUrl === 'string')
    );
  }

  private claveCarrito(usuarioId: string): string {
    return `carrito:${usuarioId}`;
  }
}
