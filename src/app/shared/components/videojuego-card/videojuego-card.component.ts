import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DecimalPipe, NgOptimizedImage } from '@angular/common';
import { VideojuegoListado } from '../../../core/models/videojuego.model';

/**
 * Tarjeta visual del catálogo con portada y acciones accesibles.
 */
@Component({
  selector: 'app-videojuego-card',
  standalone: true,
  imports: [DecimalPipe, NgOptimizedImage],
  templateUrl: './videojuego-card.component.html',
  styleUrl: './videojuego-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VideojuegoCardComponent {
  readonly videojuego = input.required<VideojuegoListado>();
  readonly mostrarAcciones = input(false);
  readonly permitirCompra = input(false);

  readonly seleccionado = output<VideojuegoListado>();
  readonly editar = output<VideojuegoListado>();
  readonly eliminar = output<VideojuegoListado>();
  readonly anadirAlCarrito = output<VideojuegoListado>();
}
