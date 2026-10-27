import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then((module) => module.LoginPage)
  },
  {
    path: 'videojuegos',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/videojuegos/videojuegos.page').then((module) => module.VideojuegosPage)
  },
  {
    path: 'videojuegos/nuevo',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./pages/videojuego-form/videojuego-form.page').then(
        (module) => module.VideojuegoFormPage
      )
  },
  {
    path: 'videojuegos/editar/:id',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./pages/videojuego-form/videojuego-form.page').then(
        (module) => module.VideojuegoFormPage
      )
  },
  {
    path: 'videojuegos/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/videojuego-detalle/videojuego-detalle.page').then(
        (module) => module.VideojuegoDetallePage
      )
  },
  {
    path: 'dashboard',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./pages/dashboard/dashboard.page').then((module) => module.DashboardPage)
  },
  {
    path: 'acerca',
    loadComponent: () =>
      import('./pages/acerca/acerca.page').then((module) => module.AcercaPage)
  },
  {
    path: 'ayuda',
    loadComponent: () => import('./pages/ayuda/ayuda.page').then((module) => module.AyudaPage)
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((module) => module.HomePage)
  },
  {
    path: '',
    redirectTo: 'videojuegos',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'videojuegos'
  }
];
