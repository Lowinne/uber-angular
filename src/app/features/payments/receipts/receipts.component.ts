import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Payment } from '../../../mock-api/db/payments.seed';

@Component({
  standalone: true,
  selector: 'app-receipts',
  imports: [CommonModule],
  template: `
    <section class="wrap">
      <h2>Reçus</h2>
      <ul class="list">
        <li *ngFor="let p of payments()">
          <span>#{{ p.receiptNumber ?? p.id }}</span>
          <span>Trip {{ p.tripId }}</span>
          <span>{{ p.amount | number: '1.2-2' }} {{ p.currency }}</span>
          <span [class.ok]="p.status === 'succeeded'">{{ p.status }}</span>
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
      .list li {
        display: grid;
        grid-template-columns: 160px 1fr 160px 120px;
        gap: 8px;
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        padding: 8px 12px;
      }
      .ok {
        color: #16a34a;
        font-weight: 600;
      }
    `,
  ],
})
export class ReceiptsComponent implements OnInit {
  private http = inject(HttpClient);
  payments = signal<Payment[]>([]);

  async ngOnInit() {
    try {
      const list = await this.http.get<Payment[]>('/api/payments').toPromise();
      this.payments.set(list ?? []);
    } catch {
      this.payments.set([]);
    }
  }
}
