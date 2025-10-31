import { apiClient } from './client';
import { CartAddRequest, CartSummary, CartOut, CartAddItem } from './types';

// Cart API Functions
export const cartApi = {
  /**
   * Get cart details
   */
  async getCart(): Promise<{ data?: CartOut; error?: string }> {
    return apiClient.get('/cart');
  },

  /**
   * Get detailed cart items (manually constructed from /cart/summary)
   */
  async getCartItems(): Promise<{ data?: any[]; error?: string }> {
    try {
      // Since backend doesn't have /cart/items, we'll use /cart/summary
      const summaryRes = await apiClient.get('/cart/summary');
      if (summaryRes.error) {
        return { error: summaryRes.error };
      }

      // Transform summary data into cart items format
      const summary = summaryRes.data as any;
      const items: any[] = [];
      
      // Extract items from by_person structure
      if (summary.by_person) {
        Object.entries(summary.by_person).forEach(([email, data]: [string, any]) => {
          // We'll need to make individual items from this
          // For now, return a simplified structure
          items.push({
            assignee_email: email,
            calories: data.calories,
            price: data.price,
          });
        });
      }

      return { data: items };
    } catch (error: any) {
      console.error('❌ Cart items error:', error);
      return { error: error.message || 'Failed to fetch cart items' };
    }
  },

  /**
   * Add an item to the cart
   */
  async addToCart(data: CartAddItem): Promise<{ data?: { status: string }; error?: string }> {
    return apiClient.post('/cart/add', data);
  },

  /**
   * Get cart summary with calories and prices
   */
  async getSummary(): Promise<{ data?: CartSummary; error?: string }> {
    return apiClient.get('/cart/summary');
  },

  /**
   * Update item quantity in cart (not supported by backend yet)
   */
  async updateItemQuantity(cartItemId: number, quantity: number): Promise<{ data?: any; error?: string }> {
    // Backend doesn't have this endpoint, return error
    return { error: 'Update quantity not supported yet. Please remove and re-add item.' };
  },

  /**
   * Remove an item from cart (not supported by backend yet)
   */
  async removeItem(cartItemId: number): Promise<{ data?: { message: string }; error?: string }> {
    // Backend doesn't have this endpoint, return error
    return { error: 'Remove item not supported yet. Please clear cart instead.' };
  },

  /**
   * Clear all items from cart
   */
  async clearCart(): Promise<{ data?: { status: string }; error?: string }> {
    return apiClient.delete('/cart/clear');
  },
};

// Export individual functions for convenience
export const {
  addToCart,
  getSummary,
  updateItemQuantity,
  removeItem,
  clearCart,
  getCartItems,
} = cartApi;