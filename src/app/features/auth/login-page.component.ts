import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  Validators,
  NonNullableFormBuilder,
  FormGroup,
  FormControl,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

type LoginForm = FormGroup<{
  email: FormControl<string>;
  password: FormControl<string>;
}>;

@Component({
  standalone: true,
  selector: 'app-login-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="wrap">
      <h2>Connexion</h2>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <label for="email">Email</label>
        <input id="email" formControlName="email" type="email" placeholder="alice@demo.com" />
        <div class="err" *ngIf="form.controls.email.invalid && form.controls.email.touched">
          Email requis
        </div>

        <label for="password">Mot de passe</label>
        <input id="password" formControlName="password" type="password" placeholder="demo123" />
        <div class="err" *ngIf="form.controls.password.invalid && form.controls.password.touched">
          Mot de passe requis
        </div>

        <button [disabled]="form.invalid || loading()">Se connecter</button>
        <div class="err" *ngIf="error()">{{ error() }}</div>
      </form>

      <p class="hint">
        Comptes de démo : <code>alice&#64;demo.com / demo123</code> ou
        <code>bob&#64;demo.com / demo123</code>
      </p>
      <a routerLink="/home">Retour accueil</a>
    </section>
  `,
  styles: [
    `
      .wrap {
        max-width: 420px;
        margin: 48px auto;
        display: grid;
        gap: 12px;
      }
      form {
        display: grid;
        gap: 8px;
      }
      input {
        padding: 10px;
        border-radius: 8px;
        border: 1px solid #ddd;
      }
      button {
        padding: 10px 14px;
        border-radius: 10px;
        border: none;
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
      .hint {
        color: #555;
        font-size: 0.9rem;
      }
    `,
  ],
})
export class LoginPageComponent {
  private fb = inject(NonNullableFormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);

  // ✅ Typed Reactive Forms (pas de any)
  form: LoginForm = this.fb.group({
    email: this.fb.control<string>('', { validators: [Validators.required, Validators.email] }),
    password: this.fb.control<string>('', { validators: [Validators.required] }),
  });

  async onSubmit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    try {
      const { email, password } = this.form.getRawValue(); // ✅ types sûrs: string/string
      await this.auth.login(email, password);
      await this.router.navigateByUrl('/rider/request');
    } catch (e: unknown) {
      // ✅ pas de any
      this.error.set('Identifiants invalides');
    } finally {
      this.loading.set(false);
    }
  }
}
