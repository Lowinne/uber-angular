import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface User {
  id: number;
  role: 'rider' | 'driver' | 'admin';
  name: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  private _user = signal<User | null>(null);
  user = this._user.asReadonly();

  constructor() {
    const stored = localStorage.getItem('__auth_user__');
    const token = localStorage.getItem('token');
    if (stored && token) this._user.set(JSON.parse(stored));
  }

  async login(email: string, password: string) {
    const res = await this.http
      .post<{ token: string; user: User }>('/api/auth/login', { email, password })
      .toPromise();
    localStorage.setItem('token', res!.token);
    localStorage.setItem('__auth_user__', JSON.stringify(res!.user));
    this._user.set(res!.user);
    return res!.user;
  }

  async register(payload: {
    name: string;
    email: string;
    password: string;
    role?: 'rider' | 'driver' | 'admin';
  }) {
    const res = await this.http
      .post<{ token: string; user: User }>('/api/auth/register', payload)
      .toPromise();
    localStorage.setItem('token', res!.token);
    localStorage.setItem('__auth_user__', JSON.stringify(res!.user));
    this._user.set(res!.user);
    return res!.user;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('__auth_user__');
    this._user.set(null);
  }

  isLoggedIn() {
    return !!localStorage.getItem('token');
  }
}
