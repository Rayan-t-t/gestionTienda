import {
  HttpContextToken,
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

const AUTH_RETRY = new HttpContextToken<boolean>(() => false);

/**
 * Añade credenciales a Supabase y renueva la sesión una vez si una petición falla
 * por un token de acceso vencido.
 */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!request.url.startsWith(environment.supabaseUrl)) {
    return next(request);
  }

  const esEndpointToken = request.url.includes('/auth/v1/token');
  const token = esEndpointToken
    ? environment.supabaseAnonKey
    : authService.usuarioActual()?.access_token ?? environment.supabaseAnonKey;
  const peticionAutenticada = request.clone({
    setHeaders: {
      apikey: environment.supabaseAnonKey,
      Authorization: `Bearer ${token}`
    }
  });

  return next(peticionAutenticada).pipe(
    catchError((error: unknown) => {
      if (
        !(error instanceof HttpErrorResponse) ||
        error.status !== 401 ||
        esEndpointToken ||
        request.context.get(AUTH_RETRY)
      ) {
        return throwError(() => error);
      }

      return authService.refrescarToken().pipe(
        catchError((errorRenovacion: unknown) => {
          authService.logout();
          void router.navigateByUrl('/login');
          return throwError(() => errorRenovacion);
        }),
        switchMap((usuario) => {
          const peticionReintentada = request.clone({
            context: request.context.set(AUTH_RETRY, true),
            setHeaders: {
              apikey: environment.supabaseAnonKey,
              Authorization: `Bearer ${usuario.access_token ?? environment.supabaseAnonKey}`
            }
          });
          return next(peticionReintentada).pipe(
            catchError((errorReintento: unknown) => {
              if (errorReintento instanceof HttpErrorResponse && errorReintento.status === 401) {
                authService.logout();
                void router.navigateByUrl('/login');
              }
              return throwError(() => errorReintento);
            })
          );
        })
      );
    })
  );
};
