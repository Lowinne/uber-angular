import { Routes } from '@angular/router';
import { Component } from '@angular/core';
import { authGuard } from '../../core/guards/auth.guard';

//A remplacer lorsque Pret
@Component({ standalone: true, template: '<h2>Confirm Ride</h2>' })
class ConfirmRideComponent {}

//A remplacer lorsque Pret
@Component({ standalone: true, template: '<h2>Track Ride</h2>' })
class TrackRideComponent {}

//A remplacer lorsque Pret
@Component({ standalone: true, template: '<h2>Ride History</h2>' })
class HistoryComponent {}

export const RIDER_ROUTES: Routes = [
  {
    path: 'request',
    canActivate: [authGuard],
    loadComponent: () => import('./request-ride.component').then(m => m.RequestRideComponent),
  },
  { path: 'confirm', component: ConfirmRideComponent },
  { path: 'track', component: TrackRideComponent },
  { path: 'history', component: HistoryComponent },
  { path: '', redirectTo: 'request', pathMatch: 'full' },
];
