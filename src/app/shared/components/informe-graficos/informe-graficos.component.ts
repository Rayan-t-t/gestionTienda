import { ChangeDetectionStrategy, Component, DestroyRef, afterNextRender, computed, effect, inject, input, signal, viewChild, ElementRef } from '@angular/core';
import type { Chart as ChartInstance } from 'chart.js';
import { VideojuegoInforme } from '../../../core/models/videojuego.model';

interface ResumenGrafico {
  clave: string;
  cantidad: number;
}

/**
 * Presenta los gráficos de videojuegos y actividad para el dashboard.
 */
@Component({
  selector: 'app-informe-graficos',
  standalone: true,
  templateUrl: './informe-graficos.component.html',
  styleUrl: './informe-graficos.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InformeGraficosComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly lienzoGenero = viewChild<ElementRef<HTMLCanvasElement>>('graficoGenero');
  private readonly lienzoPlataforma = viewChild<ElementRef<HTMLCanvasElement>>('graficoPlataforma');
  private readonly lienzoActividad = viewChild<ElementRef<HTMLCanvasElement>>('graficoActividad');
  private readonly vistaLista = signal(false);
  private revision = 0;
  private graficoGenero: ChartInstance<'doughnut', number[], string> | null = null;
  private graficoPlataforma: ChartInstance<'bar', number[], string> | null = null;
  private graficoActividad: ChartInstance<'bar', number[], string> | null = null;

  readonly videojuegos = input.required<readonly VideojuegoInforme[]>();
  readonly actividades = input.required<readonly { tipo: string }[]>();

  readonly resumenGenero = computed(() => this.contar(this.videojuegos().map((juego) => juego.genero)));
  readonly resumenPlataforma = computed(() =>
    this.sumarStockPorPlataforma()
  );
  readonly resumenActividad = computed(() =>
    this.contar(this.actividades().map((actividad) => actividad.tipo))
  );

  constructor() {
    afterNextRender(() => this.vistaLista.set(true));
    effect(() => {
      const genero = this.resumenGenero();
      const plataforma = this.resumenPlataforma();
      const actividad = this.resumenActividad();
      if (this.vistaLista()) {
        void this.actualizarGraficos(genero, plataforma, actividad, ++this.revision);
      }
    });
    this.destroyRef.onDestroy(() => this.destruirGraficos());
  }

  private async actualizarGraficos(
    porGenero: readonly ResumenGrafico[],
    porPlataforma: readonly ResumenGrafico[],
    porActividad: readonly ResumenGrafico[],
    revision: number
  ): Promise<void> {
    const chartJs = await import('chart.js');
    const canvasGenero = this.lienzoGenero()?.nativeElement;
    const canvasPlataforma = this.lienzoPlataforma()?.nativeElement;
    const canvasActividad = this.lienzoActividad()?.nativeElement;
    if (
      this.destroyRef.destroyed ||
      revision !== this.revision ||
      !canvasGenero?.isConnected ||
      !canvasPlataforma?.isConnected ||
      !canvasActividad?.isConnected
    ) {
      return;
    }

    chartJs.Chart.register(
      chartJs.DoughnutController,
      chartJs.ArcElement,
      chartJs.BarController,
      chartJs.BarElement,
      chartJs.CategoryScale,
      chartJs.LinearScale,
      chartJs.Tooltip,
      chartJs.Legend
    );
    this.destruirGraficos();
    this.graficoGenero = new chartJs.Chart(canvasGenero, {
      type: 'doughnut',
      data: {
        labels: porGenero.map((elemento) => elemento.clave),
        datasets: [{ label: 'Juegos', data: porGenero.map((elemento) => elemento.cantidad) }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
    this.graficoPlataforma = new chartJs.Chart(canvasPlataforma, {
      type: 'bar',
      data: {
        labels: porPlataforma.map((elemento) => elemento.clave),
        datasets: [{ label: 'Stock', data: porPlataforma.map((elemento) => elemento.cantidad) }]
      },
      options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
    });
    this.graficoActividad = new chartJs.Chart(canvasActividad, {
      type: 'bar',
      data: {
        labels: porActividad.map((elemento) => elemento.clave),
        datasets: [
          { label: 'Actividades', data: porActividad.map((elemento) => elemento.cantidad) }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
    });
  }

  private contar(valores: readonly string[]): ResumenGrafico[] {
    const conteo = new Map<string, number>();
    for (const valor of valores) {
      conteo.set(valor, (conteo.get(valor) ?? 0) + 1);
    }
    return [...conteo.entries()]
      .sort(([a], [b]) => a.localeCompare(b, 'es'))
      .map(([clave, cantidad]) => ({ clave, cantidad }));
  }

  private sumarStockPorPlataforma(): ResumenGrafico[] {
    const stock = new Map<string, number>();
    for (const videojuego of this.videojuegos()) {
      stock.set(
        videojuego.plataforma,
        (stock.get(videojuego.plataforma) ?? 0) + videojuego.stock
      );
    }
    return [...stock.entries()]
      .sort(([a], [b]) => a.localeCompare(b, 'es'))
      .map(([clave, cantidad]) => ({ clave, cantidad }));
  }

  private destruirGraficos(): void {
    this.graficoGenero?.destroy();
    this.graficoPlataforma?.destroy();
    this.graficoActividad?.destroy();
    this.graficoGenero = null;
    this.graficoPlataforma = null;
    this.graficoActividad = null;
  }
}
