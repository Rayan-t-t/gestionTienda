import { Component, ChangeDetectionStrategy } from '@angular/core';
import { IonHeader } from '@ionic/angular/ion-header';
import { IonToolbar } from '@ionic/angular/ion-toolbar';
import { IonTitle } from '@ionic/angular/ion-title';
import { IonContent } from '@ionic/angular/ion-content';
import { IonButton } from '@ionic/angular/ion-button';
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
