import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonApp, IonRouterOutlet, IonSplitPane } from '@ionic/angular';
import { MenuComponent } from './shared/components/menu/menu.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrl: 'app.component.scss',
  imports: [IonApp, IonRouterOutlet, IonSplitPane, MenuComponent],
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
