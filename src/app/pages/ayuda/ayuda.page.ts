import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonButtons, IonContent, IonHeader, IonMenuButton, IonTitle, IonToolbar } from '@ionic/angular';

/**
 * Página placeholder de ayuda.
 */
@Component({
  selector: 'app-ayuda',
  standalone: true,
  imports: [IonButtons, IonContent, IonHeader, IonMenuButton, IonTitle, IonToolbar],
  templateUrl: './ayuda.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AyudaPage {}
