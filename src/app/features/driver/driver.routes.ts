import { Routes } from '@angular/router';
import { Component } from '@angular/core';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';

//A remplacer lorsque Pret
@Component({ standalone: true, template: '<h2>Driver Home</h2>' })
class DriverHomeComponent {}

//A remplacer lorsque Pret
@Component({ standalone: true, template: '<h2>Current Trip</h2>' })
class CurrentTripComponent {}

//A remplacer lorsque Pret
@Component({ standalone: true, template: '<h2>Earnings</h2>' })
class EarningsComponent {}

export const DRIVER_ROUTES: Routes = [
  {
    path: 'home',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['driver', 'admin'] },
    loadComponent: () => import('./home/home.component').then(m => m.DriverHomeComponent),
  },
  {
    path: 'current-trip',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['driver', 'admin'] },
    loadComponent: () =>
      import('./current-trip/current-trip.component').then(m => m.CurrentTripComponent),
  },
  {
    path: 'earnings',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['driver', 'admin'] },
    loadComponent: () => import('./earnings/earnings.component').then(m => m.EarningsComponent),
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
];
