import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-home-page',
  imports: [CommonModule, RouterLink],
  template: `
    <section class="container">
      <h1>Uber Clone</h1>
      <p>Bienvenue ! Démo front + backend mock.</p>

      <ng-container *ngIf="user(); else guest">
        <div class="card">
          <p>
            Connecté en tant que <strong>{{ user()!.name }}</strong> ({{ user()!.role }})
          </p>
          <div class="actions">
            <a routerLink="/rider/request">Commander un trajet</a>
            <button (click)="logout()">Se déconnecter</button>
          </div>
        </div>
      </ng-container>

      <ng-template #guest>
        <div class="card">
          <p>Vous n'êtes pas connecté.</p>
          <a routerLink="/auth/login">Se connecter</a>
        </div>
      </ng-template>
    </section>
  `,
  styles: [
    `
      .container {
        padding: 24px;
        display: grid;
        gap: 16px;
      }
      .card {
        padding: 16px;
        border: 1px solid #ddd;
        border-radius: 12px;
        display: flex;
        gap: 12px;
        align-items: center;
        justify-content: space-between;
      }
      .actions {
        display: flex;
        gap: 12px;
      }
      a {
        text-decoration: none;
      }
      button {
        cursor: pointer;
      }
    `,
  ],
})
export class HomePageComponent {
  private auth = inject(AuthService);
  user = computed(() => this.auth.user());
  logout() {
    this.auth.logout();
  }
}
