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
import { PaymentMethod, PaymentMethodType } from '../../../mock-api/db/payments.seed';
import { firstValueFrom } from 'rxjs';

type AddMethodForm = FormGroup<{
  userId: FormControl<number>;
  type: FormControl<PaymentMethodType>;
  brand: FormControl<string>;
  last4: FormControl<string>;
  expMonth: FormControl<number>;
  expYear: FormControl<number>;
  label: FormControl<string>;
  isDefault: FormControl<boolean>;
}>;

@Component({
  standalone: true,
  selector: 'app-add-method',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="wrap">
      <h2>Ajouter un moyen de paiement</h2>

      <form [formGroup]="form" (ngSubmit)="save()">
        <label for="type">Type</label>
        <select id="type" formControlName="type">
          <option value="card">Carte</option>
          <option value="cash">Cash</option>
          <option value="paypal">PayPal</option>
        </select>

        <div *ngIf="form.controls.type.value === 'card'" class="grid2">
          <label for="brand" class="sr-only">Marque</label>
          <input id="brand" placeholder="Marque (Visa…)" formControlName="brand" />

          <label for="last4" class="sr-only">Derniers 4</label>
          <input id="last4" placeholder="Derniers 4 (4242)" formControlName="last4" maxlength="4" />

          <label for="expMonth" class="sr-only">Mois</label>
          <input id="expMonth" placeholder="MM" formControlName="expMonth" type="number" />

          <label for="expYear" class="sr-only">Année</label>
          <input id="expYear" placeholder="YYYY" formControlName="expYear" type="number" />
        </div>

        <label for="label">Label</label>
        <input id="label" placeholder="Label (ex: Visa perso)" formControlName="label" />

        <div class="row">
          <input id="isDefault" type="checkbox" formControlName="isDefault" />
          <label for="isDefault">Défaut</label>
        </div>

        <button [disabled]="form.invalid || loading()">Enregistrer</button>
      </form>

      <p class="ok" *ngIf="saved()">Moyen de paiement enregistré ✅</p>
    </section>
  `,
  styles: [
    `
      .wrap {
        padding: 24px;
        display: grid;
        gap: 12px;
        max-width: 520px;
        margin: 0 auto;
      }
      form {
        display: grid;
        gap: 8px;
      }
      .grid2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        align-items: center;
      }
      .row {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      input,
      select {
        padding: 10px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
      }
      button {
        padding: 10px 14px;
        border: none;
        border-radius: 10px;
        background: #111827;
        color: white;
        cursor: pointer;
      }
      .ok {
        color: #16a34a;
      }
      /* utilitaire pour labels invisibles mais accessibles */
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
    `,
  ],
})
export class AddMethodComponent {
  private fb = inject(NonNullableFormBuilder);
  private http = inject(HttpClient);

  loading = signal(false);
  saved = signal(false);

  form: AddMethodForm = this.fb.group({
    userId: this.fb.control(1, { validators: [Validators.required] }),
    type: this.fb.control<PaymentMethodType>('card', { validators: [Validators.required] }),
    brand: this.fb.control(''),
    last4: this.fb.control(''),
    expMonth: this.fb.control(12),
    expYear: this.fb.control(2027),
    label: this.fb.control(''),
    isDefault: this.fb.control(false),
  });

  async save() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.saved.set(false);
    try {
      const payload: PaymentMethod = {
        ...this.form.getRawValue(),
        createdAt: new Date().toISOString(),
        id: Date.now(), // côté in-memory-web-api, l'id peut aussi être auto, mais on le pose ici.
      };
      await firstValueFrom(this.http.post<PaymentMethod>('/api/paymentMethods', payload));
      this.saved.set(true);
    } finally {
      this.loading.set(false);
    }
  }
}
