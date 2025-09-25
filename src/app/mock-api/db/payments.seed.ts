// src/app/mock-api/db/payments.seed.ts

export type Currency = 'EUR' | 'USD' | 'GBP';
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded' | 'canceled';
export type PaymentProvider = 'mock' | 'stripe' | 'paypal' | 'apple_pay' | 'google_pay';
export type PaymentMethodType = 'card' | 'cash' | 'paypal';

export interface PaymentMethod {
  id: number;
  userId: number; // owner of the method (rider)
  type: PaymentMethodType;
  brand?: string; // for cards: Visa/Mastercard…
  last4?: string; // for cards
  expMonth?: number; // for cards
  expYear?: number; // for cards
  label?: string; // "Visa perso", "Cash", etc.
  isDefault?: boolean;
  createdAt: string;
}

export interface Payment {
  id: number;
  riderId: number; // who pays
  tripId: number; // link to a trip
  driverId?: number;
  methodId?: number; // link to PaymentMethod
  amount?: number; // in currency units (e.g. EUR)
  currency: Currency;
  provider: PaymentProvider; // gateway (mock/stripe…)
  status: PaymentStatus;
  createdAt: string;
  capturedAt?: string;
  refundedAt?: string;
  receiptNumber?: string;
}

export const paymentMethodsSeed = (): PaymentMethod[] => [
  {
    id: 9001,
    userId: 1,
    type: 'card',
    brand: 'Visa',
    last4: '4242',
    expMonth: 12,
    expYear: 2027,
    label: 'Visa perso',
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 9002,
    userId: 1,
    type: 'cash',
    label: 'Cash',
    isDefault: false,
    createdAt: new Date().toISOString(),
  },
];

export const paymentsSeed = (): Payment[] => [
  {
    id: 8001,
    riderId: 1,
    driverId: 2,
    tripId: 1001,
    methodId: 9001,
    amount: 13.8,
    currency: 'EUR',
    provider: 'mock',
    status: 'succeeded',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    capturedAt: new Date(Date.now() - 1000 * 60 * 60 * 23.8).toISOString(),
    receiptNumber: 'R-2025-0001',
  },
];
