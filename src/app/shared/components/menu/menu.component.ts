import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  gameController,
  helpCircle,
  informationCircle,
  logIn,
  logOut,
  speedometer
} from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Componente de menú lateral de navegación.
 */
@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    RouterLink,
    IonMenu,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon
  ],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly estaAutenticado = this.authService.estaAutenticado;
  readonly esAdmin = computed(() => this.authService.esAdministrador());

  constructor() {
    addIcons({ gameController, helpCircle, speedometer, informationCircle, logIn, logOut });
  }

  /**
   * Cierra sesión y redirige al login.
   */
  cerrarSesion(): void {
    this.authService.logout();
    void this.router.navigateByUrl('/login');
  }
}
