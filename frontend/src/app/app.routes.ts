import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login').then((m) => m.Login),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard').then((m) => m.Dashboard),
    canActivate: [authGuard],
  },
  {
    path: 'ingresos',
    loadComponent: () =>
      import('./features/ingresos/ingresos-page').then((m) => m.IngresosPage),
    canActivate: [authGuard],
  },
  {
    path: 'ingresos/movimientos',
    loadComponent: () =>
      import('./features/ingresos/pages/movimientos/movimientos').then((m) => m.IngresosMovimientos),
    canActivate: [authGuard],
  },
  {
    path: 'session-expired',
    loadComponent: () =>
      import('./features/session-expired/session-expired').then((m) => m.SessionExpired),
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];