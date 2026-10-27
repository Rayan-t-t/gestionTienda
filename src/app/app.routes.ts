import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage)
  },
  {
    path: 'videojuegos',
    loadComponent: () => import('./pages/videojuegos/videojuegos.page').then((m) => m.VideojuegosPage)
  },
  {
    path: 'videojuegos/nuevo',
    loadComponent: () => import('./pages/videojuego-form/videojuego-form.page').then((m) => m.VideojuegoFormPage),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'videojuegos/:id',
    loadComponent: () => import('./pages/videojuego-detalle/videojuego-detalle.page').then((m) => m.VideojuegoDetallePage)
  },
  {
    path: 'videojuegos/:id/editar',
    loadComponent: () => import('./pages/videojuego-form/videojuego-form.page').then((m) => m.VideojuegoFormPage),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'acerca',
    loadComponent: () => import('./pages/acerca/acerca.page').then((m) => m.AcercaPage),
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
