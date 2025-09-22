import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { RouterLink } from '@angular/router';
import { Trip } from '../../../mock-api/db/trips.seed';
import { firstValueFrom } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-driver-current-trip',
  imports: [CommonModule, RouterLink],
  template: `
    <section class="wrap">
      <h2>Trajet en cours (chauffeur)</h2>

      <div *ngIf="trip(); else noTrip" class="card">
        <p><strong>ID:</strong> {{ trip()!.id }}</p>
        <p><strong>Rider:</strong> #{{ trip()!.riderId }}</p>
        <p><strong>Status:</strong> {{ trip()!.status }}</p>
        <p><strong>Prix:</strong> {{ trip()!.price ?? '—' }} €</p>
        <button (click)="finish()" [disabled]="loading()">Terminer le trajet</button>
      </div>

      <ng-template #noTrip>
        <p>Aucun trajet en cours.</p>
        <a routerLink="/driver/home">Retour</a>
      </ng-template>

      <div class="err" *ngIf="error()">{{ error() }}</div>
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
        display: grid;
        gap: 6px;
      }
      button {
        padding: 8px 12px;
        border: none;
        border-radius: 8px;
        background: #111827;
        color: white;
        cursor: pointer;
      }
      .err {
        color: #b00020;
      }
    `,
  ],
})
export class CurrentTripComponent implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  loading = signal(false);
  error = signal<string | null>(null);
  trip = signal<Trip | null>(null);

  user = computed(() => this.auth.user());

  async ngOnInit() {
    try {
      const current = await firstValueFrom(
        this.http.get<Trip | null>('/api/trips/current?riderId=1')
      );
      this.trip.set(current); // current est Trip | null, pile ce qu'attend le signal
    } catch {
      this.error.set('Impossible de récupérer le trajet en cours.');
    }
  }

  async finish() {
    const t = this.trip();
    if (!t) return;

    this.loading.set(true);
    this.error.set(null);
    try {
      const ended = await firstValueFrom(this.http.post<Trip>('/api/trips/end', { tripId: t.id }));
      this.trip.set(ended); // ended est bien un Trip typé
    } catch {
      this.error.set('Impossible de terminer le trajet.');
    } finally {
      this.loading.set(false);
    }
  }
}
