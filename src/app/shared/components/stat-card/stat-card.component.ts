import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IonCard, IonCardContent, IonIcon } from '@ionic/angular';

/**
 * Tarjeta compacta para mostrar una métrica y su tendencia.
 */
@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [IonCard, IonCardContent, IonIcon],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatCardComponent {
  readonly titulo = input.required<string>();
  readonly valor = input.required<string | number>();
  readonly icono = input.required<string>();
  readonly tendencia = input<string | null>(null);
  readonly pulsado = output<void>();
}
