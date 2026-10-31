import { ChangeDetectionStrategy, Component, DestroyRef, afterNextRender, computed, effect, inject, input, signal, viewChild, ElementRef } from '@angular/core';
import type { Chart as ChartInstance } from 'chart.js';
import { VideojuegoInforme } from '../../../core/models/videojuego.model';
import { Actividad } from '../../../core/services/firestore.service';

interface ResumenGrafico {
  clave: string;
  cantidad: number;
}

const COLORES_GRAFICO = [
  '#4f9cf9',
  '#f59e0b',
  '#34d399',
  '#c084fc',
  '#fb7185',
  '#22d3ee',
  '#a3e635',
  '#f472b6'
];

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
  private readonly lienzoVentas = viewChild<ElementRef<HTMLCanvasElement>>('graficoVentas');
  private readonly vistaLista = signal(false);
  private revision = 0;
  private graficoGenero: ChartInstance<'doughnut', number[], string> | null = null;
  private graficoPlataforma: ChartInstance<'line', number[], string> | null = null;
  private graficoActividad: ChartInstance<'line', number[], string> | null = null;
  private graficoVentas: ChartInstance<'line', number[], string> | null = null;

  readonly videojuegos = input.required<readonly VideojuegoInforme[]>();
  readonly actividades = input.required<readonly Actividad[]>();

  readonly resumenGenero = computed(() => this.contar(this.videojuegos().map((juego) => juego.genero)));
  readonly resumenPlataforma = computed(() =>
    this.sumarStockPorPlataforma()
  );
  readonly resumenActividad = computed(() =>
    this.contar(this.actividades().map((actividad) => actividad.tipo))
  );
  readonly totalActividades = computed(() =>
    this.actividades().reduce((total, actividad) => total + (actividad.tipo ? 1 : 0), 0)
  );
  readonly actividadesHoy = computed(() => {
    const hoy = this.claveFecha(new Date());
    return this.actividades().filter(
      (actividad) => this.claveFecha(actividad.fecha.toDate()) === hoy
    ).length;
  });
  readonly tipoActividadFrecuente = computed(() => {
    const [frecuente] = [...this.resumenActividad()].sort(
      (a, b) => b.cantidad - a.cantidad || a.clave.localeCompare(b.clave, 'es')
    );
    return frecuente ? `${frecuente.clave} (${frecuente.cantidad})` : 'Sin actividad';
  });
  readonly ultimaActividad = computed(() => {
    const [actividad] = this.actividades();
    return actividad
      ? `${actividad.tipo} · ${actividad.fecha.toDate().toLocaleString('es-ES')}`
      : 'Sin actividad registrada';
  });
  readonly resumenVentasDiarias = computed(() =>
    this.agruparVentasPorDia(this.actividades())
  );

  constructor() {
    afterNextRender(() => this.vistaLista.set(true));
    effect(() => {
      const genero = this.resumenGenero();
      const plataforma = this.resumenPlataforma();
      const actividad = this.resumenActividad();
      const ventas = this.resumenVentasDiarias();
      if (this.vistaLista()) {
        void this.actualizarGraficos(genero, plataforma, actividad, ventas, ++this.revision);
      }
    });
    this.destroyRef.onDestroy(() => this.destruirGraficos());
  }

  private async actualizarGraficos(
    porGenero: readonly ResumenGrafico[],
    porPlataforma: readonly ResumenGrafico[],
    porActividad: readonly ResumenGrafico[],
    ventasDiarias: readonly ResumenGrafico[],
    revision: number
  ): Promise<void> {
    const chartJs = await import('chart.js');
    const canvasGenero = this.lienzoGenero()?.nativeElement;
    const canvasPlataforma = this.lienzoPlataforma()?.nativeElement;
    const canvasActividad = this.lienzoActividad()?.nativeElement;
    const canvasVentas = this.lienzoVentas()?.nativeElement;
    if (
      this.destroyRef.destroyed ||
      revision !== this.revision ||
      !canvasGenero?.isConnected ||
      !canvasPlataforma?.isConnected ||
      !canvasActividad?.isConnected ||
      !canvasVentas?.isConnected
    ) {
      return;
    }

    chartJs.Chart.register(
      chartJs.DoughnutController,
      chartJs.ArcElement,
      chartJs.Tooltip,
      chartJs.Legend
    );
    chartJs.Chart.register(
      chartJs.LineController,
      chartJs.LineElement,
      chartJs.PointElement,
      chartJs.CategoryScale,
      chartJs.LinearScale,
      chartJs.Filler
    );
    this.destruirGraficos();
    this.graficoGenero = new chartJs.Chart(canvasGenero, {
      type: 'doughnut',
      data: {
        labels: porGenero.map((elemento) => elemento.clave),
        datasets: [{
          label: 'Juegos',
          data: porGenero.map((elemento) => elemento.cantidad),
          backgroundColor: COLORES_GRAFICO,
          borderWidth: 2
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
    this.graficoPlataforma = new chartJs.Chart(canvasPlataforma, {
      type: 'line',
      data: {
        labels: porPlataforma.map((elemento) => elemento.clave),
        datasets: [{
          label: 'Unidades en stock',
          data: porPlataforma.map((elemento) => elemento.cantidad),
          borderColor: '#4f9cf9',
          backgroundColor: '#4f9cf9',
          pointBackgroundColor: '#4f9cf9',
          pointRadius: 6,
          pointHoverRadius: 9,
          borderWidth: 3,
          tension: 0.25,
          fill: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => `${context.parsed.y} unidades en stock`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false }
          },
          y: {
            beginAtZero: true,
            ticks: { precision: 0 },
            title: { display: true, text: 'Unidades en stock' }
          }
        }
      }
    });
    this.graficoActividad = new chartJs.Chart(canvasActividad, {
      type: 'line',
      data: {
        labels: porActividad.map((elemento) => elemento.clave),
        datasets: [
          {
          label: 'Actividades',
            data: porActividad.map((elemento) => elemento.cantidad),
            borderColor: '#c084fc',
            backgroundColor: '#c084fc',
            pointRadius: 6,
            pointHoverRadius: 9,
            borderWidth: 3,
            tension: 0.25,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => `${context.parsed.y} actividades`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { autoSkip: false, maxRotation: 45, minRotation: 0 }
          },
          y: {
            beginAtZero: true,
            ticks: { precision: 0 },
            title: { display: true, text: 'Número de actividades' }
          }
        }
      }
    });
    this.graficoVentas = new chartJs.Chart(canvasVentas, {
      type: 'line',
      data: {
        labels: ventasDiarias.map((elemento) => elemento.clave),
        datasets: [{
          label: 'Unidades vendidas',
          data: ventasDiarias.map((elemento) => elemento.cantidad),
          borderColor: '#34d399',
          borderWidth: 2,
          pointRadius: 2,
          pointHoverRadius: 5,
          pointBackgroundColor: '#34d399',
          tension: 0.3,
          fill: true,
          backgroundColor: (context) => {
            const area = context.chart.chartArea;
            if (!area) {
              return 'rgba(52, 211, 153, 0.08)';
            }
            const gradiente = context.chart.ctx.createLinearGradient(0, area.top, 0, area.bottom);
            gradiente.addColorStop(0, 'rgba(52, 211, 153, 0.28)');
            gradiente.addColorStop(1, 'rgba(52, 211, 153, 0.01)');
            return gradiente;
          }
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => `${context.parsed.y} unidades`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { maxTicksLimit: 10 }
          },
          y: {
            beginAtZero: true,
            ticks: { precision: 0 },
            title: { display: true, text: 'Unidades vendidas' }
          }
        }
      }
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

  private agruparVentasPorDia(actividades: readonly Actividad[]): ResumenGrafico[] {
    const hoy = new Date();
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 29);
    const ventas = new Map<string, number>();

    for (let dia = 0; dia < 30; dia += 1) {
      const fecha = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + dia);
      ventas.set(this.claveFecha(fecha), 0);
    }

    for (const actividad of actividades) {
      if (
        actividad.tipo !== 'venta' ||
        typeof actividad.unidadesVendidas !== 'number' ||
        !Number.isInteger(actividad.unidadesVendidas) ||
        actividad.unidadesVendidas < 1
      ) {
        continue;
      }

      const fecha = actividad.fecha.toDate();
      const clave = this.claveFecha(fecha);
      if (ventas.has(clave)) {
        ventas.set(clave, (ventas.get(clave) ?? 0) + actividad.unidadesVendidas);
      }
    }

    return [...ventas.entries()].map(([clave, cantidad]) => {
      const [anio, mes, dia] = clave.split('-').map(Number);
      const fecha = new Date(anio, mes - 1, dia);
      return {
        clave: new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short' }).format(fecha),
        cantidad
      };
    });
  }

  private claveFecha(fecha: Date): string {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }

  private destruirGraficos(): void {
    this.graficoGenero?.destroy();
    this.graficoPlataforma?.destroy();
    this.graficoActividad?.destroy();
    this.graficoVentas?.destroy();
    this.graficoGenero = null;
    this.graficoPlataforma = null;
    this.graficoActividad = null;
    this.graficoVentas = null;
  }
}
