import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonButtons } from '@ionic/angular';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Muestra el saludo de la sesión activa y permite cerrarla.
 */
@Component({
  selector: 'app-control-sesion',
  standalone: true,
  imports: [IonButton, IonButtons],
  templateUrl: './control-sesion.component.html',
  styleUrl: './control-sesion.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ControlSesionComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly estaAutenticado = this.authService.estaAutenticado;
  readonly nombreUsuario = computed(
    () => this.authService.usuarioActual()?.email.split('@')[0] ?? ''
  );

  /**
   * Cierra la sesión actual y vuelve a la pantalla de acceso.
   */
  cerrarSesion(): void {
    this.authService.logout();
    void this.router.navigateByUrl('/login');
  }
}
