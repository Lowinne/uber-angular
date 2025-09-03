import { Routes } from '@angular/router';
import { Component } from '@angular/core';

//A remplacer lorsque Pret
@Component({ standalone: true, template: '<h2>Request Ride</h2>' })
class RequestRideComponent {}

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
  { path: 'request', component: RequestRideComponent },
  { path: 'confirm', component: ConfirmRideComponent },
  { path: 'track', component: TrackRideComponent },
  { path: 'history', component: HistoryComponent },
  { path: '', redirectTo: 'request', pathMatch: 'full' },
];
