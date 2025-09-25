import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { Trip } from '../../../mock-api/db/trips.seed';
import { firstValueFrom } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-driver-history',
  imports: [CommonModule],
  template: `
    <section class="wrap">
      <h2>Historique des courses (driver)</h2>

      <ul class="list">
        <li *ngFor="let t of items()">
          <div class="row">
            <span>#{{ t.id }}</span>
            <span class="badge" [class]="t.status">{{ t.status }}</span>
            <span *ngIf="t.price !== null">{{ t.price | number: '1.2-2' }} €</span>
            <span>Rider #{{ t.riderId }}</span>
            <span
              >{{ t.startedAt | date: 'short' }} →
              {{ t.endedAt ? (t.endedAt | date: 'short') : '—' }}</span
            >
          </div>
        </li>
      </ul>
    </section>
  `,
  styles: [
    `
      .wrap {
        padding: 24px;
        display: grid;
        gap: 12px;
      }
      .list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        gap: 8px;
      }
      .row {
        display: grid;
        grid-template-columns: 90px 120px 120px 120px 1fr;
        gap: 8px;
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        padding: 8px 12px;
      }
      .badge {
        padding: 2px 8px;
        border-radius: 999px;
        text-transform: capitalize;
        background: #eef2ff;
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
    `,
  ],
})
export class DriverHistoryComponent implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  items = signal<Trip[]>([]);

  async ngOnInit() {
    const user = this.auth.user();
    if (!user) return;

    // Il n'y a pas (encore) d’endpoint /trips?driverId=...
    // On récupère toutes les courses et on filtre côté front
    const all = await firstValueFrom(this.http.get<Trip[]>('/api/trips/all'));
    this.items.set(all.filter(t => t.driverId === user.id));
  }
}
