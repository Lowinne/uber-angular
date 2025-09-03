// src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'rider/request', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
  },
  {
    path: 'rider',
    loadChildren: () => import('./features/rider/rider.routes').then(m => m.RIDER_ROUTES),
  },
  {
    path: 'driver',
    loadChildren: () => import('./features/driver/driver.routes').then(m => m.DRIVER_ROUTES),
  },
  {
    path: 'payments',
    loadChildren: () => import('./features/payments/payments.routes').then(m => m.PAYMENT_ROUTES),
  },
  { path: '**', redirectTo: 'rider/request' },
];
