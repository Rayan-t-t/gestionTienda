import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonRow,
  IonTitle,
  IonToolbar
} from '@ionic/angular';
import { ControlSesionComponent } from '../../shared/components/control-sesion/control-sesion.component';
import { NavegacionPrincipalComponent } from '../../shared/components/navegacion-principal/navegacion-principal.component';

/**
 * Página placeholder de ayuda.
 */
@Component({
  selector: 'app-ayuda',
  standalone: true,
  imports: [
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonRow,
    IonTitle,
    IonToolbar,
    ControlSesionComponent,
    NavegacionPrincipalComponent
  ],
  templateUrl: './ayuda.page.html',
  styleUrl: './ayuda.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AyudaPage {}
