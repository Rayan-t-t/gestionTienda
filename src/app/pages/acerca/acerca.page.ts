import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent
} from '@ionic/angular';
import { ControlSesionComponent } from '../../shared/components/control-sesion/control-sesion.component';
import { NavegacionPrincipalComponent } from '../../shared/components/navegacion-principal/navegacion-principal.component';

/**
 * Página Acerca de la aplicación.
 */
@Component({
  selector: 'app-acerca',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    ControlSesionComponent,
    NavegacionPrincipalComponent
  ],
  templateUrl: './acerca.page.html',
  styleUrls: ['./acerca.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AcercaPage {}
