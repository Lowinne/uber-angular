// src/app/mock-api/mock-api.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { InMemoryDataService } from './in-memory-data.service';
import { MOCK_DB_KEY } from './persistence';
import { firstValueFrom } from 'rxjs';
import { User } from './db/users.seed';
import { NearbyDriver } from './db/vehicles.seed';
import { Trip } from './db/trips.seed';

describe('Mock API (InMemoryDataService)', () => {
  let http: HttpClient;

  // augmente un peu si besoin
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

  beforeEach(async () => {
    // Reset DB persistée
    try {
      localStorage.removeItem(MOCK_DB_KEY);
    } catch {
      /**do nothing */
    }

    await TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        HttpClientInMemoryWebApiModule.forRoot(InMemoryDataService, {
          delay: 0, // IMPORTANT pour tests rapides
          apiBase: '/api',
          passThruUnknownUrl: true,
        }),
      ],
    }).compileComponents();

    http = TestBed.inject(HttpClient);
  });

  // Helpers
  const apiPost = <T>(url: string, body?: unknown) => firstValueFrom(http.post<T>(url, body ?? {}));
  const apiGet = <T>(url: string) => firstValueFrom(http.get<T>(url));

  describe('Auth', () => {
    it('connexion avec les credentials de démo (alice@demo.com / demo123)', async () => {
      const res = await apiPost<{ token: string; user: User }>('/api/auth/login', {
        email: 'alice@demo.com',
        password: 'demo123',
      });

      expect(res.token).toBeTruthy();
      expect(res.user).toBeTruthy();
      expect(res.user.email).toBe('alice@demo.com');
      expect(res.user.role).toBe('rider');
      expect(res.user.password).toBeUndefined(); // masqué par l’API
    });

    it('rejette des credentials erronés (401)', async () => {
      let caught: HttpErrorResponse | null = null;
      try {
        await apiPost('/api/auth/login', { email: 'wrong@demo', password: 'non' });
      } catch (e) {
        caught = e as HttpErrorResponse;
      }
      expect(caught).toBeTruthy();
      expect(caught!.status).toBe(401);
    });
  });

  describe('Trips', () => {
    const riderId = 1; // seed
    const vehicleId = 1; // seed
    const pickup = { lat: 48.8566, lng: 2.3522 };
    const dropoff = { lat: 48.8738, lng: 2.295 };

    it('doit retourner un devis', async () => {
      const res = await apiPost<{ distanceKm: number; durationMin: number; price: number }>(
        '/api/trips/quote',
        { pickup, dropoff, category: 'X' }
      );

      expect(typeof res.distanceKm).toBe('number');
      expect(typeof res.durationMin).toBe('number');
      expect(typeof res.price).toBe('number');
      expect(res.price).toBeGreaterThan(0);
    });

    it('démarre un trajet puis le retrouve via /trips/current', async () => {
      const started = await apiPost<Trip>('/api/trips/start', {
        userId: riderId,
        pickup,
        dropoff,
        vehicleId,
      });
      expect(started.status).toBe('ongoing');
      expect(started.riderId).toBe(riderId);

      const current = await apiGet<Trip>(`/api/trips/current?riderId=${riderId}`);
      expect(current).toBeTruthy();
      expect(current.status).toBe('ongoing');
      expect(current.id).toBe(started.id);
    });

    it('termine un trajet, /trips/current devient null, et l’historique est filtré', async () => {
      const started = await apiPost<Trip>('/api/trips/start', {
        userId: riderId,
        pickup,
        dropoff,
        vehicleId,
      });
      const ended = await apiPost<Trip>('/api/trips/end', { tripId: started.id });
      expect(ended.status).toBe('completed');

      const current = await apiGet<Trip>(`/api/trips/current?riderId=${riderId}`);
      expect(current).toBeFalsy();

      const history = await apiGet<Trip[]>(`/api/trips?riderId=${riderId}`);
      expect(Array.isArray(history)).toBeTrue();
      const found = history.find(t => t.id === started.id);
      expect(found).toBeTruthy();
      expect(found!.status).toBe('completed');
    });
  });

  describe('Drivers', () => {
    it('retourne des chauffeurs proches avec véhicule et ETA', async () => {
      const drivers = await apiPost<NearbyDriver[]>('/api/drivers/nearby', {});
      expect(Array.isArray(drivers)).toBeTrue();
      expect(drivers.length).toBeGreaterThan(0);
      const d = drivers[0];
      expect(d.id).toEqual(jasmine.any(Number));
      expect(d.name).toEqual(jasmine.any(String));
      expect(d.etaMin).toEqual(jasmine.any(Number));
      expect(d.vehicle).toBeTruthy();
      expect(typeof d.lat).toBe('number');
      expect(typeof d.lng).toBe('number');
    });
  });
});
