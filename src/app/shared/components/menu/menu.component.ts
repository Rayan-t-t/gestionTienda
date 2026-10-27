import { Component, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  IonRouterOutlet
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { home, gameController, speedometer, informationCircle, logIn, logOut } from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Componente de menú lateral de navegación.
 */
@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonMenu,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonRouterOutlet
  ],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuComponent {
  readonly usuario = this.authService.usuarioActual;
  readonly esAdmin = computed(() => this.authService.esAdministrador());

  constructor(private authService: AuthService, private router: Router) {
    addIcons({ home, gameController, speedometer, informationCircle, logIn, logOut });
  }

  /**
   * Cierra sesión y redirige al login.
   */
  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
