import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonButton } from '@ionic/angular/ion-button';
import { IonCol } from '@ionic/angular/ion-col';
import { IonContent } from '@ionic/angular/ion-content';
import { IonGrid } from '@ionic/angular/ion-grid';
import { IonInput } from '@ionic/angular/ion-input';
import { IonItem } from '@ionic/angular/ion-item';
import { IonLabel } from '@ionic/angular/ion-label';
import { IonText } from '@ionic/angular/ion-text';
import { IonRow } from '@ionic/angular/ion-row';
import { AuthService } from '../../core/services/auth.service';
import { FirestoreService } from '../../core/services/firestore.service';

/**
 * Página de inicio de sesión.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonButton,
    IonCol,
    IonContent,
    IonGrid,
    IonInput,
    IonItem,
    IonLabel,
    IonText,
    IonRow
  ],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly firestoreService = inject(FirestoreService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly cargando = signal(false);
  readonly errorMensaje = signal<string | null>(null);
  readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  /**
   * Valida e inicia sesión con las credenciales del formulario.
   */
  iniciarSesion(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.errorMensaje.set(null);
    const { email, password } = this.loginForm.getRawValue();

    this.authService
      .login(email.trim(), password)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (usuario) => {
          this.cargando.set(false);
          void this.firestoreService
            .registrarActividad({
              tipo: 'login',
              usuario: usuario.email,
              detalle: `Inicio de sesión de ${usuario.email}`,
              fecha: new Date()
            })
            .catch((error: unknown) =>
              console.error('La sesión se inició, pero falló el registro de auditoría.', error)
            );
          void this.router.navigateByUrl('/videojuegos');
        },
        error: () => {
          this.cargando.set(false);
          this.errorMensaje.set('No se pudo iniciar sesión. Revisa tus credenciales e inténtalo de nuevo.');
        }
      });
  }
}
