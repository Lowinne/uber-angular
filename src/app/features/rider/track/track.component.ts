import { Component, OnDestroy, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { Trip } from '../../../mock-api/db/trips.seed';
import { firstValueFrom, interval, Subscription, switchMap } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-rider-track',
  imports: [CommonModule],
  template: `
    <section class="wrap">
      <h2>Suivi de votre course</h2>

      <ng-container *ngIf="trip(); else waiting">
        <div class="card">
          <p><strong>ID:</strong> {{ trip()!.id }}</p>
          <p>
            <strong>Statut:</strong>
            <span class="badge" [class]="trip()!.status">{{ trip()!.status }}</span>
          </p>
          <p *ngIf="trip()!.price !== null">
            <strong>Estimation:</strong> {{ trip()!.price | number: '1.2-2' }} €
          </p>
          <p *ngIf="trip()!.etaMin"><strong>ETA:</strong> ~{{ trip()!.etaMin }} min</p>

          <div class="row">
            <button (click)="refresh()" [disabled]="loading()">Rafraîchir</button>
            <button (click)="cancel()" [disabled]="loading()">Annuler</button>
          </div>
        </div>
      </ng-container>

      <ng-template #waiting>
        <p>Aucune course en cours ou en attente.</p>
      </ng-template>

      <p class="err" *ngIf="error()">{{ error() }}</p>
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
        gap: 8px;
      }
      .row {
        display: flex;
        gap: 8px;
      }
      .badge {
        padding: 2px 8px;
        border-radius: 999px;
        background: #eef2ff;
        text-transform: capitalize;
      }
      .badge.requested {
        background: #fff7ed;
        color: #9a3412;
      }
      .badge.ongoing {
        background: #ecfeff;
        color: #155e75;
      }
      .badge.completed {
        background: #ecfdf5;
        color: #166534;
      }
      .badge.cancelled_by_rider,
      .badge.cancelled_by_driver {
        background: #fee2e2;
        color: #991b1b;
      }
      .err {
        color: #b00020;
      }
    `,
  ],
})
export class TrackComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  trip = signal<Trip | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  private sub?: Subscription;
  userId = computed(() => this.auth.user()?.id ?? null);

  ngOnInit() {
    void this.refresh();
    this.sub = interval(2000)
      .pipe(
        switchMap(() => this.http.get<Trip | null>(`/api/trips/current?riderId=${this.userId()}`))
      )
      .subscribe({
        next: t => this.trip.set(t),
        error: () => {
          /* ignore erreurs ponctuelles */
        },
      });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  async refresh() {
    const id = this.userId();
    if (!id) return;
    try {
      const t = await firstValueFrom(
        this.http.get<Trip | null>(`/api/trips/current?riderId=${id}`)
      );
      this.trip.set(t);
    } catch {
      this.error.set('Impossible de charger le suivi');
    }
  }

  async cancel() {
    const t = this.trip();
    if (!t) return;
    this.loading.set(true);
    this.error.set(null);
    try {
      await firstValueFrom(
        this.http.post<Trip>('/api/trips/cancel', {
          tripId: t.id,
          by: 'rider',
          reason: 'Changement de plan',
        })
      );
      await this.refresh();
    } catch {
      this.error.set('Échec de l’annulation');
    } finally {
      this.loading.set(false);
    }
  }
}
