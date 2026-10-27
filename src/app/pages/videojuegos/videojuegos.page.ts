import { Component, ChangeDetectionStrategy, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonMenuButton,
  IonList,
  IonItem,
  IonLabel,
  IonThumbnail,
  IonButton,
  IonIcon,
  IonSearchbar,
  IonSpinner,
  IonText,
  IonFab,
  IonFabButton
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { add, eye, create } from 'ionicons/icons';
import { VideojuegosService } from '../../core/services/videojuegos.service';
import { Videojuego } from '../../core/models/videojuego.model';
import { AuthService } from '../../core/services/auth.service';
import { FirestoreService } from '../../core/services/firestore.service';
import { FiltroVideojuegosPipe } from '../../shared/pipes/filtro-videojuegos.pipe';
import { ResaltarDirective } from '../../shared/directives/resaltar.directive';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Página para listar videojuegos.
 */
@Component({
  selector: 'app-videojuegos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonMenuButton,
    IonList,
    IonItem,
    IonLabel,
    IonThumbnail,
    IonButton,
    IonIcon,
    IonSearchbar,
    IonSpinner,
    IonText,
    IonFab,
    IonFabButton,
    FiltroVideojuegosPipe,
    ResaltarDirective
  ],
  templateUrl: './videojuegos.page.html',
  styleUrls: ['./videojuegos.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VideojuegosPage implements OnInit {
  readonly videojuegos = signal<Videojuego[]>([]);
  readonly cargando = signal(false);
  readonly errorMensaje = signal<string | null>(null);
  readonly terminoBusqueda = signal('');
  readonly esAdmin = computed(() => this.authService.esAdministrador());
  readonly estaAutenticado = computed(() => this.authService.estaAutenticado());

  constructor(
    private videojuegosService: VideojuegosService,
    private authService: AuthService,
    private firestoreService: FirestoreService
  ) {
    addIcons({ add, eye, create });
  }

  ngOnInit(): void {
    this.cargarVideojuegos();
  }

  /**
   * Carga todos los videojuegos.
   */
  cargarVideojuegos(): void {
    this.cargando.set(true);
    this.errorMensaje.set(null);
    this.videojuegosService.obtenerTodos().subscribe({
      next: (datos) => {
        this.videojuegos.set(datos);
        this.cargando.set(false);
      },
      error: (error) => {
        this.cargando.set(false);
        this.errorMensaje.set('Error al cargar los videojuegos');
        console.error('Error:', error);
      }
    });
  }

  /**
   * Actualiza el término de búsqueda.
   */
  buscar(event: any): void {
    this.terminoBusqueda.set(event.target.value || '');
  }

  /**
   * Exporta la lista a CSV.
   */
  exportarCSV(): void {
    const lista = this.videojuegos();
    if (lista.length === 0) {
      return;
    }
    const cabecera = 'id,titulo,codigo_sku,precio,stock,plataforma,genero,disponible\n';
    const filas = lista
      .map((v) => {
        return `${v.id},${v.titulo},${v.codigo_sku},${v.precio},${v.stock},${v.plataforma},${v.genero},${v.disponible}`;
      })
      .join('\n');
    const csv = cabecera + filas;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'videojuegos.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.firestoreService.registrarActividad({
      tipo: 'exportar',
      descripcion: 'Exportación a CSV de videojuegos',
      usuario: this.authService.usuarioActual()?.email
    });
  }

  /**
   * Exporta la lista a PDF.
   */
  exportarPDF(): void {
    const lista = this.videojuegos();
    if (lista.length === 0) {
      return;
    }
    const doc = new jsPDF();
    doc.text('Listado de Videojuegos', 14, 15);
    const datos = lista.map((v) => [
      v.id?.toString() || '',
      v.titulo,
      v.codigo_sku,
      `${v.precio}€`,
      v.stock.toString(),
      v.plataforma,
      v.genero
    ]);
    autoTable(doc, {
      head: [['ID', 'Título', 'SKU', 'Precio', 'Stock', 'Plataforma', 'Género']],
      body: datos,
      startY: 25
    });
    doc.save('videojuegos.pdf');
    this.firestoreService.registrarActividad({
      tipo: 'exportar',
      descripcion: 'Exportación a PDF de videojuegos',
      usuario: this.authService.usuarioActual()?.email
    });
  }
}
