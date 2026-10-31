import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonButton } from '@ionic/angular/ion-button';
import { IonToolbar } from '@ionic/angular/ion-toolbar';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Navegación horizontal entre las pantallas disponibles para la sesión.
 */
@Component({
  selector: 'app-navegacion-principal',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IonButton, IonToolbar],
  templateUrl: './navegacion-principal.component.html',
  styleUrl: './navegacion-principal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavegacionPrincipalComponent {
  private readonly authService = inject(AuthService);

  readonly estaAutenticado = this.authService.estaAutenticado;
  readonly puedeGestionar = this.authService.puedeGestionar;
}
