import { UpperCasePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  effect,
  inject,
  OnInit,
  signal,
  viewChild
} from '@angular/core';
import type { Chart as ChartInstance } from 'chart.js';
import {
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonMenuButton,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar
} from '@ionic/angular';
import { Actividad, FirestoreService } from '../../core/services/firestore.service';
import { addIcons } from 'ionicons';
import { refresh } from 'ionicons/icons';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';

/**
 * Dashboard administrativo con resumen gráfico e historial de auditoría.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    UpperCasePipe,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonMenuButton,
    IonSpinner,
    IonText,
    IonTitle,
    IonToolbar,
    StatCardComponent
  ],
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPage implements OnInit {
  private readonly firestoreService = inject(FirestoreService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly canvas = viewChild<ElementRef<HTMLCanvasElement>>('graficoActividades');
  private chart: ChartInstance<'bar', number[], string> | null = null;
  private revisionGrafico = 0;

  readonly actividades = signal<Actividad[]>([]);
  readonly totalActividades = computed(() => this.actividades().length);
  readonly cargando = signal(false);
  readonly errorMensaje = signal<string | null>(null);

  constructor() {
    addIcons({ refresh });
    effect(() => {
      const canvas = this.canvas()?.nativeElement;
      const actividades = this.actividades();
      const cargando = this.cargando();
      if (canvas && !cargando) {
        void this.crearGrafico(canvas, actividades, ++this.revisionGrafico);
      }
    });
    this.destroyRef.onDestroy(() => this.chart?.destroy());
  }

  ngOnInit(): void {
    this.cargarActividades();
  }

  /**
   * Vuelve a cargar el historial desde la tarjeta de estadísticas.
   */
  recargarActividades(): void {
    this.cargarActividades();
  }

  private cargarActividades(): void {
    this.cargando.set(true);
    this.errorMensaje.set(null);
    this.firestoreService
      .obtenerActividades()
      .then((actividades) => this.actividades.set(actividades))
      .catch((error: unknown) => {
        console.error('No se pudo cargar el historial de actividades.', error);
        this.errorMensaje.set('No se pudo cargar el historial de actividades.');
      })
      .finally(() => this.cargando.set(false));
  }

  private async crearGrafico(
    canvas: HTMLCanvasElement,
    actividades: Actividad[],
    revision: number
  ): Promise<void> {
    const chartJs = await import('chart.js');
    if (revision !== this.revisionGrafico || !canvas.isConnected) {
      return;
    }

    chartJs.Chart.register(
      chartJs.BarController,
      chartJs.BarElement,
      chartJs.CategoryScale,
      chartJs.LinearScale,
      chartJs.Tooltip,
      chartJs.Legend
    );
    const conteo: Record<string, number> = {};
    for (const actividad of actividades) {
      conteo[actividad.tipo] = (conteo[actividad.tipo] ?? 0) + 1;
    }

    this.chart?.destroy();
    this.chart = new chartJs.Chart(canvas, {
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
          y: { beginAtZero: true }
        }
      }
    });
  }
}
