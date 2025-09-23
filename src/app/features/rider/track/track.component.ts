// src/app/features/rider/track.component.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { Trip } from '../../../mock-api/db/trips.seed';
import { firstValueFrom, interval, Subscription } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-rider-track',
  imports: [CommonModule],
  template: `
    <section class="wrap">
      <h2>Suivi de votre course</h2>
      <ng-container *ngIf="trip(); else waiting">
        <p><strong>Statut :</strong> {{ trip()!.status }}</p>
        <p *ngIf="trip()!.status === 'ongoing'">Un chauffeur a accepté votre demande 🚗</p>
        <p *ngIf="trip()!.status === 'completed'">Course terminée ✅</p>
      </ng-container>
      <ng-template #waiting>
        <p>Demande envoyée… en attente d’un chauffeur</p>
      </ng-template>
    </section>
  `,
  styles: ['.wrap{padding:24px}'],
})
export class TrackComponent implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  trip = signal<Trip | null>(null);
  private sub?: Subscription;

  async ngOnInit() {
    const user = this.auth.user();
    if (!user) return;
    await this.refresh(user.id);
    this.sub = interval(2000).subscribe(() => this.refresh(user.id));
  }
  async refresh(riderId: number) {
    const res = await firstValueFrom(
      this.http.get<Trip | null>(`/api/trips/current?riderId=${riderId}`)
    );
    this.trip.set(res);
  }
}
