import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';

export const PAYMENT_ROUTES: Routes = [
  {
    path: 'add-method',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['rider', 'admin'] },
    loadComponent: () =>
      import('./add-method/add-method.component').then(m => m.AddMethodComponent),
  },
  {
    path: 'receipts',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['rider', 'admin'] },
    loadComponent: () => import('./receipts/receipts.component').then(m => m.ReceiptsComponent),
  },
  { path: '', redirectTo: 'add-method', pathMatch: 'full' },
];
