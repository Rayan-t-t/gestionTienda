import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import {
  AlertController,
  IonButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonMenuButton,
  IonSpinner,
  IonTitle,
  IonToolbar
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { FirestoreService } from '../../core/services/firestore.service';
import { VideojuegosService } from '../../core/services/videojuegos.service';
import { VideojuegoListado } from '../../core/models/videojuego.model';
import {
  ColumnaTabla,
  DataTableComponent
} from '../../shared/components/data-table/data-table.component';
import { EstadoVacioComponent } from '../../shared/components/estado-vacio/estado-vacio.component';

/**
 * Página de catálogo paginado de videojuegos.
 */
@Component({
  selector: 'app-videojuegos',
  standalone: true,
  imports: [
    IonButton,
    IonButtons,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonMenuButton,
    IonSpinner,
    IonTitle,
    IonToolbar,
    DataTableComponent,
    EstadoVacioComponent
  ],
  templateUrl: './videojuegos.page.html',
  styleUrls: ['./videojuegos.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VideojuegosPage {
  private readonly videojuegosService = inject(VideojuegosService);
  private readonly authService = inject(AuthService);
  private readonly firestoreService = inject(FirestoreService);
  private readonly alertController = inject(AlertController);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly cambiosBusqueda = new Subject<string>();
  private readonly limitePagina = 50;
  private solicitudCatalogo = 0;

  readonly columnas: readonly ColumnaTabla[] = [
    { clave: 'titulo', etiqueta: 'Título', ordenable: true },
    { clave: 'precio', etiqueta: 'Precio (€)', ordenable: true },
    { clave: 'stock', etiqueta: 'Stock', ordenable: true },
    { clave: 'plataforma', etiqueta: 'Plataforma', ordenable: true },
    { clave: 'genero', etiqueta: 'Género', ordenable: true },
    { clave: 'disponible', etiqueta: 'Disponible', ordenable: true }
  ];
  readonly videojuegos = signal<VideojuegoListado[]>([]);
  readonly cargando = signal(false);
  readonly errorMensaje = signal<string | null>(null);
  readonly terminoBusqueda = signal('');
  readonly offset = signal(0);
  readonly esAdministrador = this.authService.esAdministrador;
  readonly puedeAvanzar = signal(false);

  constructor() {
    addIcons({ add });
    this.cambiosBusqueda
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((termino) => {
        this.terminoBusqueda.set(termino);
        this.cargarVideojuegos(0, termino);
      });
  }

  ionViewWillEnter(): void {
    this.cargarVideojuegos(0);
  }

  /**
   * Solicita una página del catálogo.
   */
  cargarVideojuegos(offset = this.offset(), busqueda = this.terminoBusqueda()): void {
    const solicitud = ++this.solicitudCatalogo;
    this.cargando.set(true);
    this.errorMensaje.set(null);
    this.videojuegosService
      .obtenerTodos(offset, this.limitePagina, busqueda)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (datos) => {
          if (solicitud !== this.solicitudCatalogo) {
            return;
          }
          this.videojuegos.set(datos);
          this.offset.set(offset);
          this.puedeAvanzar.set(datos.length === this.limitePagina);
          this.cargando.set(false);
        },
        error: (error: unknown) => {
          if (solicitud !== this.solicitudCatalogo) {
            return;
          }
          this.errorMensaje.set(
            error instanceof Error ? error.message : 'No se pudo cargar el catálogo.'
          );
          this.cargando.set(false);
        }
      });
  }

  /**
   * Actualiza el término que será aplicado tras la pausa de escritura.
   */
  buscar(termino: string): void {
    this.cambiosBusqueda.next(termino.trim());
  }

  abrirDetalle(videojuego: VideojuegoListado): void {
    if (videojuego.id !== undefined) {
      void this.router.navigate(['/videojuegos', videojuego.id]);
    }
  }

  editarVideojuego(videojuego: VideojuegoListado): void {
    if (videojuego.id !== undefined) {
      void this.router.navigate(['/videojuegos/editar', videojuego.id]);
    }
  }

  avanzarPagina(): void {
    if (this.puedeAvanzar()) {
      this.cargarVideojuegos(this.offset() + this.limitePagina);
    }
  }

  retrocederPagina(): void {
    if (this.offset() > 0) {
      this.cargarVideojuegos(Math.max(0, this.offset() - this.limitePagina));
    }
  }

  /**
   * Solicita confirmación antes de eliminar un videojuego.
   */
  async confirmarEliminacion(videojuego: VideojuegoListado): Promise<void> {
    const alerta = await this.alertController.create({
      header: 'Eliminar videojuego',
      message: `¿Quieres eliminar «${videojuego.titulo}»? Esta acción no se puede deshacer.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => this.eliminarVideojuego(videojuego)
        }
      ]
    });
    await alerta.present();
  }

  /**
   * Exporta el catálogo visible a CSV.
   */
  exportarCSV(): void {
    const cabecera = 'id,titulo,precio,stock,plataforma,genero,disponible';
    const filas = this.videojuegos().map((videojuego) =>
      [
        videojuego.id,
        this.escaparCSV(videojuego.titulo),
        videojuego.precio,
        videojuego.stock,
        videojuego.plataforma,
        videojuego.genero,
        videojuego.disponible
      ].join(',')
    );
    this.descargarArchivo([cabecera, ...filas].join('\n'), 'videojuegos.csv', 'text/csv');
    this.registrarActividad('exportar', 'Exportación del catálogo a CSV');
  }

  /**
   * Genera un PDF con los videojuegos de la página actual.
   */
  async exportarPDF(): Promise<void> {
    const [{ default: JsPDF }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]);
    const documento = new JsPDF();
    documento.text('Listado de videojuegos', 14, 15);
    autoTable(documento, {
      head: [['ID', 'Título', 'Precio', 'Stock', 'Plataforma', 'Género', 'Disponible']],
      body: this.videojuegos().map((videojuego) => [
        String(videojuego.id ?? ''),
        videojuego.titulo,
        `${videojuego.precio} €`,
        String(videojuego.stock),
        videojuego.plataforma,
        videojuego.genero,
        videojuego.disponible ? 'Sí' : 'No'
      ]),
      startY: 25
    });
    documento.save('videojuegos.pdf');
    this.registrarActividad('exportar', 'Exportación de la página del catálogo a PDF');
  }

  private eliminarVideojuego(videojuego: VideojuegoListado): void {
    if (videojuego.id === undefined) {
      this.errorMensaje.set('No se puede eliminar un videojuego sin identificador.');
      return;
    }
    this.errorMensaje.set(null);
    this.videojuegosService
      .eliminar(videojuego.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.videojuegosService.invalidarCatalogo();
          this.cargarVideojuegos();
          this.registrarActividad(
            'eliminar',
            `Eliminación del videojuego ${videojuego.titulo}`
          );
        },
        error: (error: unknown) => {
          this.errorMensaje.set(
            error instanceof Error ? error.message : 'No se pudo eliminar el videojuego.'
          );
        }
      });
  }

  private registrarActividad(tipo: string, detalle: string): void {
    const usuario = this.authService.usuarioActual()?.email;
    void this.firestoreService
      .registrarActividad({ tipo, usuario: usuario ?? 'desconocido', detalle, fecha: new Date() })
      .catch((error: unknown) => {
        console.error('La acción se completó, pero falló el registro de auditoría.', error);
        this.errorMensaje.set('La operación terminó, pero no se pudo registrar la actividad.');
      });
  }

  private escaparCSV(valor: string): string {
    return `"${valor.replace(/"/g, '""')}"`;
  }

  private descargarArchivo(contenido: string, nombre: string, tipo: string): void {
    const enlace = document.createElement('a');
    const url = URL.createObjectURL(new Blob([contenido], { type: `${tipo};charset=utf-8` }));
    enlace.href = url;
    enlace.download = nombre;
    enlace.click();
    URL.revokeObjectURL(url);
  }
}
