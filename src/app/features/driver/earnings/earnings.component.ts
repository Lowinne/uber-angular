import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { Payment } from '../../../mock-api/db/payments.seed';

@Component({
  standalone: true,
  selector: 'app-driver-earnings',
  imports: [CommonModule],
  template: `
    <section class="wrap">
      <h2>Mes gains</h2>

      <div class="toolbar">
        <button (click)="refresh()" [disabled]="loading()">Rafraîchir</button>
        <span *ngIf="loading()">Chargement…</span>
        <span class="err" *ngIf="error()">{{ error() }}</span>
      </div>

      <p *ngIf="total() > 0; else none">
        Total encaissé : <strong>{{ total() | number: '1.2-2' }} €</strong>
      </p>
      <ng-template #none>
        <p>Aucun gain enregistré.</p>
      </ng-template>

      <ul class="list">
        <li *ngFor="let p of payments()">
          #{{ p.id }} · {{ p.amount ?? 0 | number: '1.2-2' }} {{ p.currency }} ({{ p.status }}) ·
          {{ p.createdAt | date: 'short' }}
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
      .toolbar {
        display: flex;
        gap: 12px;
        align-items: center;
      }
      .list {
        list-style: none;
        padding: 0;
        display: grid;
        gap: 6px;
      }
      .err {
        color: #b00020;
      }
    `,
  ],
})
export class EarningsComponent implements OnInit {
  private auth = inject(AuthService);
  private http = inject(HttpClient);

  payments = signal<Payment[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  total = computed(() => {
    return this.payments().reduce((acc, p) => acc + (p.amount ?? 0), 0);
  });

  async ngOnInit() {
    await this.refresh();
  }

  async refresh() {
    const user = this.auth.user();
    if (!user) {
      this.payments.set([]);
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    try {
      // ⚠️ on filtre côté API
      const list = await firstValueFrom(
        this.http.get<Payment[]>(`/api/payments?driverId=${user.id}`)
      );
      this.payments.set(list ?? []);
    } catch {
      this.error.set('Impossible de charger les gains');
      this.payments.set([]);
    } finally {
      this.loading.set(false);
    }
  }
}
