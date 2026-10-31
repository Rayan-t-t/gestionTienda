import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonBadge, IonButton, IonButtons, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { cartOutline } from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';
import { CarritoService } from '../../../core/services/carrito.service';

/**
 * Muestra el saludo de la sesión activa y permite cerrarla.
 */
@Component({
  selector: 'app-control-sesion',
  standalone: true,
  imports: [IonBadge, IonButton, IonButtons, IonIcon],
  templateUrl: './control-sesion.component.html',
  styleUrl: './control-sesion.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ControlSesionComponent {
  private readonly authService = inject(AuthService);
  private readonly carritoService = inject(CarritoService);
  private readonly router = inject(Router);

  readonly estaAutenticado = this.authService.estaAutenticado;
  readonly cantidadCarrito = this.carritoService.cantidadTotal;
  readonly nombreUsuario = computed(
    () => this.authService.usuarioActual()?.email.split('@')[0] ?? ''
  );

  constructor() {
    addIcons({ cartOutline });
    this.carritoService.sincronizarUsuario(this.authService.usuarioActual()?.id ?? null);
  }

  abrirCarrito(): void {
    void this.router.navigateByUrl('/carrito');
  }

  /**
   * Cierra la sesión actual y vuelve a la pantalla de acceso.
   */
  cerrarSesion(): void {
    this.carritoService.sincronizarUsuario(null);
    this.authService.logout();
    void this.router.navigateByUrl('/login');
  }
}
