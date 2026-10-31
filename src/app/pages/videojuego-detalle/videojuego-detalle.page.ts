import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonSpinner,
  IonText,
  IonTitle,
  IonRow,
  IonToolbar
} from '@ionic/angular';
import { ControlSesionComponent } from '../../shared/components/control-sesion/control-sesion.component';
import { NavegacionPrincipalComponent } from '../../shared/components/navegacion-principal/navegacion-principal.component';
import { Videojuego } from '../../core/models/videojuego.model';
import { AuthService } from '../../core/services/auth.service';
import { VideojuegosService } from '../../core/services/videojuegos.service';

/**
 * Página de detalle de un videojuego.
 */
@Component({
  selector: 'app-videojuego-detalle',
  standalone: true,
  imports: [
    NgOptimizedImage,
    RouterLink,
    IonBackButton,
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonSpinner,
    IonText,
    IonTitle,
    IonRow,
    IonToolbar,
    ControlSesionComponent,
    NavegacionPrincipalComponent
  ],
  templateUrl: './videojuego-detalle.page.html',
  styleUrls: ['./videojuego-detalle.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VideojuegoDetallePage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly videojuegosService = inject(VideojuegosService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly videojuego = signal<Videojuego | null>(null);
  readonly cargando = signal(false);
  readonly errorMensaje = signal<string | null>(null);
  readonly puedeGestionar = this.authService.puedeGestionar;
  readonly requisitos = computed(() => {
    const requisitos = this.videojuego()?.requisitos;
    return requisitos
      ? Object.entries(requisitos).filter(([, valor]) => Boolean(valor))
      : [];
  });

  ngOnInit(): void {
    const parametro = this.route.snapshot.paramMap.get('id');
    const id = Number(parametro);
    if (parametro === null || !Number.isInteger(id) || id < 1) {
      this.errorMensaje.set('El identificador del videojuego no es válido.');
      return;
    }
    this.cargarVideojuego(id);
  }

  cargarVideojuego(id = Number(this.route.snapshot.paramMap.get('id'))): void {
    this.cargando.set(true);
    this.errorMensaje.set(null);
    this.videojuegosService
      .obtenerPorId(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (registros) => {
          const videojuego = registros[0];
          this.videojuego.set(videojuego ?? null);
          if (!videojuego) {
            this.errorMensaje.set('No se encontró el videojuego solicitado.');
          }
          this.cargando.set(false);
        },
        error: (error: unknown) => {
          this.errorMensaje.set(
            error instanceof Error ? error.message : 'No se pudo cargar el videojuego.'
          );
          this.cargando.set(false);
        }
      });
  }
}
