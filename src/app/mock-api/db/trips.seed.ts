// src/app/mock-api/db/trips.seed.ts
export type TripStatus = 'requested' | 'ongoing' | 'completed' | 'canceled';

export interface LatLng {
  lat: number;
  lng: number;
  address?: string;
}

export interface Trip {
  id: number;
  riderId: number;
  driverId?: number;
  vehicleId?: number;
  pickup: LatLng;
  dropoff: LatLng;
  status: TripStatus;
  price?: number;
  etaMin?: number;
  startedAt?: string;
  endedAt?: string;
  distanceKm?: number;
  durationMin?: number;
}

export const tripsSeed = (): Trip[] => [
  {
    id: 1001,
    riderId: 1,
    driverId: 2,
    vehicleId: 1,
    pickup: { lat: 48.8566, lng: 2.3522, address: 'Paris Hôtel de Ville' },
    dropoff: { lat: 48.8738, lng: 2.295, address: 'Arc de Triomphe' },
    status: 'completed',
    price: 13.8,
    distanceKm: 6.2,
    durationMin: 18,
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    endedAt: new Date(Date.now() - 1000 * 60 * 60 * 23.7).toISOString(),
  },
];
