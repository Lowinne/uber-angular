import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { passwordMatchValidator } from '../../../shared/validators/password-match.validator';

type Role = 'rider' | 'driver' | 'admin';

@Component({
  standalone: true,
  selector: 'app-register-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="wrap">
      <h2>Créer un compte</h2>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <label for="name">Nom</label>
        <input id="name" type="text" formControlName="name" placeholder="Alice Demo" />
        <div class="err" *ngIf="form.controls.name.invalid && form.controls.name.touched">
          Nom requis
        </div>

        <label for="email">Email</label>
        <input id="email" type="email" formControlName="email" placeholder="alice@demo.com" />
        <div class="err" *ngIf="form.controls.email.invalid && form.controls.email.touched">
          Email invalide
        </div>

        <div class="row">
          <div class="col">
            <label for="password">Mot de passe</label>
            <input id="password" type="password" formControlName="password" />
            <div
              class="err"
              *ngIf="form.controls.password.invalid && form.controls.password.touched"
            >
              Requis (min. 6)
            </div>
          </div>
          <div class="col">
            <label for="confirm">Confirmation</label>
            <input id="confirm" type="password" formControlName="confirm" />
            <div
              class="err"
              *ngIf="form.hasError('passwordMismatch') && form.controls.confirm.touched"
            >
              Les mots de passe ne correspondent pas
            </div>
          </div>
        </div>

        <label for="role">Rôle</label>
        <select id="role" formControlName="role">
          <option value="rider">Rider</option>
          <option value="driver">Driver</option>
          <option value="admin">Admin</option>
        </select>

        <button [disabled]="form.invalid || loading()">Créer le compte</button>
        <div class="err" *ngIf="error()">{{ error() }}</div>
      </form>

      <p>Déjà un compte ? <a routerLink="/auth/login">Se connecter</a></p>
    </section>
  `,
  styles: [
    `
      .wrap {
        max-width: 520px;
        margin: 48px auto;
        display: grid;
        gap: 12px;
      }
      form {
        display: grid;
        gap: 8px;
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
      input,
      select {
        padding: 10px;
        border: 1px solid #ddd;
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
      button[disabled] {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .err {
        color: #b00020;
        font-size: 0.9rem;
      }
    `,
  ],
})
export class RegisterPageComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group(
    {
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm: ['', [Validators.required]],
      role: ['rider' as Role, [Validators.required]],
    },
    { validators: passwordMatchValidator('password', 'confirm') }
  );

  async onSubmit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    try {
      const { name, email, password, role } = this.form.value as {
        name: string;
        email: string;
        password: string;
        role: Role;
      };
      await this.auth.register({ name, email, password, role });
      // redirection simple (tu peux router selon le rôle)
      this.router.navigateByUrl('/home');
    } catch (e) {
      this.error.set('Impossible de créer le compte');
    } finally {
      this.loading.set(false);
    }
  }
}
