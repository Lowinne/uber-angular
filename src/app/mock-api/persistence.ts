import { Payment, PaymentMethod } from './db/payments.seed';
import { Trip } from './db/trips.seed';
import { User } from './db/users.seed';
import { Vehicle } from './db/vehicles.seed';

// src/app/mock-api/persistence.ts
export const MOCK_DB_KEY = '__uber_clone_mock_db__';
export const MOCK_DB_VERSION = 1;

export interface MockDbShape {
  __version: number;
  users: User[];
  vehicles: Vehicle[];
  trips: Trip[];
  payments: Payment[];
  paymentMethods: PaymentMethod[];
}

export function loadDbFromStorage(): MockDbShape | null {
  try {
    const raw = localStorage.getItem(MOCK_DB_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.__version !== MOCK_DB_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveDbToStorage(db: MockDbShape) {
  try {
    localStorage.setItem(MOCK_DB_KEY, JSON.stringify(db));
  } catch {
    // ignore quota errors in demo
  }
}
