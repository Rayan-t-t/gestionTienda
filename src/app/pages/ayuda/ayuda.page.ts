import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonMenuButton,
  IonRow,
  IonTitle,
  IonToolbar
} from '@ionic/angular';

/**
 * Página placeholder de ayuda.
 */
@Component({
  selector: 'app-ayuda',
  standalone: true,
  imports: [
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonMenuButton,
    IonRow,
    IonTitle,
    IonToolbar
  ],
  templateUrl: './ayuda.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AyudaPage {}
