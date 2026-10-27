import { Pipe, PipeTransform } from '@angular/core';
import { Videojuego } from '../../core/models/videojuego.model';

/**
 * Pipe para filtrar videojuegos por título, plataforma o género.
 */
@Pipe({
  name: 'filtroVideojuegos',
  standalone: true
})
export class FiltroVideojuegosPipe implements PipeTransform {
  /**
   * Filtra la lista de videojuegos según el texto de búsqueda.
   */
  transform(videojuegos: Videojuego[] | null, termino: string): Videojuego[] {
    if (!videojuegos) {
      return [];
    }
    if (!termino || termino.trim() === '') {
      return videojuegos;
    }
    const terminoLower = termino.toLowerCase().trim();
    return videojuegos.filter((videojuego) => {
      return (
        videojuego.titulo.toLowerCase().includes(terminoLower) ||
        videojuego.plataforma.toLowerCase().includes(terminoLower) ||
        videojuego.genero.toLowerCase().includes(terminoLower)
      );
    });
  }
}
