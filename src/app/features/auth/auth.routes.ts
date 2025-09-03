import { Routes } from '@angular/router';
import { Component } from '@angular/core';

//A remplacer lorsque Pret
@Component({ standalone: true, template: '<h2>Login</h2>' })
class LoginPageComponent {}

//A remplacer lorsque Pret
@Component({ standalone: true, template: '<h2>Register</h2>' })
class RegisterPageComponent {}

export const AUTH_ROUTES: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
