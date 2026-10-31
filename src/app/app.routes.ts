import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Iniciar sesión | Vértice Games',
    loadComponent: () => import('./pages/login/login.page').then((module) => module.LoginPage)
  },
  {
    path: 'carrito',
    title: 'Carrito | Vértice Games',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/carrito/carrito.page').then((module) => module.CarritoPage)
  },
  {
    path: 'videojuegos',
    title: 'Catálogo | Vértice Games',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/videojuegos/videojuegos.page').then((module) => module.VideojuegosPage)
  },
  {
    path: 'videojuegos/nuevo',
    title: 'Nuevo videojuego | Vértice Games',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./pages/videojuego-form/videojuego-form.page').then(
        (module) => module.VideojuegoFormPage
      )
  },
  {
    path: 'videojuegos/editar/:id',
    title: 'Editar videojuego | Vértice Games',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./pages/videojuego-form/videojuego-form.page').then(
        (module) => module.VideojuegoFormPage
      )
  },
  {
    path: 'videojuegos/:id',
    title: 'Detalle del videojuego | Vértice Games',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/videojuego-detalle/videojuego-detalle.page').then(
        (module) => module.VideojuegoDetallePage
      )
  },
  {
    path: 'dashboard',
    title: 'Dashboard | Vértice Games',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./pages/dashboard/dashboard.page').then((module) => module.DashboardPage)
  },
  {
    path: 'acerca',
    title: 'Acerca de | Vértice Games',
    loadComponent: () =>
      import('./pages/acerca/acerca.page').then((module) => module.AcercaPage)
  },
  {
    path: 'ayuda',
    title: 'Ayuda | Vértice Games',
    loadComponent: () => import('./pages/ayuda/ayuda.page').then((module) => module.AyudaPage)
  },
  {
    path: 'home',
    title: 'Inicio | Vértice Games',
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
