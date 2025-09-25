// src/app/features/driver/requests/requests.component.ts
import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { Trip } from '../../../mock-api/db/trips.seed';
import { firstValueFrom, interval, Subscription } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-driver-requests',
  imports: [CommonModule],
  template: `
    <section class="wrap" aria-labelledby="title">
      <h2 id="title">Demandes en attente</h2>

      <div class="toolbar">
        <button (click)="refresh()" [disabled]="loading()">Rafraîchir</button>
        <label class="poll">
          <input
            type="checkbox"
            [checked]="polling()"
            (change)="togglePolling($event)"
            aria-label="Activer le polling automatique"
          />
          Polling auto (2s)
        </label>
      </div>

      <ul class="list" *ngIf="pending().length; else empty">
        <li *ngFor="let t of pending(); trackBy: trackById">
          <div class="line">
            <div class="info">
              <div class="title">
                <strong>Course #{{ t.id }}</strong>
                <span class="badge">rider #{{ t.riderId }}</span>
              </div>
              <div class="meta">
                {{ t.distanceKm ?? '?' }} km · ~{{ t.durationMin ?? '?' }} min ·
                {{ t.price | number: '1.2-2' }} €
              </div>
            </div>

            <button class="accept" (click)="accept(t)" [disabled]="loading()">Accepter</button>
          </div>
        </li>
      </ul>

      <ng-template #empty>
        <p>Aucune demande pour le moment.</p>
      </ng-template>

      <p class="err" *ngIf="error()">{{ error() }}</p>
    </section>
  `,
  styles: [
    /* ...tes styles inchangés... */
  ],
})
export class DriverRequestsComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  pending = signal<Trip[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  private sub?: Subscription;
  polling = signal(true);

  async ngOnInit() {
    await this.refresh();
    this.startPolling();
  }
  ngOnDestroy() {
    this.stopPolling();
  }

  trackById = (_: number, t: Trip) => t.id;

  private startPolling() {
    if (this.polling() && !this.sub) {
      this.sub = interval(2000).subscribe(() => {
        void this.refresh();
      });
    }
  }
  private stopPolling() {
    this.sub?.unsubscribe();
    this.sub = undefined;
  }

  // ✅ cast done in TS, not in the template
  togglePolling(evt: Event) {
    const input = evt.target as HTMLInputElement | null;
    const checked = !!input?.checked;
    this.polling.set(checked);
    this.stopPolling();
    this.startPolling();
  }

  async refresh() {
    this.error.set(null);
    try {
      const list = await firstValueFrom(this.http.get<Trip[]>('/api/trips/pending'));
      this.pending.set(list);
    } catch {
      this.error.set('Impossible de charger les demandes');
    }
  }

  async accept(t: Trip) {
    const user = this.auth.user();
    if (!user) {
      this.error.set('Non connecté');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    try {
      await firstValueFrom(
        this.http.post<Trip>('/api/trips/accept', {
          tripId: t.id,
          driverId: user.id,
          vehicleId: 1,
        })
      );
      await this.refresh();
    } catch {
      this.error.set('Échec de l’acceptation (déjà prise ?)');
    } finally {
      this.loading.set(false);
    }
  }
}
