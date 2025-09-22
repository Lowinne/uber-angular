import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-driver-home',
  imports: [CommonModule, RouterLink],
  template: `
    <section class="wrap">
      <h2>Tableau de bord chauffeur</h2>

      <div class="card" *ngIf="user(); else needLogin">
        <p>
          Bienvenue, <strong>{{ user()!.name }}</strong>
        </p>
        <nav class="actions">
          <a routerLink="/driver/current-trip">Trajet en cours</a>
          <a routerLink="/driver/earnings">Gains</a>
        </nav>
      </div>

      <ng-template #needLogin>
        <p>Veuillez vous connecter.</p>
      </ng-template>
    </section>
  `,
  styles: [
    `
      .wrap {
        padding: 24px;
        display: grid;
        gap: 12px;
      }
      .card {
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 16px;
      }
      .actions {
        display: flex;
        gap: 12px;
      }
      a {
        text-decoration: none;
      }
    `,
  ],
})
export class DriverHomeComponent {
  private auth = inject(AuthService);
  user = computed(() => this.auth.user());
}
