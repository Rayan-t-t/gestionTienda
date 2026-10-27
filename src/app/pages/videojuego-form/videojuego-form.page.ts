import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AsyncValidatorFn,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
  IonTextarea,
  IonTitle,
  IonToggle,
  IonToolbar
} from '@ionic/angular';
import { catchError, map, of, switchMap, timer } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { FirestoreService } from '../../core/services/firestore.service';
import { Requisitos, Videojuego } from '../../core/models/videojuego.model';
import { VideojuegosService } from '../../core/services/videojuegos.service';

type VideojuegoFormControls = {
  titulo: FormControl<string>;
  codigo_sku: FormControl<string>;
  descripcion: FormControl<string>;
  precio: FormControl<number>;
  stock: FormControl<number>;
  valoracion: FormControl<number | null>;
  fecha_lanzamiento: FormControl<string>;
  disponible: FormControl<boolean>;
  plataforma: FormControl<Videojuego['plataforma']>;
  genero: FormControl<Videojuego['genero']>;
  etiquetas: FormControl<string>;
  portada_url: FormControl<string>;
  so: FormControl<string>;
  procesador: FormControl<string>;
  ram: FormControl<string>;
  gpu: FormControl<string>;
  almacenamiento: FormControl<string>;
};

/**
 * Formulario de alta y edición de videojuegos.
 */
@Component({
  selector: 'app-videojuego-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonBackButton,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonText,
    IonTextarea,
    IonTitle,
    IonToggle,
    IonToolbar
  ],
  templateUrl: './videojuego-form.page.html',
  styleUrls: ['./videojuego-form.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VideojuegoFormPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly videojuegosService = inject(VideojuegosService);
  private readonly authService = inject(AuthService);
  private readonly firestoreService = inject(FirestoreService);
  private readonly destroyRef = inject(DestroyRef);

  readonly idVideojuego = signal<number | null>(null);
  readonly fechaCreacion = signal<string | null>(null);
  readonly modoEdicion = signal(false);
  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly errorMensaje = signal<string | null>(null);
  readonly plataformas: Videojuego['plataforma'][] = ['PC', 'PS5', 'Xbox', 'Switch'];
  readonly generos: Videojuego['genero'][] = [
    'RPG',
    'Accion',
    'Deportes',
    'Estrategia',
    'Aventura'
  ];

  readonly formulario = new FormGroup<VideojuegoFormControls>({
    titulo: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    codigo_sku: new FormControl(
      '',
      {
        nonNullable: true,
        validators: [Validators.required],
        asyncValidators: [this.validadorSku()],
        updateOn: 'change'
      }
    ),
    descripcion: new FormControl('', { nonNullable: true }),
    precio: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)]
    }),
    stock: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]
    }),
    valoracion: new FormControl<number | null>(null, [
      Validators.min(0),
      Validators.max(10)
    ]),
    fecha_lanzamiento: new FormControl('', { nonNullable: true }),
    disponible: new FormControl(true, { nonNullable: true }),
    plataforma: new FormControl<Videojuego['plataforma']>('PC', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    genero: new FormControl<Videojuego['genero']>('RPG', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    etiquetas: new FormControl('', { nonNullable: true }),
    portada_url: new FormControl('', { nonNullable: true }),
    so: new FormControl('', { nonNullable: true }),
    procesador: new FormControl('', { nonNullable: true }),
    ram: new FormControl('', { nonNullable: true }),
    gpu: new FormControl('', { nonNullable: true }),
    almacenamiento: new FormControl('', { nonNullable: true })
  });

  ngOnInit(): void {
    const parametro = this.route.snapshot.paramMap.get('id');
    if (parametro === null) {
      return;
    }

    const id = Number(parametro);
    if (!Number.isInteger(id) || id < 1) {
      this.errorMensaje.set('El identificador del videojuego no es válido.');
      return;
    }

    this.idVideojuego.set(id);
    this.modoEdicion.set(true);
    this.cargarVideojuego(id);
  }

  /**
   * Guarda el registro validado, creando uno nuevo o actualizando el existente.
   */
  guardar(): void {
    if (this.formulario.pending || this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valores = this.formulario.getRawValue();
    const videojuego = this.convertirFormulario(valores);
    this.guardando.set(true);
    this.errorMensaje.set(null);

    const id = this.idVideojuego();
    const operacion = id === null
      ? this.videojuegosService.crear(videojuego)
      : this.videojuegosService.actualizar(id, videojuego);

    operacion.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        const accion = id === null ? 'crear' : 'actualizar';
        void this.registrarActividad(
          accion,
          `${id === null ? 'Creación' : 'Actualización'} del videojuego ${videojuego.titulo}`
        );
        this.guardando.set(false);
        void this.router.navigateByUrl('/videojuegos');
      },
      error: (error: unknown) => {
        this.errorMensaje.set(
          error instanceof Error ? error.message : 'No se pudo guardar el videojuego.'
        );
        this.guardando.set(false);
      }
    });
  }

  private validadorSku(): AsyncValidatorFn {
    return (control) => {
      const sku = typeof control.value === 'string' ? control.value.trim() : '';
      if (!sku) {
        return of(null);
      }

      return timer(400).pipe(
        switchMap(() => this.videojuegosService.existeSku(sku, this.idVideojuego() ?? undefined)),
        map((existe) => (existe ? { skuDuplicado: true } : null)),
        catchError(() => of({ errorComprobandoSku: true }))
      );
    };
  }

  private cargarVideojuego(id: number): void {
    this.cargando.set(true);
    this.videojuegosService
      .obtenerPorId(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (registros) => {
          const videojuego = registros[0];
          if (!videojuego) {
            this.errorMensaje.set('No se encontró el videojuego solicitado.');
            this.cargando.set(false);
            return;
          }

          this.fechaCreacion.set(videojuego.created_at ?? null);
          this.formulario.patchValue({
            titulo: videojuego.titulo,
            codigo_sku: videojuego.codigo_sku,
            descripcion: videojuego.descripcion ?? '',
            precio: videojuego.precio,
            stock: videojuego.stock,
            valoracion: videojuego.valoracion ?? null,
            fecha_lanzamiento: videojuego.fecha_lanzamiento ?? '',
            disponible: videojuego.disponible,
            plataforma: videojuego.plataforma,
            genero: videojuego.genero,
            etiquetas: videojuego.etiquetas?.join(', ') ?? '',
            portada_url: videojuego.portada_url ?? '',
            so: videojuego.requisitos?.so ?? '',
            procesador: videojuego.requisitos?.procesador ?? '',
            ram: videojuego.requisitos?.ram ?? '',
            gpu: videojuego.requisitos?.gpu ?? '',
            almacenamiento: videojuego.requisitos?.almacenamiento ?? ''
          });
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

  private convertirFormulario(
    valores: ReturnType<typeof this.formulario.getRawValue>
  ): Videojuego {
    const requisitos: Requisitos = {
      so: valores.so.trim(),
      procesador: valores.procesador.trim(),
      ram: valores.ram.trim(),
      gpu: valores.gpu.trim(),
      almacenamiento: valores.almacenamiento.trim()
    };
    const hayRequisitos = Object.values(requisitos).some((valor) => valor.length > 0);

    return {
      titulo: valores.titulo.trim(),
      codigo_sku: valores.codigo_sku.trim(),
      descripcion: valores.descripcion.trim() || null,
      precio: Number(valores.precio),
      stock: Number(valores.stock),
      valoracion: valores.valoracion === null ? null : Number(valores.valoracion),
      fecha_lanzamiento: valores.fecha_lanzamiento || null,
      disponible: valores.disponible,
      plataforma: valores.plataforma,
      genero: valores.genero,
      etiquetas: valores.etiquetas
        .split(',')
        .map((etiqueta) => etiqueta.trim())
        .filter((etiqueta) => etiqueta.length > 0),
      requisitos: hayRequisitos ? requisitos : null,
      portada_url: valores.portada_url.trim() || null
    };
  }

  private async registrarActividad(tipo: string, detalle: string): Promise<void> {
    try {
      await this.firestoreService.registrarActividad({
        tipo,
        usuario: this.authService.usuarioActual()?.email ?? 'desconocido',
        detalle,
        fecha: new Date()
      });
    } catch (error) {
      console.error('El videojuego se guardó, pero falló el registro de auditoría.', error);
    }
  }
}
