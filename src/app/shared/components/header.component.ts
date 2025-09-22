import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="header">
      <div class="left">
        <a routerLink="/home" class="brand">🚖 Uber Clone</a>
        <nav class="nav">
          <a routerLink="/home" routerLinkActive="active">Accueil</a>
          <a routerLink="/rider/request" routerLinkActive="active">Commander</a>
        </nav>
      </div>

      <div class="right" *ngIf="user(); else guest">
        <span class="user">Bonjour, {{ user()!.name }}</span>
        <button (click)="logout()">Se déconnecter</button>
      </div>

      <ng-template #guest>
        <div class="right">
          <a routerLink="/auth/login">Se connecter</a>
        </div>
      </ng-template>
    </header>
  `,
  styles: [
    `
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 24px;
        background: #111827;
        color: white;
        border-radius: 30px;
      }
      .brand {
        font-weight: bold;
        font-size: 1.2rem;
        color: white;
        text-decoration: none;
      }
      .nav {
        margin-left: 24px;
        display: flex;
        gap: 16px;
      }
      .nav a {
        color: #d1d5db;
        text-decoration: none;
        font-weight: 500;
      }
      .nav a.active {
        color: white;
        border-bottom: 2px solid white;
        padding-bottom: 2px;
      }
      .right {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      button {
        background: #ef4444;
        border: none;
        padding: 6px 12px;
        border-radius: 6px;
        color: white;
        cursor: pointer;
      }
      button:hover {
        background: #dc2626;
      }
    `,
  ],
})
export class HeaderComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  user = computed(() => this.auth.user());

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/home');
  }
}
