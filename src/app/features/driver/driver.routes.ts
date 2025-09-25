import { Routes } from '@angular/router';
import { Component } from '@angular/core';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';

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
  {
    path: 'requests',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['driver', 'admin'] },
    loadComponent: () =>
      import('./requests/requests.component').then(m => m.DriverRequestsComponent),
  },
  {
    path: 'history',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['driver', 'admin'] },
    loadComponent: () => import('./history/history.component').then(m => m.DriverHistoryComponent),
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
];
