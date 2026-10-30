import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Iniciar sesión | Gestor de videojuegos',
    loadComponent: () => import('./pages/login/login.page').then((module) => module.LoginPage)
  },
  {
    path: 'videojuegos',
    title: 'Catálogo | Gestor de videojuegos',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/videojuegos/videojuegos.page').then((module) => module.VideojuegosPage)
  },
  {
    path: 'videojuegos/nuevo',
    title: 'Nuevo videojuego | Gestor de videojuegos',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./pages/videojuego-form/videojuego-form.page').then(
        (module) => module.VideojuegoFormPage
      )
  },
  {
    path: 'videojuegos/editar/:id',
    title: 'Editar videojuego | Gestor de videojuegos',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./pages/videojuego-form/videojuego-form.page').then(
        (module) => module.VideojuegoFormPage
      )
  },
  {
    path: 'videojuegos/:id',
    title: 'Detalle del videojuego | Gestor de videojuegos',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/videojuego-detalle/videojuego-detalle.page').then(
        (module) => module.VideojuegoDetallePage
      )
  },
  {
    path: 'dashboard',
    title: 'Dashboard | Gestor de videojuegos',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./pages/dashboard/dashboard.page').then((module) => module.DashboardPage)
  },
  {
    path: 'acerca',
    title: 'Acerca de | Gestor de videojuegos',
    loadComponent: () =>
      import('./pages/acerca/acerca.page').then((module) => module.AcercaPage)
  },
  {
    path: 'ayuda',
    title: 'Ayuda | Gestor de videojuegos',
    loadComponent: () => import('./pages/ayuda/ayuda.page').then((module) => module.AyudaPage)
  },
  {
    path: 'home',
    title: 'Inicio | Gestor de videojuegos',
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
