import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface User {
  id: number;
  role: 'rider' | 'driver' | 'admin';
  name: string;
  email: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

const TOKEN_KEY = 'token';
const AUTH_USER_KEY = '__auth_user__';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // ✅ HttpClient via inject() (pas de paramètre dans le constructeur)
  private http = inject(HttpClient);

  private _user = signal<User | null>(null);
  user = this._user.asReadonly();

  constructor() {
    this.restoreFromStorage();
  }

  private restoreFromStorage() {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const stored = localStorage.getItem(AUTH_USER_KEY);
      if (token && stored) {
        const u: User = JSON.parse(stored);
        this._user.set(u);
      }
    } catch {
      // ignore JSON parse errors
      this._user.set(null);
    }
  }

  async login(email: string, password: string): Promise<User> {
    const res = await firstValueFrom(
      this.http.post<LoginResponse>('/api/auth/login', { email, password })
    );
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.user));
    this._user.set(res.user);
    return res.user;
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    this._user.set(null);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  }
}
