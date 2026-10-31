import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonApp } from '@ionic/angular/ion-app';
import { IonRouterOutlet } from '@ionic/angular/ion-router-outlet';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrl: 'app.component.scss',
  imports: [IonApp, IonRouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  /**
   * Mueve el foco al contenido principal sin cambiar la ruta actual.
   */
  saltarAlContenido(evento: Event): void {
    evento.preventDefault();
    document.getElementById('main-content')?.focus();
  }
}
