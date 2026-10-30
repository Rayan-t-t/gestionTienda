import { Component, ChangeDetectionStrategy } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { ControlSesionComponent } from '../shared/components/control-sesion/control-sesion.component';
import { NavegacionPrincipalComponent } from '../shared/components/navegacion-principal/navegacion-principal.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    RouterLink,
    ControlSesionComponent,
    NavegacionPrincipalComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePage {
  constructor() {}
}
