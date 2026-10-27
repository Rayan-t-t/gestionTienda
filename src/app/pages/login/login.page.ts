import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonButtons,
  IonMenuButton,
  IonSpinner,
  IonText
} from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';
import { FirestoreService } from '../../core/services/firestore.service';

/**
 * Página de inicio de sesión.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonButtons,
    IonMenuButton,
    IonSpinner,
    IonText
  ],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginPage {
  loginForm: FormGroup;
  readonly cargando = signal(false);
  readonly errorMensaje = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private firestoreService: FirestoreService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  /**
   * Inicia sesión con las credenciales introducidas.
   */
  iniciarSesion(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.errorMensaje.set(null);

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (usuario) => {
        this.cargando.set(false);
        this.firestoreService.registrarActividad({
          tipo: 'login',
          descripcion: `Inicio de sesión de ${usuario.email}`,
          usuario: usuario.email
        });
        this.router.navigate(['/videojuegos']);
      },
      error: (error) => {
        this.cargando.set(false);
        this.errorMensaje.set('Error al iniciar sesión. Verifica tus credenciales.');
        console.error('Error de login:', error);
      }
    });
  }
}
