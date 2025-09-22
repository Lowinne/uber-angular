import { Routes } from '@angular/router';
import { Component } from '@angular/core';

//A remplacer lorsque Pret
@Component({ standalone: true, template: '<h2>Register</h2>' })
class RegisterPageComponent {}

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login-page.component').then(m => m.LoginPageComponent),
  },
  { path: 'register', component: RegisterPageComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
