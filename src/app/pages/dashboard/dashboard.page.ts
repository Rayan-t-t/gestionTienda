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
import { IonButton } from '@ionic/angular/ion-button';
import { IonCard } from '@ionic/angular/ion-card';
import { IonCardContent } from '@ionic/angular/ion-card-content';
import { IonCardHeader } from '@ionic/angular/ion-card-header';
import { IonCardTitle } from '@ionic/angular/ion-card-title';
import { IonContent } from '@ionic/angular/ion-content';
import { IonCol } from '@ionic/angular/ion-col';
import { IonGrid } from '@ionic/angular/ion-grid';
import { IonHeader } from '@ionic/angular/ion-header';
import { IonItem } from '@ionic/angular/ion-item';
import { IonLabel } from '@ionic/angular/ion-label';
import { IonList } from '@ionic/angular/ion-list';
import { IonSpinner } from '@ionic/angular/ion-spinner';
import { IonText } from '@ionic/angular/ion-text';
import { IonRow } from '@ionic/angular/ion-row';
import { IonTitle } from '@ionic/angular/ion-title';
import { IonToolbar } from '@ionic/angular/ion-toolbar';
import { addIcons } from 'ionicons';
import { cash, cube, gameController, star } from 'ionicons/icons';
import { from } from 'rxjs';
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
  readonly cargandoVideojuegos = signal(false);
  readonly cargandoActividades = signal(false);
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
   * Lanza en paralelo las dos fuentes. Cada una pinta su parte en cuanto llega,
   * sin esperar a la otra.
   */
  cargarDatos(): void {
    this.cargarVideojuegos();
    this.cargarActividades();
  }

  /**
   * Carga los videojuegos (Supabase) para las tarjetas y los gráficos del catálogo.
   */
  cargarVideojuegos(): void {
    this.cargandoVideojuegos.set(true);
    this.errorVideojuegos.set(null);

    this.videojuegosService
      .obtenerParaInforme()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (datos) => {
          this.videojuegos.set(datos);
          this.cargandoVideojuegos.set(false);
        },
        error: (error: unknown) => {
          this.errorVideojuegos.set(
            error instanceof Error ? error.message : 'No se pudieron cargar los videojuegos.'
          );
          this.cargandoVideojuegos.set(false);
        }
      });
  }

  /**
   * Carga el historial de actividades (Firestore) de forma independiente.
   */
  cargarActividades(): void {
    this.cargandoActividades.set(true);
    this.errorActividades.set(null);

    from(this.firestoreService.obtenerActividades(500))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (datos) => {
          this.actividades.set(datos);
          this.cargandoActividades.set(false);
        },
        error: (error: unknown) => {
          this.errorActividades.set(
            error instanceof Error ? error.message : 'No se pudieron cargar las actividades.'
          );
          this.cargandoActividades.set(false);
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
