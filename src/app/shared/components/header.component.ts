// src/app/shared/components/header.component.ts
import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, User } from '../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="hdr" role="banner">
      <div class="left">
        <a routerLink="/home" class="brand" aria-label="Accueil Uber Clone">🚖 Uber Clone</a>

        <button
          class="menu-btn"
          (click)="toggleMobileNav()"
          [attr.aria-expanded]="mobileOpen()"
          aria-controls="primary-nav"
        >
          ☰
        </button>

        <nav
          class="nav"
          [class.open]="mobileOpen()"
          id="primary-nav"
          aria-label="Navigation principale"
        >
          <a
            routerLink="/home"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
            aria-current="page"
            >Accueil</a
          >

          <!-- Liens Rider -->
          <a *ngIf="isRiderOrAdmin()" routerLink="/rider/request" routerLinkActive="active"
            >Commander</a
          >
          <a *ngIf="isRiderOrAdmin()" routerLink="/payments/receipts" routerLinkActive="active"
            >Reçus</a
          >

          <!-- Liens Driver -->
          <a *ngIf="isDriverOrAdmin()" routerLink="/driver/home" routerLinkActive="active"
            >Espace chauffeur</a
          >
          <a *ngIf="isDriverOrAdmin()" routerLink="/driver/current-trip" routerLinkActive="active"
            >Trajet en cours</a
          >
          <a *ngIf="isDriverOrAdmin()" routerLink="/driver/earnings" routerLinkActive="active"
            >Gains</a
          >
          <a *ngIf="isDriverOrAdmin()" routerLink="/driver/requests" routerLinkActive="active"
            >Demandes</a
          >
          <a *ngIf="isDriverOrAdmin()" routerLink="/driver/history" routerLinkActive="active"
            >Historique</a
          >
        </nav>
      </div>

      <div class="right">
        <ng-container *ngIf="user(); else guest">
          <span
            class="role"
            [class.rider]="role() === 'rider'"
            [class.driver]="role() === 'driver'"
            [class.admin]="role() === 'admin'"
          >
            {{ role() | titlecase }}
          </span>
          <div class="avatar" aria-hidden="true">{{ initials() }}</div>
          <span class="name sr-only">Connecté en tant que {{ user()!.name }}</span>
          <button class="logout" (click)="logout()">Se déconnecter</button>
        </ng-container>

        <ng-template #guest>
          <a class="login" routerLink="/auth/login">Se connecter</a>
        </ng-template>
      </div>
    </header>
  `,
  styles: [
    `
      .hdr {
        position: sticky;
        top: 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 16px;
        background: #111827;
        color: #fff;
        z-index: 10;
      }
      .left {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .brand {
        color: #fff;
        text-decoration: none;
        font-weight: 700;
        font-size: 1.1rem;
      }
      .nav {
        display: flex;
        gap: 12px;
        align-items: center;
      }
      .nav a {
        color: #d1d5db;
        text-decoration: none;
        padding: 4px 6px;
        border-radius: 6px;
      }
      .nav a.active {
        color: #fff;
        background: rgba(255, 255, 255, 0.08);
      }
      .right {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .login {
        color: #fff;
        text-decoration: none;
        font-weight: 600;
      }
      .logout {
        background: #ef4444;
        color: #fff;
        border: 0;
        border-radius: 8px;
        padding: 6px 10px;
        cursor: pointer;
      }
      .logout:hover {
        background: #dc2626;
      }
      .role {
        font-size: 0.75rem;
        padding: 2px 8px;
        border-radius: 999px;
        background: #374151;
        border: 1px solid #4b5563;
      }
      .role.rider {
        background: #0ea5e9;
        border-color: #0284c7;
        color: #001018;
      }
      .role.driver {
        background: #a855f7;
        border-color: #7e22ce;
      }
      .role.admin {
        background: #f59e0b;
        border-color: #b45309;
        color: #231a00;
      }
      .avatar {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        background: #374151;
        font-weight: 700;
      }
      /* Mobile */
      .menu-btn {
        display: none;
        background: transparent;
        color: #fff;
        border: 1px solid #4b5563;
        border-radius: 8px;
        padding: 4px 8px;
        cursor: pointer;
      }
      @media (max-width: 720px) {
        .menu-btn {
          display: block;
        }
        .nav {
          display: none;
          position: absolute;
          left: 0;
          right: 0;
          top: 50px;
          background: #0f172a;
          padding: 8px 16px;
        }
        .nav.open {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
      }
      /* A11y helpers */
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
    `,
  ],
})
export class HeaderComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  user = computed<User | null>(() => this.auth.user());
  role = computed<'rider' | 'driver' | 'admin' | null>(() => this.user()?.role ?? null);

  mobileOpen = signal(false);
  toggleMobileNav() {
    this.mobileOpen.update(v => !v);
  }

  isRiderOrAdmin = () => this.role() === 'rider' || this.role() === 'admin';
  isDriverOrAdmin = () => this.role() === 'driver' || this.role() === 'admin';

  initials = () => {
    const name = this.user()?.name ?? '';
    const [a, b] = name.split(' ');
    return (a?.[0] ?? '').concat(b?.[0] ?? '').toUpperCase() || '👤';
    // Alternative simple : return (this.user()?.name ?? 'U')[0].toUpperCase();
  };

  async logout() {
    this.auth.logout();
    await this.router.navigateByUrl('/home');
  }
}
