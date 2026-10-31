import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonCard } from '@ionic/angular/ion-card';
import { IonCardContent } from '@ionic/angular/ion-card-content';
import { IonCardHeader } from '@ionic/angular/ion-card-header';
import { IonCardTitle } from '@ionic/angular/ion-card-title';
import { IonCol } from '@ionic/angular/ion-col';
import { IonContent } from '@ionic/angular/ion-content';
import { IonGrid } from '@ionic/angular/ion-grid';
import { IonHeader } from '@ionic/angular/ion-header';
import { IonRow } from '@ionic/angular/ion-row';
import { IonTitle } from '@ionic/angular/ion-title';
import { IonToolbar } from '@ionic/angular/ion-toolbar';
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
