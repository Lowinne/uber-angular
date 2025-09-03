import { Routes } from '@angular/router';
import { Component } from '@angular/core';

// A remplacer lorsque pret
@Component({ standalone: true, template: '<h2>Add Payment Method</h2>' })
class AddMethodComponent {}

// A remplacer lorsque pret
@Component({ standalone: true, template: '<h2>Receipts</h2>' })
class ReceiptsComponent {}

export const PAYMENT_ROUTES: Routes = [
  { path: 'add-method', component: AddMethodComponent },
  { path: 'receipts', component: ReceiptsComponent },
  { path: '', redirectTo: 'add-method', pathMatch: 'full' },
];
