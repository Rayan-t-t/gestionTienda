import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IonCard } from '@ionic/angular/ion-card';
import { IonCardContent } from '@ionic/angular/ion-card-content';
import { IonIcon } from '@ionic/angular/ion-icon';

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
