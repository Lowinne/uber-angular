// src/app/mock-api/db/vehicles.seed.ts
export interface Vehicle {
  id: number;
  driverId: number;
  make: string;
  model: string;
  plate: string;
  category: 'X' | 'XL';
  seats: number;
  color: string;
}

export const vehiclesSeed = (): Vehicle[] => [
  {
    id: 1,
    driverId: 2,
    make: 'Toyota',
    model: 'Prius',
    plate: 'AB-123-CD',
    category: 'X',
    seats: 4,
    color: 'black',
  },
  {
    id: 2,
    driverId: 3,
    make: 'Volkswagen',
    model: 'Sharan',
    plate: 'EF-456-GH',
    category: 'XL',
    seats: 6,
    color: 'white',
  },
];
