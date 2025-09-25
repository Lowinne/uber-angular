import { Component, inject, OnInit, signal, computed, effect } from '@angular/core';
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

      <!-- Toast de feedback quand le total augmente -->
      <div *ngIf="flash()" class="toast">+{{ flash()!.delta | number: '1.2-2' }} € reçu</div>

      <p [class.pulse]="isPulsing()" *ngIf="total() > 0; else none">
        Total encaissé :
        <strong>{{ total() | number: '1.2-2' }} €</strong>
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
      .toast {
        align-self: start;
        background: #ecfdf5;
        color: #166534;
        border: 1px solid #bbf7d0;
        padding: 8px 12px;
        border-radius: 10px;
        font-weight: 600;
        width: fit-content;
        animation: fadein 0.2s ease-out;
      }
      .pulse strong {
        animation: pulse 0.6s ease-in-out 3;
      }
      @keyframes pulse {
        0% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.05);
        }
        100% {
          transform: scale(1);
        }
      }
      @keyframes fadein {
        from {
          opacity: 0;
          transform: translateY(-6px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class EarningsComponent implements OnInit {
  private auth = inject(AuthService);
  private http = inject(HttpClient);

  // state
  payments = signal<Payment[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // derived
  total = computed(() => this.payments().reduce((acc, p) => acc + (p.amount ?? 0), 0));

  // UI feedback (piloté par effect)
  private lastTotal = signal<number>(0);
  flash = signal<{ delta: number } | null>(null);
  isPulsing = signal(false);

  constructor() {
    // 🎬 EFFECT VISUEL : déclenché à chaque changement de total
    effect(() => {
      const prev = this.lastTotal();
      const now = this.total();

      if (now > prev) {
        const delta = +(now - prev).toFixed(2);
        this.flash.set({ delta });
        this.isPulsing.set(true);

        // masque le toast après 2,5 s et stoppe le pulse
        setTimeout(() => this.flash.set(null), 2500);
        setTimeout(() => this.isPulsing.set(false), 2500);
      }
      // mémorise la dernière valeur pour la prochaine comparaison
      this.lastTotal.set(now);
    });
  }

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
      // On filtre côté API
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
