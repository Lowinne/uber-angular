import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  Validators,
  NonNullableFormBuilder,
  FormGroup,
  FormControl,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { firstValueFrom } from 'rxjs';
import { Trip } from '../../mock-api/db/trips.seed';

type Category = 'X' | 'XL';

interface QuoteResponse {
  distanceKm: number;
  durationMin: number;
  price: number;
}

type RequestRideForm = FormGroup<{
  pickupLat: FormControl<number>;
  pickupLng: FormControl<number>;
  dropoffLat: FormControl<number>;
  dropoffLng: FormControl<number>;
  category: FormControl<Category>;
}>;

@Component({
  standalone: true,
  selector: 'app-request-ride',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="wrap">
      <h2>Commander un trajet</h2>

      <form [formGroup]="form" (ngSubmit)="getQuote()">
        <div class="row">
          <div class="col">
            <label for="pickupLat">Départ (lat,lng)</label>
            <div class="grid2">
              <input
                id="pickupLat"
                type="number"
                formControlName="pickupLat"
                step="0.0001"
                placeholder="48.8566"
              />
              <input
                id="pickupLng"
                type="number"
                formControlName="pickupLng"
                step="0.0001"
                placeholder="2.3522"
              />
            </div>
          </div>
          <div class="col">
            <label for="dropoffLat">Arrivée (lat,lng)</label>
            <div class="grid2">
              <input
                id="dropoffLat"
                type="number"
                formControlName="dropoffLat"
                step="0.0001"
                placeholder="48.8738"
              />
              <input
                id="dropoffLng"
                type="number"
                formControlName="dropoffLng"
                step="0.0001"
                placeholder="2.2950"
              />
            </div>
          </div>
        </div>

        <label for="category">Catégorie</label>
        <select id="category" formControlName="category">
          <option value="X">UberX</option>
          <option value="XL">UberXL</option>
        </select>

        <button class="primary" type="submit" [disabled]="form.invalid || loading()">
          Obtenir un devis
        </button>
      </form>

      <div *ngIf="quote()" class="card">
        <p>
          <strong>Estimation :</strong>
          {{ quote()!.price | number: '1.2-2' }} € · {{ quote()!.distanceKm }} km ·
          {{ quote()!.durationMin }} min
        </p>
        <button class="success" (click)="confirmRide()" [disabled]="loading()">Confirmer</button>
        <button class="ghost" (click)="resetQuote()" [disabled]="loading()">Annuler</button>
      </div>

      <div class="err" *ngIf="error()">{{ error() }}</div>
    </section>
  `,
  styles: [
    `
      .wrap {
        max-width: 720px;
        margin: 24px auto;
        display: grid;
        gap: 16px;
      }
      form {
        display: grid;
        gap: 12px;
      }
      .row {
        display: flex;
        gap: 12px;
      }
      .col {
        flex: 1;
        display: grid;
        gap: 8px;
      }
      .grid2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      input,
      select {
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 8px;
      }
      .primary {
        background: #111827;
        color: white;
      }
      .success {
        background: #16a34a;
        color: white;
      }
      .ghost {
        background: transparent;
        border: 1px solid #ddd;
      }
      button {
        padding: 10px 14px;
        border-radius: 10px;
        border: none;
        cursor: pointer;
      }
      .card {
        padding: 16px;
        border: 1px solid #ddd;
        border-radius: 12px;
        display: flex;
        gap: 12px;
        align-items: center;
      }
      .err {
        color: #b00020;
      }
    `,
  ],
})
export class RequestRideComponent {
  private fb = inject(NonNullableFormBuilder);
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);
  quote = signal<QuoteResponse | null>(null);

  // ✅ Typed Reactive Form (zéro any)
  form: RequestRideForm = this.fb.group({
    pickupLat: this.fb.control(48.8566, { validators: [Validators.required] }),
    pickupLng: this.fb.control(2.3522, { validators: [Validators.required] }),
    dropoffLat: this.fb.control(48.8738, { validators: [Validators.required] }),
    dropoffLng: this.fb.control(2.295, { validators: [Validators.required] }),
    category: this.fb.control<Category>('X', { validators: [Validators.required] }),
  });

  private buildPayload() {
    const v = this.form.getRawValue(); // {pickupLat:number,...,category:Category}
    return {
      pickup: { lat: v.pickupLat, lng: v.pickupLng },
      dropoff: { lat: v.dropoffLat, lng: v.dropoffLng },
      category: v.category,
    };
  }

  async getQuote() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    try {
      const res = await firstValueFrom(
        this.http.post<QuoteResponse>('/api/trips/quote', this.buildPayload())
      );
      this.quote.set(res);
    } catch (e: unknown) {
      this.error.set('Impossible d’obtenir un devis');
    } finally {
      this.loading.set(false);
    }
  }

  resetQuote() {
    this.quote.set(null);
  }

  async confirmRide() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/auth/login');
      return;
    }
    const user = this.auth.user();
    if (!user) return;

    this.loading.set(true);
    this.error.set(null);
    try {
      const v = this.form.getRawValue();
      const started = await firstValueFrom(
        this.http.post<Trip>('/api/trips/start', {
          userId: user.id,
          pickup: { lat: v.pickupLat, lng: v.pickupLng },
          dropoff: { lat: v.dropoffLat, lng: v.dropoffLng },
          vehicleId: 1,
        })
      );
      // Pour la démo on retourne à l’accueil ; sinon router vers /rider/track
      await this.router.navigateByUrl('/home');
    } catch (e: unknown) {
      this.error.set('Impossible de démarrer le trajet');
    } finally {
      this.loading.set(false);
    }
  }
}
