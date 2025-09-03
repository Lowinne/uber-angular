import { Routes } from '@angular/router';
import { Component } from '@angular/core';

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
  { path: 'home', component: DriverHomeComponent },
  { path: 'current-trip', component: CurrentTripComponent },
  { path: 'earnings', component: EarningsComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
];
