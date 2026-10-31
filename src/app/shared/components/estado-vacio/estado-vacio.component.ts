import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IonButton, IonCard, IonCardContent } from '@ionic/angular';

/**
 * Presenta un estado vacío con una acción opcional.
 */
@Component({
  selector: 'app-estado-vacio',
  standalone: true,
  imports: [IonButton, IonCard, IonCardContent],
  templateUrl: './estado-vacio.component.html',
  styleUrl: './estado-vacio.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EstadoVacioComponent {
  readonly mensaje = input.required<string>();
  readonly textoAccion = input<string | null>(null);
  readonly accion = output<void>();
}
