import { Component, ChangeDetectionStrategy } from '@angular/core';
import { IonApp, IonRouterOutlet, IonSplitPane } from '@ionic/angular';
import { MenuComponent } from './shared/components/menu/menu.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, IonSplitPane, MenuComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  constructor() {}
}
