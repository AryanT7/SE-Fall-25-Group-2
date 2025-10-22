// src/api/payments.ts
// Mirrors payments.py exactly: POST /payments/{order_id}

import { apiClient } from './client';

export interface Payment {
  id: number;
  order_id: number;
  amount: number;
  status: string;     // e.g. "PAID"
  provider: string;   // e.g. "MOCK"
  created_at?: string;
}

/**
 * Create a payment for a given order.
 * Backend route: POST /payments/{order_id}
 * Auth required.
 */
export const paymentsApi = {
  createPayment: (orderId: number) =>
    apiClient.post<Payment>(`/payments/${orderId}`),
};

// Named export for convenience
export const { createPayment } = paymentsApi;
