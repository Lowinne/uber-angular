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

  private syncDb(reqInfo: RequestInfo) {
    const persisted = loadDbFromStorage();
    if (!persisted || persisted.__version !== MOCK_DB_VERSION) return;

    const db = this.getDb(reqInfo);
    // on remplace le contenu de la DB en mémoire par le dernier persisté
    db.users = persisted.users;
    db.vehicles = persisted.vehicles;
    db.trips = persisted.trips;
    db.payments = persisted.payments;
    db.paymentMethods = persisted.paymentMethods;
  }

  // ===== Custom endpoints =====
  post(reqInfo: RequestInfo) {
    this.syncDb(reqInfo);
    const { url } = reqInfo;
    if (url.endsWith('/auth/login')) return this.login(reqInfo);
    if (url.endsWith('/trips/quote')) return this.tripQuote(reqInfo);
    if (url.endsWith('/trips/start')) return this.startTrip(reqInfo);
    if (url.endsWith('/trips/end')) return this.endTrip(reqInfo);
    if (url.endsWith('/drivers/nearby')) return this.nearbyDrivers(reqInfo);
    if (url.endsWith('/trips/request')) return this.requestTrip(reqInfo);
    if (url.endsWith('/trips/accept')) return this.acceptTrip(reqInfo);

    return undefined; // défaut: CRUD auto
  }

  get(reqInfo: RequestInfo) {
    this.syncDb?.(reqInfo);

    const { url, query, collectionName } = reqInfo;
    const path = url.split('?')[0]; // <-- retire la query string

    console.warn('[MOCK get] url=', url, ' path=', path, ' query=', query);

    // ===== PAYMENTS =====
    if (collectionName === 'payments' || path.endsWith('/payments')) {
      const db = this.getDb(reqInfo);

      if (query.has('driverId')) {
        const driverId = Number(query.get('driverId')![0]);
        const list = db.payments.filter(p => p.driverId === driverId);
        return reqInfo.utils.createResponse$(() => ({ status: 200, body: list }));
      }

      if (query.has('riderId')) {
        const riderId = Number(query.get('riderId')![0]);
        const list = db.payments.filter(p => p.riderId === riderId);
        return reqInfo.utils.createResponse$(() => ({ status: 200, body: list }));
      }

      // par défaut: tout
      return reqInfo.utils.createResponse$(() => ({ status: 200, body: db.payments }));
    }

    // ===== le reste de tes handlers GET =====
    // utilise désormais 'path' quand tu fais des endsWith
    if (path.endsWith('/trips/pending')) {
      const list = this.getDb(reqInfo).trips.filter(t => t.status === 'requested');
      return reqInfo.utils.createResponse$(() => ({ status: 200, body: list }));
    }

    if (path.includes('/trips/current-for-driver') && query.has('driverId')) {
      const driverId = Number(query.get('driverId')![0]);
      const trips = this.getDb(reqInfo).trips;
      const current = trips.find(t => t.driverId === driverId && t.status === 'ongoing');
      if (!current) return reqInfo.utils.createResponse$(() => ({ status: 204 }));
      return reqInfo.utils.createResponse$(() => ({ status: 200, body: current }));
    }

    if (path.includes('/trips') && query.has('driverId') && !path.includes('/trips/current')) {
      const driverId = Number(query.get('driverId')![0]);
      const trips = this.getDb(reqInfo).trips.filter(t => t.driverId === driverId);
      return reqInfo.utils.createResponse$(() => ({ status: 200, body: trips }));
    }

    if (collectionName === 'trips' && query.has('riderId') && !query.has('current')) {
      const riderId = Number(query.get('riderId')![0]);
      const trips = this.getDb(reqInfo).trips.filter(t => t.riderId === riderId);
      return reqInfo.utils.createResponse$(() => ({ status: 200, body: trips }));
    }

    if (path.includes('/trips/current') && query.has('riderId')) {
      const riderId = Number(query.get('riderId')![0]);
      const trips = this.getDb(reqInfo).trips;
      const current = trips.find(
        t => t.riderId === riderId && (t.status === 'requested' || t.status === 'ongoing')
      );
      if (!current) return reqInfo.utils.createResponse$(() => ({ status: 204 }));
      return reqInfo.utils.createResponse$(() => ({ status: 200, body: current }));
    }

    // endpoint debug pratique
    if (path.endsWith('/trips/all')) {
      const list = this.getDb(reqInfo).trips;
      return reqInfo.utils.createResponse$(() => ({ status: 200, body: list }));
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

  private computeQuote(
    pickup: { lat: number; lng: number },
    dropoff: { lat: number; lng: number },
    category: 'X' | 'XL'
  ) {
    const distanceKm = Math.max(
      1,
      Math.round(Math.hypot((pickup.lat - dropoff.lat) * 111, (pickup.lng - dropoff.lng) * 75)) ||
        2 + Math.random() * 10
    );
    const durationMin = Math.round(distanceKm * (3.5 + Math.random() * 1.5));
    const base = category === 'XL' ? 2.0 : 1.0;
    const price = +(base * (2.5 + distanceKm * 1.4) + Math.random() * 2).toFixed(2);
    return { distanceKm, durationMin, price };
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

    // Crée un paiement si pas déjà fait
    const already = db.payments.find(p => p.tripId === trip.id);
    if (!already) {
      const amount =
        typeof trip.price === 'number' ? trip.price : +(8 + Math.random() * 12).toFixed(2);
      db.payments.push({
        id: Date.now(),
        tripId: trip.id,
        riderId: trip.riderId,
        driverId: trip.driverId ?? undefined,
        amount,
        currency: 'EUR',
        provider: 'mock',
        status: 'succeeded',
        createdAt: new Date().toISOString(),
        receiptNumber:
          'R-' +
          Math.floor(Math.random() * 1_000_000)
            .toString()
            .padStart(6, '0'),
      });
    }

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

  // Rider crée une demande (status: requested)
  private requestTrip(reqInfo: RequestInfo) {
    const { userId, pickup, dropoff, category } = reqInfo.utils.getJsonBody(reqInfo.req) as {
      userId: number;
      pickup: { lat: number; lng: number };
      dropoff: { lat: number; lng: number };
      category: 'X' | 'XL';
    };
    const db = this.getDb(reqInfo);
    const q = this.computeQuote(pickup, dropoff, category);

    const trip = {
      id: Date.now(),
      riderId: userId,
      pickup,
      dropoff,
      status: 'requested' as const,
      price: q.price,
      etaMin: 2 + Math.floor(Math.random() * 6),
      distanceKm: q.distanceKm,
      durationMin: q.durationMin,
      // driverId/vehicleId vides tant que non accepté
    };
    db.trips.push(trip);
    this.persistDb(reqInfo);
    return reqInfo.utils.createResponse$(() => ({ status: 201, body: trip }));
  }

  // Liste des demandes en attente, éventuellement filtrables plus tard
  private pendingTrips(reqInfo: RequestInfo) {
    const db = this.getDb(reqInfo);
    const list = db.trips.filter(t => t.status === 'requested');
    return reqInfo.utils.createResponse$(() => ({ status: 200, body: list }));
  }

  // Driver accepte une demande → assignation + status: ongoing
  private acceptTrip(reqInfo: RequestInfo) {
    const { tripId, driverId, vehicleId } = reqInfo.utils.getJsonBody(reqInfo.req) as {
      tripId: number;
      driverId: number;
      vehicleId: number;
    };
    const db = this.getDb(reqInfo);
    const trip = db.trips.find(t => t.id === tripId);
    if (!trip) {
      return reqInfo.utils.createResponse$(() => ({
        status: 404,
        body: { message: 'Trip not found' },
      }));
    }
    // sécurité basique : ne pas accepter deux fois
    if (trip.status !== 'requested') {
      return reqInfo.utils.createResponse$(() => ({
        status: 409,
        body: { message: 'Trip already taken' },
      }));
    }

    trip.status = 'ongoing';
    trip.driverId = driverId;
    trip.vehicleId = vehicleId;
    trip.startedAt = new Date().toISOString();

    this.persistDb(reqInfo);
    return reqInfo.utils.createResponse$(() => ({ status: 200, body: trip }));
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
