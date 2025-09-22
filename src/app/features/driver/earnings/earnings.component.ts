import { Component, inject, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Payment } from '../../../mock-api/db/payments.seed';

@Component({
  standalone: true,
  selector: 'app-driver-earnings',
  imports: [CommonModule],
  template: `
    <section class="wrap">
      <h2>Gains</h2>

      <div class="summary">
        <div><strong>Total courses:</strong> {{ payments().length }}</div>
        <div><strong>Total €:</strong> {{ total() | number: '1.2-2' }}</div>
      </div>

      <ul class="list">
        <li *ngFor="let p of payments()">
          <span>#{{ p.id }}</span>
          <span>Trip {{ p.tripId }}</span>
          <span>{{ p.amount | number: '1.2-2' }} {{ p.currency }}</span>
          <span [class.ok]="p.status === 'succeeded'">{{ p.status }}</span>
        </li>
      </ul>

      <div class="hint">
        NB : démo — on récupère toutes les entrées de paiement mock (côté rider). Dans un vrai back,
        filtrer par driverId.
      </div>
    </section>
  `,
  styles: [
    `
      .wrap {
        padding: 24px;
        display: grid;
        gap: 12px;
      }
      .summary {
        display: flex;
        gap: 24px;
      }
      .list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        gap: 8px;
      }
      .list li {
        display: grid;
        grid-template-columns: 80px 1fr 120px 100px;
        gap: 8px;
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        padding: 8px 12px;
      }
      .ok {
        color: #16a34a;
        font-weight: 600;
      }
      .hint {
        color: #6b7280;
        font-size: 0.9rem;
      }
    `,
  ],
})
export class EarningsComponent implements OnInit {
  private auth = inject(AuthService);
  private http = inject(HttpClient);

  payments = signal<Payment[]>([]);
  total = computed(() =>
    this.payments().reduce((s, p) => s + (p.status === 'succeeded' ? p.amount : 0), 0)
  );

  async ngOnInit() {
    // Démo : lit toute la collection /api/payments (mock CRUD par défaut)
    try {
      const list = await this.http.get<Payment[]>('/api/payments').toPromise();
      this.payments.set(list ?? []);
    } catch {
      this.payments.set([]);
    }
  }
}
