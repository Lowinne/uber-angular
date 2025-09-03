// src/app/mock-api/in-memory-data.service.ts
import { InMemoryDbService, RequestInfo, ResponseOptions } from 'angular-in-memory-web-api';

import { usersSeed } from './db/users.seed';
import { vehiclesSeed } from './db/vehicles.seed';
import { tripsSeed } from './db/trips.seed';
import { loadDbFromStorage, saveDbToStorage, MockDbShape, MOCK_DB_VERSION } from './persistence';

export class InMemoryDataService implements InMemoryDbService {
  // Helper typé (on caste depuis la DB interne de la lib)
  private getDb(reqInfo: RequestInfo): MockDbShape {
    return reqInfo.utils.getDb() as unknown as MockDbShape;
  }

  private persistDb(reqInfo: RequestInfo) {
    const db = this.getDb(reqInfo);
    saveDbToStorage(db);
  }

  // NB: pas de générique => on déclare any pour satisfaire l'interface,
  // mais on retourne bien notre MockDbShape.
  createDb(): MockDbShape {
    const persisted = loadDbFromStorage();
    if (persisted) return persisted;

    const initial: MockDbShape = {
      __version: MOCK_DB_VERSION,
      users: usersSeed(),
      vehicles: vehiclesSeed(),
      trips: tripsSeed(),
      payments: [],
      paymentMethods: [],
    };
    saveDbToStorage(initial);
    return initial;
  }

  // ===== Custom endpoints =====
  post(reqInfo: RequestInfo) {
    const { url } = reqInfo;
    if (url.endsWith('/auth/login')) return this.login(reqInfo);
    if (url.endsWith('/trips/quote')) return this.tripQuote(reqInfo);
    if (url.endsWith('/trips/start')) return this.startTrip(reqInfo);
    if (url.endsWith('/trips/end')) return this.endTrip(reqInfo);
    if (url.endsWith('/drivers/nearby')) return this.nearbyDrivers(reqInfo);
    return undefined; // défaut: CRUD auto
  }

  get(reqInfo: RequestInfo) {
    const { url } = reqInfo;

    // /api/trips?riderId=1  -> historique
    if (url.includes('/trips') && reqInfo.query.has('riderId') && !url.includes('/trips/current')) {
      const riderId = Number(reqInfo.query.get('riderId')![0]);
      const trips = this.getDb(reqInfo).trips.filter(t => t.riderId === riderId);
      return reqInfo.utils.createResponse$(() => ({ status: 200, body: trips }));
    }

    // /api/trips/current?riderId=1 -> current trip for rider
    if (url.includes('/trips/current') && reqInfo.query.has('riderId')) {
      const riderId = Number(reqInfo.query.get('riderId')![0]);
      const trips = this.getDb(reqInfo).trips;
      const current = trips.find(
        t => t.riderId === riderId && (t.status === 'requested' || t.status === 'ongoing')
      );

      // S'il n'y a pas de trajet en cours → 204 No Content (pas de body)
      if (!current) {
        return reqInfo.utils.createResponse$(() => ({ status: 204 }));
      }

      // Sinon → 200 + Trip
      return reqInfo.utils.createResponse$(() => ({ status: 200, body: current }));
    }

    return undefined;
  }

  // ===== Handlers =====
  private login(reqInfo: RequestInfo) {
    const { email, password } = reqInfo.utils.getJsonBody(reqInfo.req) as {
      email: string;
      password: string;
    };
    const users = this.getDb(reqInfo).users;
    const user = users.find(u => u.email === email && u.password === password);

    const options: ResponseOptions = user
      ? { status: 200, body: { token: 'mock.jwt.token', user: { ...user, password: undefined } } }
      : { status: 401, body: { message: 'Invalid credentials' } };

    return reqInfo.utils.createResponse$(() => options);
  }

  private tripQuote(reqInfo: RequestInfo) {
    const { pickup, dropoff, category } = reqInfo.utils.getJsonBody(reqInfo.req) as {
      pickup: { lat: number; lng: number };
      dropoff: { lat: number; lng: number };
      category: 'X' | 'XL';
    };

    const distanceKm = Math.max(
      1,
      Math.round(Math.hypot((pickup.lat - dropoff.lat) * 111, (pickup.lng - dropoff.lng) * 75)) ||
        2 + Math.random() * 10
    );

    const durationMin = Math.round(distanceKm * (3.5 + Math.random() * 1.5));
    const base = category === 'XL' ? 2.0 : 1.0;
    const price = +(base * (2.5 + distanceKm * 1.4) + Math.random() * 2).toFixed(2);

    return reqInfo.utils.createResponse$(() => ({
      status: 200,
      body: { distanceKm, durationMin, price },
    }));
  }

  private startTrip(reqInfo: RequestInfo) {
    const { userId, pickup, dropoff, vehicleId } = reqInfo.utils.getJsonBody(reqInfo.req) as {
      userId: number;
      pickup: { lat: number; lng: number; address: string };
      dropoff: { lat: number; lng: number; address: string };
      vehicleId: number;
    };

    const db = this.getDb(reqInfo);
    const newTrip = {
      id: Date.now(),
      riderId: userId,
      driverId: db.vehicles.find(v => v.id === vehicleId)?.driverId ?? 2,
      vehicleId,
      pickup,
      dropoff,
      status: 'ongoing' as const,
      startedAt: new Date().toISOString(),
      etaMin: 2 + Math.floor(Math.random() * 6),
      price: +(8 + Math.random() * 12).toFixed(2),
    };

    db.trips.push(newTrip);
    this.persistDb(reqInfo);

    return reqInfo.utils.createResponse$(() => ({ status: 201, body: newTrip }));
  }

  private endTrip(reqInfo: RequestInfo) {
    const { tripId } = reqInfo.utils.getJsonBody(reqInfo.req) as { tripId: number };
    const db = this.getDb(reqInfo);
    const trip = db.trips.find(t => t.id === tripId);

    if (!trip) {
      return reqInfo.utils.createResponse$(() => ({
        status: 404,
        body: { message: 'Trip not found' },
      }));
    }

    trip.status = 'completed';
    trip.endedAt = new Date().toISOString();
    this.persistDb(reqInfo);

    return reqInfo.utils.createResponse$(() => ({ status: 200, body: trip }));
  }

  private nearbyDrivers(reqInfo: RequestInfo) {
    const db = this.getDb(reqInfo);
    const drivers = db.users.filter(u => u.role === 'driver');
    const enriched = drivers.map(d => ({
      id: d.id,
      name: d.name,
      rating: d.rating ?? 4.7,
      vehicle: db.vehicles.find(v => v.driverId === d.id),
      etaMin: 1 + Math.floor(Math.random() * 6),
      lat: 48.85 + (Math.random() - 0.5) * 0.05,
      lng: 2.35 + (Math.random() - 0.5) * 0.08,
    }));

    return reqInfo.utils.createResponse$(() => ({ status: 200, body: enriched }));
  }

  // Laisse le CRUD par défaut, mais persiste après écriture
  put(reqInfo: RequestInfo) {
    setTimeout(() => this.persistDb(reqInfo));
    return undefined;
  }
  patch(reqInfo: RequestInfo) {
    setTimeout(() => this.persistDb(reqInfo));
    return undefined;
  }
  delete(reqInfo: RequestInfo) {
    setTimeout(() => this.persistDb(reqInfo));
    return undefined;
  }
}
