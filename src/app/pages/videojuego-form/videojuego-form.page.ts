import { Component, ChangeDetectionStrategy, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonToggle,
  IonButton,
  IonSpinner,
  IonText
} from '@ionic/angular';
import { VideojuegosService } from '../../core/services/videojuegos.service';
import { AuthService } from '../../core/services/auth.service';
import { FirestoreService } from '../../core/services/firestore.service';
import { Videojuego } from '../../core/models/videojuego.model';

/**
 * Página de formulario para crear o editar videojuegos (solo admin).
 */
@Component({
  selector: 'app-videojuego-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonToggle,
    IonButton,
    IonSpinner,
    IonText
  ],
  templateUrl: './videojuego-form.page.html',
  styleUrls: ['./videojuego-form.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VideojuegoFormPage implements OnInit {
  formulario: FormGroup;
  readonly modoEdicion = signal(false);
  readonly idVideojuego = signal<number | null>(null);
  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly errorMensaje = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private videojuegosService: VideojuegosService,
    private authService: AuthService,
    private firestoreService: FirestoreService
  ) {
    this.formulario = this.fb.group({
      titulo: ['', [Validators.required]],
      codigo_sku: ['', [Validators.required]],
      descripcion: [''],
      precio: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      valoracion: [null],
      fecha_lanzamiento: [''],
      disponible: [true],
      plataforma: ['PC', [Validators.required]],
      genero: ['RPG', [Validators.required]],
      etiquetas: [''],
      portada_url: [''],
      ram: [''],
      gpu: [''],
      almacenamiento: ['']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'nuevo') {
      this.modoEdicion.set(true);
      this.idVideojuego.set(parseInt(id, 10));
      this.cargarVideojuego(parseInt(id, 10));
    }
  }

  private cargarVideojuego(id: number): void {
    this.cargando.set(true);
    this.videojuegosService.obtenerPorId(id).subscribe({
      next: (datos) => {
        if (datos && datos.length > 0) {
          const v = datos[0];
          this.formulario.patchValue({
            titulo: v.titulo,
            codigo_sku: v.codigo_sku,
            descripcion: v.descripcion,
            precio: v.precio,
            stock: v.stock,
            valoracion: v.valoracion,
            fecha_lanzamiento: v.fecha_lanzamiento,
            disponible: v.disponible,
            plataforma: v.plataforma,
            genero: v.genero,
            etiquetas: v.etiquetas ? v.etiquetas.join(', ') : '',
            portada_url: v.portada_url,
            ram: v.requisitos?.ram || '',
            gpu: v.requisitos?.gpu || '',
            almacenamiento: v.requisitos?.almacenamiento || ''
          });
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

  /**
   * Guarda el videojuego (crea o actualiza).
   */
  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.errorMensaje.set(null);

    const valores = this.formulario.value;
    const videojuego: Videojuego = {
      titulo: valores.titulo,
      codigo_sku: valores.codigo_sku,
      descripcion: valores.descripcion || null,
      precio: Number(valores.precio),
      stock: Number(valores.stock),
      valoracion: valores.valoracion !== null && valores.valoracion !== '' ? Number(valores.valoracion) : null,
      fecha_lanzamiento: valores.fecha_lanzamiento || null,
      disponible: valores.disponible,
      plataforma: valores.plataforma,
      genero: valores.genero,
      etiquetas: valores.etiquetas ? valores.etiquetas.split(',').map((e: string) => e.trim()).filter((e: string) => e) : null,
      requisitos: valores.ram || valores.gpu || valores.almacenamiento ? {
        ram: valores.ram || undefined,
        gpu: valores.gpu || undefined,
        almacenamiento: valores.almacenamiento || undefined
      } : null,
      portada_url: valores.portada_url || null
    };

    if (this.modoEdicion() && this.idVideojuego()) {
      this.videojuegosService.actualizar(this.idVideojuego()!, videojuego).subscribe({
        next: () => {
          this.guardando.set(false);
          this.firestoreService.registrarActividad({
            tipo: 'actualizar',
            descripcion: `Actualización del videojuego ${videojuego.titulo}`,
            usuario: this.authService.usuarioActual()?.email
          });
          this.router.navigate(['/videojuegos']);
        },
        error: (error) => {
          this.guardando.set(false);
          this.errorMensaje.set('Error al actualizar el videojuego');
          console.error('Error:', error);
        }
      });
    } else {
      this.videojuegosService.crear(videojuego).subscribe({
        next: () => {
          this.guardando.set(false);
          this.firestoreService.registrarActividad({
            tipo: 'crear',
            descripcion: `Creación del videojuego ${videojuego.titulo}`,
            usuario: this.authService.usuarioActual()?.email
          });
          this.router.navigate(['/videojuegos']);
        },
        error: (error) => {
          this.guardando.set(false);
          this.errorMensaje.set('Error al crear el videojuego');
          console.error('Error:', error);
        }
      });
    }
  }
}
