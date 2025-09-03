// src/app/mock-api/db/users.seed.ts
export type UserRole = 'rider' | 'driver' | 'admin';

export interface User {
  id: number;
  role: UserRole;
  name: string;
  email: string;
  password: string;
  rating?: number;
}

// Utilisateur mocker
export const usersSeed = (): User[] => [
  {
    id: 1,
    role: 'rider',
    name: 'Alice Martin',
    email: 'alice@demo.com',
    password: 'demo123',
    rating: 4.9,
  },
  {
    id: 2,
    role: 'driver',
    name: 'Bob Leroy',
    email: 'bob@demo.com',
    password: 'demo123',
    rating: 4.8,
  },
  {
    id: 3,
    role: 'driver',
    name: 'Carla Dupont',
    email: 'carla@demo.com',
    password: 'demo123',
    rating: 4.7,
  },
  {
    id: 4,
    role: 'rider',
    name: 'David Kim',
    email: 'david@demo.com',
    password: 'demo123',
    rating: 4.6,
  },
  { id: 5, role: 'admin', name: 'Admin', email: 'admin@demo.com', password: 'admin', rating: 5.0 },
];
