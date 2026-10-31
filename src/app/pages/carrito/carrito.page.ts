import { DecimalPipe, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonRow,
  IonTitle,
  IonToolbar
} from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { CarritoService } from '../../core/services/carrito.service';
import { FirestoreService } from '../../core/services/firestore.service';
import { VideojuegosService } from '../../core/services/videojuegos.service';
import { ControlSesionComponent } from '../../shared/components/control-sesion/control-sesion.component';
import { NavegacionPrincipalComponent } from '../../shared/components/navegacion-principal/navegacion-principal.component';

/**
 * Permite revisar el carrito y simular la finalización del pedido.
 */
@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [
    DecimalPipe,
    NgOptimizedImage,
    IonButton,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonRow,
    IonTitle,
    IonToolbar,
    RouterLink,
    ControlSesionComponent,
    NavegacionPrincipalComponent
  ],
  templateUrl: './carrito.page.html',
  styleUrl: './carrito.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CarritoPage {
  private readonly authService = inject(AuthService);
  private readonly carritoService = inject(CarritoService);
  private readonly firestoreService = inject(FirestoreService);
  private readonly videojuegosService = inject(VideojuegosService);

  readonly articulos = this.carritoService.articulos;
  readonly importeTotal = this.carritoService.importeTotal;
  readonly procesando = signal(false);
  readonly errorMensaje = signal<string | null>(null);
  readonly exitoMensaje = signal<string | null>(null);

  constructor() {
    this.carritoService.sincronizarUsuario(this.authService.usuarioActual()?.id ?? null);
  }

  cambiarCantidad(id: number, cantidad: number): void {
    this.errorMensaje.set(null);
    this.exitoMensaje.set(null);
    try {
      this.carritoService.establecerCantidad(id, cantidad);
    } catch (error: unknown) {
      this.errorMensaje.set(
        error instanceof Error ? error.message : 'No se pudo cambiar la cantidad.'
      );
    }
  }

  quitarArticulo(id: number): void {
    this.errorMensaje.set(null);
    this.exitoMensaje.set(null);
    this.carritoService.quitar(id);
  }

  /**
   * Solicita la finalización atómica del carrito. No procesa ningún pago.
   */
  async finalizarPedido(): Promise<void> {
    const articulosPedido = this.articulos();
    if (this.procesando() || articulosPedido.length === 0) {
      return;
    }

    this.procesando.set(true);
    this.errorMensaje.set(null);
    this.exitoMensaje.set(null);
    try {
      await firstValueFrom(
        this.videojuegosService.finalizarCompra(
          articulosPedido.map(({ id, cantidad }) => ({ id, cantidad }))
        )
      );
      const unidadesVendidas = articulosPedido.reduce(
        (total, articulo) => total + articulo.cantidad,
        0
      );
      for (const articulo of articulosPedido) {
        this.carritoService.quitar(articulo.id);
      }

      let mensajeExito =
        'Pedido completado. No se ha realizado ningún pago; el stock se ha actualizado.';
      try {
        await this.firestoreService.registrarActividad({
          tipo: 'venta',
          usuario: this.authService.usuarioActual()?.email ?? 'desconocido',
          detalle: `Compra finalizada: ${unidadesVendidas} unidades`,
          fecha: new Date(),
          unidadesVendidas
        });
      } catch {
        mensajeExito += ' No se pudo guardar la venta en el historial del dashboard.';
      }
      this.exitoMensaje.set(mensajeExito);
    } catch (error: unknown) {
      const detalle =
        error instanceof Error ? error.message : 'No se pudo actualizar el stock.';
      this.errorMensaje.set(
        `No se pudo finalizar el pedido: ${detalle} El carrito se ha conservado.`
      );
    } finally {
      this.procesando.set(false);
    }
  }
}
