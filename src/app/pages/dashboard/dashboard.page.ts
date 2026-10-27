import { Component, ChangeDetectionStrategy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonMenuButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonSpinner
} from '@ionic/angular';
import { FirestoreService } from '../../core/services/firestore.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

/**
 * Página de dashboard para administradores con gráficos y actividades.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonMenuButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonSpinner
  ],
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPage implements OnInit {
  readonly actividades = signal<any[]>([]);
  readonly cargando = signal(false);

  constructor(private firestoreService: FirestoreService) {}

  async ngOnInit(): Promise<void> {
    this.cargando.set(true);
    const datos = await this.firestoreService.obtenerActividades();
    this.actividades.set(datos);
    this.cargando.set(false);
    this.crearGrafico();
  }

  private crearGrafico(): void {
    setTimeout(() => {
      const canvas = document.getElementById('graficoActividades') as HTMLCanvasElement;
      if (!canvas) {
        return;
      }
      const actividades = this.actividades();
      const conteo = actividades.reduce((acc: any, act) => {
        acc[act.tipo] = (acc[act.tipo] || 0) + 1;
        return acc;
      }, {});

      new Chart(canvas, {
        type: 'bar',
        data: {
          labels: Object.keys(conteo),
          datasets: [
            {
              label: 'Número de actividades',
              data: Object.values(conteo),
              backgroundColor: ['#3880ff', '#10dc60', '#ffce00', '#f04141']
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }, 100);
  }
}
