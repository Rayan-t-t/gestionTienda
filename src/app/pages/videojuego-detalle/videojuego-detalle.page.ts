import { Component, ChangeDetectionStrategy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonSpinner,
  IonText
} from '@ionic/angular';
import { VideojuegosService } from '../../core/services/videojuegos.service';
import { Videojuego } from '../../core/models/videojuego.model';
import { AuthService } from '../../core/services/auth.service';
import { computed } from '@angular/core';

/**
 * Página de detalle de un videojuego.
 */
@Component({
  selector: 'app-videojuego-detalle',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonButton,
    IonSpinner,
    IonText
  ],
  templateUrl: './videojuego-detalle.page.html',
  styleUrls: ['./videojuego-detalle.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VideojuegoDetallePage implements OnInit {
  readonly videojuego = signal<Videojuego | null>(null);
  readonly cargando = signal(false);
  readonly errorMensaje = signal<string | null>(null);
  readonly esAdmin = computed(() => this.authService.esAdministrador());

  constructor(
    private route: ActivatedRoute,
    private videojuegosService: VideojuegosService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarVideojuego(parseInt(id, 10));
    }
  }

  private cargarVideojuego(id: number): void {
    this.cargando.set(true);
    this.errorMensaje.set(null);
    this.videojuegosService.obtenerPorId(id).subscribe({
      next: (datos) => {
        if (datos && datos.length > 0) {
          this.videojuego.set(datos[0]);
        } else {
          this.errorMensaje.set('Videojuego no encontrado');
        }
        this.cargando.set(false);
      },
      error: (error) => {
        this.cargando.set(false);
        this.errorMensaje.set('Error al cargar el videojuego');
        console.error('Error:', error);
      }
    });
  }
}
