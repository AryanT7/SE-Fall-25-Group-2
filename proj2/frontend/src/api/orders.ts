import { apiClient } from './client';
import { Order, PlaceOrderRequest, OrderStatus } from './types';

// Orders API Functions
export const ordersApi = {
  /**
   * Place an order from current cart
   */
  async placeOrder(orderData: PlaceOrderRequest): Promise<{ data?: Order; error?: string }> {
    return apiClient.post<Order>('/orders/place', orderData);
  },

  /**
   * Get user's orders
   */
  async getMyOrders(): Promise<{ data?: Order[]; error?: string }> {
    return apiClient.get<Order[]>('/orders/my');
  },

  /**
   * Get a specific order by ID
   */
  async getOrder(orderId: number): Promise<{ data?: Order; error?: string }> {
    return apiClient.get<Order>(`/orders/${orderId}`);
  },

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: number): Promise<{ data?: { message: string }; error?: string }> {
    return apiClient.post(`/orders/${orderId}/cancel`);
  },

  /**
   * Get orders for a specific cafe (Staff/Owner only)
   */
  async getCafeOrders(cafeId: number, status?: OrderStatus): Promise<{ data?: Order[]; error?: string }> {
    const endpoint = status 
      ? `/orders/${cafeId}?status=${status}` 
      : `/orders/${cafeId}`;
    return apiClient.get<Order[]>(endpoint);
  },

  /**
   * Update order status (Staff/Owner only)
   */
  async updateOrderStatus(orderId: number, status: OrderStatus): Promise<{ data?: Order; error?: string }> {
    // ✅ Send status as query parameter, not body
    return apiClient.post<Order>(`/orders/${orderId}/status?new_status=${status}`, {});
  },
  
  /**
   * Get order tracking information
   */
  async trackOrder(orderId: number): Promise<{ data?: any; error?: string }> {
    return apiClient.get(`/orders/${orderId}/track`);
  },
};

// Export individual functions for convenience
export const {
  placeOrder,
  getMyOrders,
  getOrder,
  cancelOrder,
  getCafeOrders,
  updateOrderStatus,
  trackOrder,
} = ordersApi;

