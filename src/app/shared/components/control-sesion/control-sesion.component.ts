import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonBadge } from '@ionic/angular/ion-badge';
import { IonButton } from '@ionic/angular/ion-button';
import { IonButtons } from '@ionic/angular/ion-buttons';
import { IonIcon } from '@ionic/angular/ion-icon';
import { addIcons } from 'ionicons';
import { cartOutline, moonOutline, sunnyOutline } from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';
import { CarritoService } from '../../../core/services/carrito.service';
import { TemaService } from '../../../core/services/tema.service';

/**
 * Muestra el saludo de la sesión activa, el cambio de tema y permite cerrarla.
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
  private readonly temaService = inject(TemaService);

  readonly estaAutenticado = this.authService.estaAutenticado;
  readonly cantidadCarrito = this.carritoService.cantidadTotal;
  readonly temaOscuro = this.temaService.oscuro;
  readonly nombreUsuario = computed(
    () => this.authService.usuarioActual()?.email.split('@')[0] ?? ''
  );

  constructor() {
    addIcons({ cartOutline, moonOutline, sunnyOutline });
    this.carritoService.sincronizarUsuario(this.authService.usuarioActual()?.id ?? null);
  }

  /**
   * Alterna entre el modo claro y el modo oscuro.
   */
  alternarTema(): void {
    this.temaService.alternar();
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
