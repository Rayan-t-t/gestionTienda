import { UpperCasePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonCol,
  IonGrid,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonSpinner,
  IonText,
  IonRow,
  IonTitle,
  IonToolbar
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { cash, cube, gameController, star } from 'ionicons/icons';
import { forkJoin, from, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  VideojuegoInforme,
  Videojuego
} from '../../core/models/videojuego.model';
import { Actividad, FirestoreService } from '../../core/services/firestore.service';
import { VideojuegosService } from '../../core/services/videojuegos.service';
import { InformeGraficosComponent } from '../../shared/components/informe-graficos/informe-graficos.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { ControlSesionComponent } from '../../shared/components/control-sesion/control-sesion.component';
import { NavegacionPrincipalComponent } from '../../shared/components/navegacion-principal/navegacion-principal.component';

type Plataforma = Videojuego['plataforma'];
type Genero = Videojuego['genero'];

const PLATAFORMAS: readonly Plataforma[] = ['PC', 'PS5', 'Xbox', 'Switch'];
const GENEROS: readonly Genero[] = ['RPG', 'Accion', 'Deportes', 'Estrategia', 'Aventura'];

/**
 * Dashboard administrativo con métricas, gráficos e historial de auditoría.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    UpperCasePipe,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonCol,
    IonGrid,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonSpinner,
    IonText,
    IonRow,
    IonTitle,
    IonToolbar,
    InformeGraficosComponent,
    StatCardComponent,
    ControlSesionComponent,
    NavegacionPrincipalComponent
  ],
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPage implements OnInit {
  private readonly videojuegosService = inject(VideojuegosService);
  private readonly firestoreService = inject(FirestoreService);
  private readonly destroyRef = inject(DestroyRef);

  readonly videojuegos = signal<VideojuegoInforme[]>([]);
  readonly actividades = signal<Actividad[]>([]);
  readonly actividadesRecientes = computed(() => this.actividades().slice(0, 200));
  readonly cargando = signal(false);
  readonly errorVideojuegos = signal<string | null>(null);
  readonly errorActividades = signal<string | null>(null);
  readonly filtroPlataforma = signal<Plataforma | ''>('');
  readonly filtroGenero = signal<Genero | ''>('');
  readonly plataformas = PLATAFORMAS;
  readonly generos = GENEROS;

  readonly videojuegosFiltrados = computed(() =>
    this.videojuegos().filter(
      (juego) =>
        (!this.filtroPlataforma() || juego.plataforma === this.filtroPlataforma()) &&
        (!this.filtroGenero() || juego.genero === this.filtroGenero())
    )
  );
  readonly totalJuegos = computed(() => this.videojuegosFiltrados().length);
  readonly stockTotal = computed(() =>
    this.videojuegosFiltrados().reduce((total, juego) => total + juego.stock, 0)
  );
  readonly valorInventario = computed(() =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(
      this.videojuegosFiltrados().reduce(
        (total, juego) => total + juego.precio * juego.stock,
        0
      )
    )
  );
  readonly valoracionMedia = computed(() => {
    const valoraciones = this.videojuegosFiltrados()
      .map((juego) => juego.valoracion)
      .filter((valoracion): valoracion is number => valoracion !== null && valoracion !== undefined);
    if (valoraciones.length === 0) {
      return '0,0 / 10';
    }
    const media = valoraciones.reduce((total, valoracion) => total + valoracion, 0) / valoraciones.length;
    return `${media.toLocaleString('es-ES', { maximumFractionDigits: 1 })} / 10`;
  });

  constructor() {
    addIcons({ cash, cube, gameController, star });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  /**
   * Carga en paralelo las fuentes del dashboard y conserva el error de cada una.
   */
  cargarDatos(): void {
    this.cargando.set(true);
    this.errorVideojuegos.set(null);
    this.errorActividades.set(null);

    forkJoin({
      videojuegos: this.videojuegosService.obtenerParaInforme().pipe(
        catchError((error: unknown) => {
          this.errorVideojuegos.set(
            error instanceof Error ? error.message : 'No se pudieron cargar los videojuegos.'
          );
          return of<VideojuegoInforme[]>([]);
        })
      ),
      actividades: from(this.firestoreService.obtenerActividades(500)).pipe(
        catchError((error: unknown) => {
          this.errorActividades.set(
            error instanceof Error ? error.message : 'No se pudieron cargar las actividades.'
          );
          return of<Actividad[]>([]);
        })
      )
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (datos) => {
          this.videojuegos.set(datos.videojuegos);
          this.actividades.set(datos.actividades);
          this.cargando.set(false);
        },
        error: (error: unknown) => {
          console.error('No se pudo completar la carga del dashboard.', error);
          this.cargando.set(false);
        }
      });
  }

  /**
   * Cambia el filtro de plataforma usado por las tarjetas y los gráficos.
   */
  cambiarPlataforma(evento: Event): void {
    const valor = (evento.target as HTMLSelectElement).value;
    this.filtroPlataforma.set(PLATAFORMAS.find((plataforma) => plataforma === valor) ?? '');
  }

  /**
   * Cambia el filtro de género usado por las tarjetas y los gráficos.
   */
  cambiarGenero(evento: Event): void {
    const valor = (evento.target as HTMLSelectElement).value;
    this.filtroGenero.set(GENEROS.find((genero) => genero === valor) ?? '');
  }
}
